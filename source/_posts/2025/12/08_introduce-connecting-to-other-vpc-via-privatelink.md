---
title: PrivateLinkで別VPCのALBと通信できるようにする方法
date: 2025-12-08 09:00:00
updated: 2025-12-08 09:00:00
tags:
  - 解説
  - 技術解説
  - Advent Calendar
  - AWS
  - Terraform
categories:
  - Technology
  - Infrastructure
toc: true
has_gallery: true
has_code: true
has_icon: false
og_image: /images/technology/infrastructure/title.webp
thumbnail: /images/thumbnails/technology/terraform_thumbnail.webp
cover:
  image: /images/technology/infrastructure/cover.webp
  sources:
    small: /images/technology/infrastructure/cover_small.webp
    medium: /images/technology/infrastructure/cover_medium.webp
    large: /images/technology/infrastructure/cover_large.webp
---

自分の VPC から外部の VPC にある ALB に対して、インターネットを介さずに通信できるインフラ環境を、Terraform で構築する方法をご紹介します。

<!-- more -->

{% message color:info %}
この記事は、[mediba Advent Calendar 2025](https://qiita.com/advent-calendar/2025/mediba) と [terraform Advent Calendar 2025](https://qiita.com/advent-calendar/2025/terraform) の 9 日目にエントリーしています。
{% endmessage %}

## はじめに

{% message color:warning %}
本記事でご紹介する方法は、Resource VPC Endpoint と VPC Lattice Resource Gateway を組み合わせる最新の方法ではありませんので、ご注意ください。
{% endmessage %}

### 目的・ゴール

この記事を読み終わった後に、AWS PrivateLink 経由で、他の任意の VPC にある ALB にアクセスできる AWS 環境のインフラを構築できていること。

### 読者ターゲット

ALB や ECS などのアプリケーションサーバーを複製することなく、なるべく最小のインフラ構成の変更だけで、外部にあるシステムと内部にあるシステムの両方からアクセスできるようにしたい人。

## AWS PrivateLink とは

AWS PrivateLink は、任意の VPC のサブネットから、マネージドサービス（Amazon CloudWatch Logs、Amazon ECR や Amazon S3 など）や他の任意の VPC のサブネットにあるリソースと、インターネットを経由することなく、プライベートに接続するためのサービスです。

### メリット・デメリット

マネージドサービスと接続する場合は、NAT Gateway の通信費を大幅にカットできる強力なメリットがあることから、デメリットはないものと考えて良さそうです。そのため、ここでは、任意の VPC のサブネットにあるリソースと接続する場合におけるメリットとデメリットについて述べます。
以降では、「自 VPC（接続する側）」を「Service Consumer」とし、「他 VPC（接続される側）」を「Service Provider」と表記します。

#### メリット

1. Service Consumer と Service Provider は、互いの VPC CIDR Block（IPアドレス重複）を気にしなくてよい。
2. Service Consumer は、Internet Gateway や NAT Gateway が不要で、パブリック IP アドレスのための Elastic IP も不要（注：インターネット経由で外部システムとも通信する場合を除く）。
3. Service Provider は、外部システム向けの CloudFront と Internet-Facing ALB の組み合わせ構成を変更することなく、内部システムとの連携にも後から対応できる。

#### デメリット

1. Service Provider が HTTPS リスナーのみの Internet-Facing ALB の場合、SSL サーバー証明書の取り扱いを間違うと、Service Consumer から接続できない。
2. Service Provider は、ALB を使用している場合は NLB 経由で接続するように構成する必要があり、発生する料金がその分だけ少し高くなる。

### 他の方法との比較

AWS PrivateLink と同様のソリューションとして、Amazon VPC Lattice と AWS Transit Gateway の 2 つの方法があります。ここでは、AWS PrivateLink とこれらの方法との比較を簡単に述べます。

#### Amazon VPC Lattice

Amazon VPC Lattice は、AWS PrivateLink と比べて固定費用が安いことに加え、NLB も不要のため、構築に必要なリソースを少なくできます。ただし、データ処理量が多ければ多いほど、AWS PrivateLink よりデータ処理費用がかかるようになり、コストメリットが無くなります。
また、現時点では、Amazon VPC Lattice で使用できる ALB に制約がかけられていて、Internal ALB（内部向け）のみとなっている点に注意が必要です。
ゆえに、データ処理量が少なく、外部システムと連携しない API などのシステムで、ランニングコストを最小にしたい場合は、最適なアプローチになります。

#### AWS Transit Gateway

例えば、検証環境や本番環境など環境ごとに VPC があり、他の任意の VPC にあるリソースへアクセスを集約して管理したい場合に、AWS Transit Gateway は有効な手段です。
しかし、アクセスを集約して管理することが目的でなければ、運用上の単一障害点となりうることがデメリットであるため、より高い保全性を求められる場合は、この手段を採用しない方がよいでしょう。

## Terraform で構築する

{% message color:warning %}
このセクションの Terraform で実装したソースコードは参考程度のものであり、そのまま本番環境に利用することはオススメしません。
{% endmessage %}

このセクションでは、Service Provider と Service Consumer を Terraform で実装するサンプルコードをご紹介します。

### アーキテクチャ図

以下は、実際に AWS 環境で作成するリソースのうち最低限必要なもの（例えば、Service Provider の ALB の先には、Target Group や ECS Service が存在していますが、記事に直接関係ないものを省略しています）を、アーキテクチャ図で表したものになります。

{% gallery introduce-connecting-to-other-vpc-via-privatelink aws_architecture_diagram.svg 'AWS アーキテクチャ図' 501x391 %}{% endgallery %}

このアーキテクチャ図を基に、Service Provider と Service Consumer を Terraform で実装します。

### Service Provider の実装

VPC、Application LoadBalancer、Network LoadBalancer、VPC Endpoint Service の４種類のリソースを作成します。

#### VPC

`aws_vpc` と、パブリックサブネット用並びにプライベートサブネット用の `aws_subnet` の、計三つのリソースを作成します。各サブネットの `cidr_block` は、`var.subnets_cidr_block` から値を設定します。

```tcl vpc.tf
resource "aws_vpc" "provider" {
  cidr_block = "10.10.0.0/16"

  tags = {
    Name = "provider"
  }
}

resource "aws_subnet" "public" {
  for_each          = var.subnets_cidr_block.public
  vpc_id            = aws_vpc.provider.id
  cidr_block        = each.value
  availability_zone = "${var.region}${each.key}"

  tags = {
    Name = "provider-public-${var.region}${each.key}"
  }
}

resource "aws_subnet" "private" {
  for_each          = var.subnets_cidr_block.private
  vpc_id            = aws_vpc.provider.id
  cidr_block        = each.value
  availability_zone = "${var.region}${each.key}"

  tags = {
    Name = "provider-private-${var.region}${each.key}"
  }
}
```

```tcl vpc_variables.tf
variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "subnets_cidr_block" {
  type = object({
    public  = map(string)
    private = map(string)
  })
  default = {
    public = {
      a = "10.10.0.0/24",
      c = "10.10.1.0/24",
    },
    private = {
      a = "10.10.10.0/24",
      c = "10.10.11.0/24",
    }
  }
}
```

#### Application LoadBalancer

`aws_lb`、`aws_lb_target_group`、`security_group` のリソースを作成します。

{% message color:warning %}
`aws_lb` リソース以外は、本記事に直接関係あるリソースではないため省略します。
{% endmessage %}

```tcl alb.tf
resource "aws_lb" "alb" {
  name                       = "application-lb"
  load_balancer_type         = "application"
  subnets                    = [for subnet in aws_subnet.public : subnet.id]
  security_groups            = [aws_security_group.alb.id]
  internal                   = false
  enable_deletion_protection = true
  drop_invalid_header_fields = true
}
```

#### Network LoadBalancer

`aws_lb`、`aws_lb_target_group`、`aws_lb_target_group_attachment` のリソースを作成します。

```tcl nlb.tf
resource "aws_lb" "nlb" {
  name                       = "network-lb"
  load_balancer_type         = "network"
  subnets                    = [for subnet in aws_subnet.private : subnet.id]
  internal                   = true
  enable_deletion_protection = true
}

resource "aws_lb_target_group" "nlb" {
  name        = "network-lb-tg"
  protocol    = "TCP"
  port        = 443
  target_type = "alb"
  vpc_id      = aws_vpc.provider.id
}

resource "aws_lb_target_group_attachment" "nlb" {
  target_group_arn = aws_lb_target_group.nlb.arn
  target_id        = aws_lb.alb.arn
  port             = 443
}
```

#### VPC Endpoint Service

`aws_vpc_endpoint_service` と `aws_vpc_endpoint_service_allowed_principal` のリソースを作成します。`var.vpc_eps_allowed_account_ids` に適切な AWS アカウント ID を設定することで、クロスアカウントにできます。

```tcl vpceps.tf
resource "aws_vpc_endpoint_service" "nlb" {
  acceptance_required        = false
  network_load_balancer_arns = [aws_lb.nlb.arn]

  tags = {
    Name = "vpc-ep-service"
  }
}

resource "aws_vpc_endpoint_service_allowed_principal" "nlb" {
  for_each                = var.vpc_eps_allowed_account_ids
  vpc_endpoint_service_id = aws_vpc_endpoint_service.nlb.id
  principal_arn           = "arn:aws:iam::${each.value}:root"
}
```

```tcl vpceps_variables.tf
variable "vpc_eps_allowed_account_ids" {
  type    = map(string)
  default = {}
}
```

### Service Consumer の実装

VPC と VPC Endpoint Service の２種類のリソースを作成します。なお、VPC Endpoint Service のドメインを使いたくない場合は、Route53 を使ってカスタムドメインを設定できます。

#### VPC

`aws_vpc` と、パブリックサブネット用並びにプライベートサブネット用の `aws_subnet` の、計三つのリソースを作成します。

{% message color:warning %}
`aws_vpc` リソース以外は、本記事に直接関係あるリソースではないため省略します。
{% endmessage %}

```tcl vpc.tf
resource "aws_vpc" "consumer" {
  cidr_block = "10.20.0.0/16"

  tags = {
    Name = "consumer"
  }
}
```

#### VPC Endpoint Service

`aws_vpc_endpoint` と `aws_security_group` のリソースを作成します。`aws_vpc_endpoint` の `service_name` には、Service Provider 側の VPC Endpoint Service のリソース名を設定します。

```tcl vpcep.tf
resource "aws_vpc_endpoint" "consumer" {
  vpc_id              = aws_vpc.consumer.id
  service_name        = "com.amazonaws.vpce.ap-northeast-1.vpce-svc-xxxxxxxxxxxxxxxxx"
  vpc_endpoint_type   = "Interface"
  security_group_ids  = [aws_security_group.vpc_endpoint.id]
  subnet_ids          = [for subnet in aws_subnet.private : subnet.id]
  private_dns_enabled = false

  tags = {
    Name = "consumer-vpc-endpoint-service"
  }
}

resource "aws_security_group" "vpc_endpoint" {
  name   = "consumer-vpc-endpoint-security-grp"
  vpc_id = aws_vpc.consumer.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = aws_vpc.consumer.cidr_blok
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = aws_vpc.consumer.cidr_blok
  }

  tags = {
    Name = "consumer-vpc-endpoint-security-grp"
  }
}
```

## おわりに

PrivateLink を使うと、AWS 環境のシステム間連携がとても便利になります。Service Provider であれば、許可 IP アドレスを管理するコストを減らせますし、Service Consumer であれば、パブリック IP アドレスの発行をする必要がなくなりますので、インフラ担当者からすれば魅力的に感じられるでしょう。こういった構成を採用することで、運用コストを減らしていきたいものです。

### 参考文献

#### Documents

- [What is AWS PrivateLink?](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html)
- [What is Amazon VPC Lattice?](https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html)
- [What is Amazon VPC Transit Gateways?](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html)
- [Amazon VPC LatticeとAWS PrivateLinkのコスト比較](https://dev.classmethod.jp/articles/lattice_privatelink_cost/)

#### Terraform

- [Docs overview](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

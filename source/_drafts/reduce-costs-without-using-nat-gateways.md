---
title: NAT Gatewayを極力使わずに料金削減する3つの手法
date: 2024-11-18 09:00:00
updated: 2024-11-18 09:00:00
tags:
  - コスト削減
  - NAT Gateway
  - AWS
  - PrivateLink
  - VPC Lattice
  - Transit Gateway
categories:
  - Technology
  - Infrastructure
toc: true
has_gallery: false
has_code: false
has_icon: false
og_image: /images/technology/infrastructure/title.webp
thumbnail: /images/thumbnails/costs_thumbnail.webp
cover:
  image: /images/technology/infrastructure/cover.webp
  sources:
    small: /images/technology/infrastructure/cover_small.webp
    medium: /images/technology/infrastructure/cover_medium.webp
    large: /images/technology/infrastructure/cover_large.webp
---

記事見出し文章

<!-- more -->

## はじめに

### 料金を削減する手法

## PrivateLink

AWS PrivateLink は、とある VPC のサブネットから、マネージドサービス（Amazon CloudWatch Logs、Amazon ECR や Amazon S3 など）や他の VPC と、インターネットを経由することなく、プライベートに接続するためのサービスです。

### メリットとデメリット

マネージドサービスと接続する場合は、NAT Gateway の通信費を大幅にカットできる強力なメリットがあることから、デメリットはないものと考えて良いです。
そのため、ここでは、他の VPC と接続する場合におけるメリットとデメリットについて述べます。
以下、「自 VPC（接続する側）」を「Service Consumer」とし、「他 VPC（接続される側）」を「Service Provider」と表記します。

#### メリット

1. Service Consumer と Service Provider は、互いの VPC CIDR Block（IPアドレス重複）を気にしなくてよい。
2. Service Consumer は、Internet Gateway や NAT Gateway の配置が不要で、パブリック IP アドレスのための Elastic IP も不要（注：他システムとも通信する場合を除く）。
3. Service Provider は、外部システム向けの CloudFront+Internet-Facing ALB 構成を変更することなく、内部システムとの連携にも後から対応できる。

#### デメリット

1. Service Provider は、ALB を使用しているのであれば NLB を経由して接続するように構成する必要があり、発生する料金がその分だけ少し高くなる。
2. Service Provider が HTTPS リスナーのみの Internet-Facing ALB の場合、SSL サーバー証明書の取り扱いを間違うと、Service Consumer から接続できない。
3. Service Consumer と Service Provider の存在するリージョンが一致しない場合は、このサービスを利用することができない。

### ユースケース

#### 対マネージドサービス



#### 対 VPC



## VPC Lattice

### メリットとデメリット

#### メリット

#### デメリット

## Transit Gateway

### メリットとデメリット

#### メリット

#### デメリット

## おわりに

---
title: Docker Compose RestartでMySQLを初期化する方法
date: 2024-12-09 09:00:00
updated: 2025-01-12 20:00:00
tags:
  - 解説
  - 技術解説
  - Advent Calendar
  - Docker
  - MySQL
categories:
  - Technology
  - Infrastructure
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology/infrastructure/title.webp
thumbnail: /images/thumbnails/docker_thumbnail.webp
cover:
  image: /images/technology/infrastructure/cover.webp
  sources:
    small: /images/technology/infrastructure/cover_small.webp
    medium: /images/technology/infrastructure/cover_medium.webp
    large: /images/technology/infrastructure/cover_large.webp
---

compose.yml にひと手間を加えて、Restart コマンドで MySQL コンテナに docker-entrypoint-initdb.d を処理させる方法をご紹介します。

<!-- more -->

{% message color:info %}
この記事は、[mediba Advent Calendar 2024](https://qiita.com/advent-calendar/2024/mediba) の10日目にエントリーしています。
{% endmessage %}

## はじめに

{% message color:warning %}
この記事の方法は、Docker 公式の説明通りであれば、ファイルシステムの都合上、Windows がホストの時に動作しません（※注：動作確認は未検証）。
macOS などの Unix/Linux 系 OS だけでローカル環境を揃えられる時にご利用ください。
{% endmessage %}

この記事は、Docker Compose を使っていて、`docker compose down` コマンドと `docker compose up` コマンドを使わずに、MySQL コンテナの docker-entrypoint-initdb.d を処理させる方法を知りたい方にオススメです（ちなみに、PostgreSQL や MongoDB のコンテナでも流用可能です）。

### docker-entrypoint-initdb.d

docker-entrypoint-initdb.d は、MySQL や PostgreSQL などのデータベースコンテナで、始めて起動した時に初期化を行うための機能です。
これは、ホストにあるディレクトリやファイルを、docker-entrypoint-initdb.d 自身やその配下のファイルとしてコンテナにマウントすることで、データベースにテーブルを作成したり、データ投入したりできるため、とても使い勝手が良いです。
MySQL 公式の Docker Hub ページでは、次のように説明されています（日本語訳を付けていますが、間違えている可能性もあるので、原文をきちんと読んでください）。

> Initializing a fresh instance
> 
> When a container is started for the first time, a new database with the specified name will be created and initialized with the provided configuration variables.
> Furthermore, it will execute files with extensions .sh, .sql and .sql.gz that are found in /docker-entrypoint-initdb.d.
> Files will be executed in alphabetical order. You can easily populate your mysql services by mounting a SQL dump into that directory and provide custom images with contributed data.
> SQL files will be imported by default to the database specified by the MYSQL_DATABASE variable.
> 
> 新しいインスタンスの初期化
> 
> コンテナが始めて起動された時、指定された名前で新しいデータベースが作成され、指定された構成変数で初期化されます。
> さらに、「docker-entrypoint-initdb.d」にある「.sh」と「.sql」、「.sql.gz」の拡張子を持つファイルも、実行されます。
> ファイルは、アルファベット順に実行されます。SQL ダンプをそのディレクトリにマウントすることで、MySQL サービスの設定と、投入されたデータを含むカスタムイメージの供給が、簡単にできます。
> SQLファイルは、MYSQL_DATABASE 変数によって指定されたデータベースにデフォルトでインポートされます。
> 
> 出典：[mysql - Official Image | Docker Hub](https://hub.docker.com/_/mysql)

## 些末でも悩ましい問題

さて、MySQL のコンテナの便利な docker-entrypoint-initdb.d ですが、Docker Compose で取り扱う時には、ちょっとした不便もあります。それは、些末な不都合だけれども、使い続けると悩ましくなる、塵も積もれば山となる様な問題で、以下の2つがあります。

### 単純な再起動で初期化せず

docker-entrypoint-initdb.d は、コンテナ起動時のエントリーポイントの処理で、`/var/lib/mysql` が存在するボリュームがマウントされていなければ、実行される仕様です（処理の詳細は、[MySQL 8.0 の docker-entrypoint.sh](https://github.com/docker-library/mysql/blob/master/8.0/docker-entrypoint.sh) を参照してください）。
ゆえに、`docker compose down` 以外の `docker compose restart` や `docker compose create` などの如何なるコマンドを駆使して頑張っても、それらのコマンドはボリュームを削除しないため、MySQL コンテナは初期化処理をしてくれません。

### 匿名ボリュームのボタ山

docker-entrypoint-initdb.d で、MySQL を初期化させる度に必ず付き纏う現象があります。それは、Anonymous Volume が一つ生成されることです。
そのため、`docker compose up` と `docker compose down` のコマンドを繰り返していたら、いつの間にかゴミボリュームが大量生産され、ホストのストレージを食い潰しそうになることもあります。
名前が無いからこそ、残しておきたいボリュームと区別が面倒で、お掃除する時には思わぬ苦行を課せられるわけです。全てのボリュームを消せばいいという思い切った考えで割り切ることもできますけど、SDGs 何それ美味しいの、みたいな正直イケてない仕様です。

## 問題の解決方法の発見

とある日、私は、docker-compose.yml から compose.yml への移行のために、[Docker 公式のドキュメント](https://docs.docker.com/reference/compose-file/)で仕様を確認していました。
そこで、[Services top-level elements](https://docs.docker.com/reference/compose-file/services/) ページにある volume 属性の Long syntax セクションを読んだ時に、docker-entrypoint-initdb.d にまつわる問題の解消方法をついに発見するに至りました。

### tmpfs のマウント

今までボリューム利用やバインドマウントの簡単なものばかりだったため、`volumes` 属性の Short syntax だけを使っていました。そのため、Long Syntax であれば、tmpfs や npipe などのマウントや、追加オプションの指定ができることを知りませんでした。
このうち、tmpfs マウントは、前述した諸々の問題への解決策になります。

#### tmpfs とは何？

「tmpfs (Temporary File System)」とは、Unix 系 OS で、ファイルを一時的にメモリ上に保持するためのファイルシステムです。Docker では、コンテナで tmpfs としてマウントしたボリュームを、ホストのメモリに一時的に保持します。

#### tmpfs をどう活かすか

tmpfs の仕組み上、それをマウントしたコンテナを停止すると、それに含まれるファイルごとボリュームは揮発します。すなわち、実質的にボリューム自動削除と同じことができます。
この特性を利用すれば、MySQL のコンテナを再起動する度に、毎回新しいボリュームがマウントされる状態を作れるのです。

{% message color:warning %}
ただし、ユースケースにより、tmpfs 使用是非の判断が分かれることに注意が必要です。
例えば、少量のデータを取り扱う API などのアプリケーションの場合、tmpfs をボリュームとしてマウントして問題ありません。しかし、大量のデータを取り扱うバッチなどの場合、今までと変わらず匿名ボリュームや名前付きボリュームなどで永続化するべきです。
{% endmessage %}

### compose.yml を作ろう

それでは、tmpfs を活用した compose.yml ファイルを作って行きましょう。
前提として、MySQL の設定ファイルは `./build/docker/database/conf` ディレクトリに、初期化時に投入する SQL ファイルなどは `./build/docker/database/init` ディレクトリに、それぞれ配置されているものとします。
それを踏まえて、2025年01月時点で最新版である「Amazon Aurora MySQL 3.08.0」互換で、compose.yml ファイルを作成すると、次のようになります。

{% message color:info %}
compose.yml ファイル内で変数を使用するために、`.env` ファイルも併せて作成しています。どちらも同じディレクトリ内に配置してください。
{% endmessage %}

```yaml compose.yml
services:
  database:
    container_name: test-database
    image: mysql:8.0.39 # Aurora MySQL 3.08.0 互換
    ports:
      - '3306:3306'
    healthcheck:
      test: "mysqladmin status -h localhost -u ${MYSQL_USER} -p${MYSQL_PASSWORD}"
      start_period: 120s
      interval: 15s
      timeout: 15s
      retries: 3
    volumes:
      - type: tmpfs
        target: /var/lib/mysql
      - type: bind
        source: ./build/docker/database/conf
        target: /etc/mysql/conf.d
        read_only: true
      - type: bind
        source: ./build/docker/database/init
        target: /docker-entrypoint-initdb.d
        read_only: true
```

```text .env
MYSQL_PASSWORD=root
MYSQL_DATABASE=test
MYSQL_USER=user
MYSQL_PASSWORD=pass
```

#### Long Syntax で記述できるフィールド

`volumes` 属性の Long Syntax で記述できるフィールド（一部抜粋）は、下表の通りです。また、記載を省略しましたが、追加オプションとなるフィールドとして、`bind` や `volume` もあります。
なお、表をご覧の通り、tmpfs の追加オプションでマウントボリュームのサイズ指定できますが、どの値が良いか決めるのが面倒なので、前述の例では省略しています。

|      名前      | 設定できる値                                                                                      |
|:------------:|:--------------------------------------------------------------------------------------------|
|    `type`    | `volume` … トップレベルの volume からマウント                                                            |
|      ^^      | `bind` … ディレクトリやファイルからマウント                                                                  |
|      ^^      | `tmpfs` … ホストのメモリへマウント                                                                      |
|   `source`   | `type: volume` の場合はボリュームの名前を、`type: bind` の場合はディレクトリ・ファイルのパスを、指定する。`type: tmpfs` の場合は、指定不要。 |
|   `target`   | コンテナでマウントされた時のファイルパス                                                                        |
| `read_only`  | 読み取り専用フラグ（「true」に設定で有効となる。デフォルトは「false」）                                                    |
| `tmpfs.size` | マウントボリュームのサイズ（数値またはバイト単位）                                                                   |
| `tmpfs.mode` | マウントボリュームの Unix ファイルパーミッションビット（8 進数）。Compose 2.14.0 以上で利用可。                                 |

## おわりに

この方法は、Docker Compose のコマンドや MySQL コンテナをメインにした検索ワードで中々ヒットせず、ググラビリティが低いネタのようでした。
tmpfs の側面から検索すると、答えが見つかりますが、それを既に知っている場合は答えが分かっていることになるので、検索しませんよね、という話です。
ですから、この記事で、大したことではないけれども、ちょっと悩んでいる皆さんのエンジニアライフを豊かにする助けになれば、幸いです。

### 参考文献

#### Docker

- [Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Services top-level elements](https://docs.docker.com/reference/compose-file/services/)
- [tmpfs mounts](https://docs.docker.com/engine/storage/tmpfs/)

#### MySQL

- [Docker Hub](https://hub.docker.com/_/mysql)
- [GitHub](https://github.com/docker-library/mysql)

#### Amazon Aurora

- [MySQL バージョン 3 のデータベースエンジンの更新](https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraMySQLReleaseNotes/AuroraMySQL.Updates.30Updates.html)

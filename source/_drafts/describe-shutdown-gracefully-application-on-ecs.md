---
title: ECS上のアプリケーションをGraceful Shutdownする方法
date: 2026-06-22 09:00:00
updated: 2026-06-22 09:00:00
tags:
  - 解説
  - 技術解説
  - プログラミング
  - Go言語
  - AWS
categories:
  - Technology
  - Backend
toc: true
has_gallery: false
has_code: false
has_icon: false
og_image: /images/technology/programming_title.webp
thumbnail: /images/thumbnails/golang_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

コンテナ化されたサーバーアプリケーションを、ECS 上で安全かつ正常にシャットダウンできるようにする実装を、サンプルコード付きでご紹介します。

<!-- more -->

## はじめに

### 目的・ゴール

この記事を読み終わった後に、ECS 上で動作するアプリケーションが Graceful Shutdown できる実装方法を、理解できていること。

### 読者ターゲット

予期せぬエラーなどによって、ECS のタスクが終了する時に、なるべくフェイルセーフになるアプリケーションのシャットダウン処理を実装したい人。

## ECS のライフサイクル

### コンテナライフサイクル

ECS エージェントは、タスクを開始するとタスク内のすべてのコンテナの作業環境を確立します。たとえば、タスクが awsvpc ネットワークモードを利用するように定義されている場合、ECS エージェントは pause コンテナをプロビジョニングし、ネットワークの namespace をタスク内の他のコンテナと共有します。完了すると、ECS エージェントはコンテナランタイムの API を呼び出して、ECS タスク定義で定義されているコンテナを実行します。
タスクが停止すると、各コンテナのエントリプロセス (通常は PID 1) に SIGTERM シグナルを送信します。タイムアウトが経過すると、今度は SIGKILL シグナルをプロセスに送信します。デフォルトでは、SIGTERM シグナルの送信後 30 秒のタイムアウトで SIGKILL シグナルを送信します。この値は、ECS タスクのパラメータの stopTimeout を更新することによってタスクのコンテナ単位で調整するか、ECS エージェントの環境変数 ECS_CONTAINER_STOP_TIMEOUT を設定して EC2 コンテナインスタンス単位で調整できます。この最初の SIGTERM シグナルを適切に処理して、正常にコンテナのプロセスを終了させる必要があります。SIGTERM シグナルを処理することを意識しておらずタイムアウトまでに終了しなかったプロセスは、SIGKILL シグナルが送信され、コンテナが強制的に停止されます。

### エントリプロセスの仕組み

プロセスは子プロセスを生成し、その子プロセスの親になります。 SIGTERM のような停止シグナルによってプロセスが停止されると、親プロセスは、その子プロセスを正常にシャットダウンし、その後自身をシャットダウンする責任があります。親プロセスがそのように設計されていない場合、子プロセスが突然終了し、5xx エラーや作業が失われる可能性があります。コンテナでは、Dockerfile の ENTRYPOINT および CMD ディレクティブで指定されたプロセス (エントリプロセスと呼ぶ) が、コンテナ内の他のすべてのプロセスの親になります。
コンテナの ENTRYPOINT を /bin/sh -c my-app に設定している例を見ていきます。この例では、以下の理由から my-app は正常にシャットダウンしません。

1. sh がエントリプロセスとして実行され、さらに my-app プロセスを生成します。これは sh の子プロセスとして実行されます。
2. sh は、コンテナが停止したときに SIGTERM シグナルを受信しますが、my-app に渡されず、このシグナルに対してアクションを実行するように設定されていません 
3. その後コンテナが SIGKILL シグナルを受信すると、sh とすべての子プロセスが直ちに終了します。

デフォルトでは、shell は SIGTERM を無視します。したがって、shell をアプリケーションのエントリポイントとして使用する場合は、細心の注意が必要です。エントリポイントで shell を安全に使用するには、2 つの方法があります。1) シェルスクリプトを介して実行される実際のアプリケーションに exec というプレフィックスをつける。2) tini (Amazon ECS-Optimized AMI の Docker ランタイムに同梱されている) や dumb-init などの専用のプロセスマネージャーを使用する。
exec はコマンドを実行したいときや、コマンド終了後に shell が不要になったときに便利です。あるコマンドを exec をつけて実行すると、子プロセスを生成するのではなく現在実行中のプロセス (この場合は shell ) の内容を新しい実行可能プロセスに置き換えます。これは、シグナル処理に関連するため重要です。例えば、exec server <arguments> と実行すると、shell が実行されたのと同じ PID で server のコマンドが実行されます。exec をつけていないと、server のコマンドは個別の子プロセスとして実行され、エントリプロセスに送信した SIGTERM シグナルも自動的に受信しません。
また、exec コマンドを、コンテナのエントリポイントとして機能するシェルスクリプトに組み込むこともできます。たとえばスクリプトの最後に exec "$@" を含めると、現在実行中の shell を "$@" が参照するコマンドに置き換えます。デフォルトではコマンドの引数です。

## Graceful Shutdown の実装

### SIGTERM シグナルを処理する

タスクが停止すると、ECS はそのタスク内の各コンテナに停止シグナルを送信します。現在、ECS は必ず SIGTERM を送信しますが、将来的には Dockerfile やタスク定義に STOPSIGNAL ディレクティブを追加することで、これをオーバーライドできるようにする予定です。この停止シグナルは、シャットダウンの命令をアプリケーションに通知します。
リクエストを処理するアプリケーションは、SIGTERM シグナルを受信後、常に正常にシャットダウンする必要があります。シャットダウン処理の一環として、アプリケーションは未処理のリクエストの処理をすべて終了し、新しいリクエストの受け入れを停止する必要があります。
サービスが Application Load Balancer (ALB) を使用している場合、ECS は SIGTERM シグナルを送信する前に、ロードバランサーのターゲットグループから自動的にタスクを登録解除します。タスクが登録解除されると、新しいリクエストはすべてロードバランサーのターゲットグループに登録されている他のタスクに転送されます。そのタスクへの既存の接続は、登録解除の遅延の期限が切れるまで (draining 中は) 続行できます。ワークフローの図を以下に示します。

### 実装例

```go
package main

import (
    "fmt"
    "os"
    "os/signal"
    "syscall"
)

func main() {
    sigs := make(chan os.Signal, 1)
    done := make(chan bool, 1)
    //registers the channel
    signal.Notify(sigs, syscall.SIGTERM)

    go func() {
        sig := <-sigs
        fmt.Println("Caught SIGTERM, shutting down")
        // Finish any outstanding requests, then...
        done <- true
    }()

    fmt.Println("Starting application")
    // Main logic goes here
    <-done
    fmt.Println("exiting")
}
```

## おわりに



### 参考文献

- [ECS のアプリケーションを正常にシャットダウンする方法 | Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/graceful-shutdowns-with-ecs/)

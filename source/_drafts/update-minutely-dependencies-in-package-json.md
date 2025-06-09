---
title: ncuでpackage.jsonの依存関係を旨い具合に更新しよう
date: 2025-06-23 09:00:00
updated: 2025-06-23 09:00:00
tags:
  - 解説
  - 技術解説
  - npm
  - バージョン管理
categories:
  - Technology
  - Frontend
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology/programming/title.webp
thumbnail: /images/thumbnails/npm_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

package.json の依存関係パッケージのバージョン更新を細かく上手に管理できる、便利で優秀な ncu コマンドの導入方法や活用事例をご紹介します。

<!-- more -->

## はじめに

### 目的・ゴール

この記事を読み終わった後に、npm-check-updates パッケージを利用して、package.json の依存関係や npm のグローバルパッケージのバージョンを更新できるようになっていること。

### 読者ターゲット

package.json の依存関係に追加したパッケージや、npm のグローバルインストールしたパッケージを、任意のバージョンで緻密に管理したい人。もしくは、それらの更新方法の比較結果を簡単に知りたい人。

## package.json の更新方法

プロジェクトで使用している package.json の依存関係（`dependencies` 及び `devDependencies`）を最新版に更新する手段は、次の四つの方法が存在します。

1. `npm update` コマンドの実行
2. `npm outdated`、`npm uninstall` 及び `npm install` コマンドの実行
3. dependabot や Renovate 等のツール利用
4. npm-check-updates パッケージと `npm install` コマンドの実行

### 各種更新方法の利点・欠点

このセクションでは、前述の四つの方法について、利点と欠点を具体的に見ていきます。

#### (1) npm update コマンドの実行

一つ目は、`npm update` コマンドを実行する方法です。

##### 利点

- 実行するコマンドが一つで良い

##### 欠点

- package.json のパッケージバージョンを管理する必要がある
- チーム開発の場合、個人間で環境依存問題が発生する可能性がある

#### (2) npm outdated & uninstall & install のコマンドの実行

二つ目は、`npm outdated` コマンドを実行して表示された、更新があるパッケージリストから、一つずつ `npm uninstall` と `npm install` のコマンドを繰り返して実行する方法です。

##### 利点

- 必ず最新版に更新できる

##### 欠点

- コマンドを三つ実行する必要がある
- パッケージの依存関係の種類によって、`npm uninstall` と `npm install` コマンドのオプションを使い分ける必要がある
- 更新するパッケージが多いほど、パッケージの数×３回分、コマンド実行回数が増加する

#### (3) dependabot や Renovate 等のツール利用

三つ目は、dependabot や Renovate 等のツールを利用して、更新がある全てのパッケージバージョンを最新にする方法です。

##### 利点

- GitHub と連携できるため、定期的に自動で更新できる
- コマンドを一つも実行する必要がない

##### 欠点

- 動作調整のために、レポジトリで管理している設定ファイルを変更する必要がある
- npm のグローバルパッケージのバージョン管理には利用できない

#### (4) npm-check-updates & npm install の実行

四つ目は、npm-check-updates パッケージと `npm install` コマンドを組み合わせる方法です。

##### 利点

- パッケージ単位でバージョンアップを調整できる
- package.json の依存関係と npm のグローバルパッケージの両方に使用できる

##### 欠点

- 自動化が難しい
- コマンドを最低でも二つ（最大で三つ）実行する必要がある

### 使い勝手の良い方法は？

これらの方法について、利点と欠点を考慮してデベロッパーフレンドリーな順に並べると、(3)、(4)、(1)、(2) になります。
序列一位の (3) は、マイナーバージョン更新で破壊的変更が行われた（もしくは、意図せず行われた）パッケージがあると、不都合に見舞われることがあります。こういった場合に、パッケージの状況に合わせて設定ファイルに変更を加える工程を繰り返すのは、自動化のコストメリットが消えてしまいます。したがって、(4) が程よいコストパフォーマンスを持つバランスの良い方法になります。

## npm-check-updates を活用

このセクションでは、npm-check-updates パッケージを活用する方法を解説します。

### インストール方法

次のコマンドで、npm-check-updates パッケージの最新版をグローバルインストールします。

```shell
npm install -g npm-check-updates
```

### package.json の更新手順

このセクションでは、この記事のメインテーマでもある package.json の依存関係を最新バージョンに更新する手順をご紹介します。

#### (1) パッケージの更新を確認する

`ncu` コマンドを実行すると、package.json の全ての依存関係に最新版があるかを確認できます。

```shell
$ ncu
Checking /src/project/package.json
[====================] 6/6 100%

 eslint              ^8.56.0  →  ^9.17.0
 eslint-plugin-json   ^3.1.0  →   ^4.0.1
 hexo-util            ^3.2.0  →   ^3.3.0
 open-graph-scraper   ^6.3.3  →   ^6.8.3

Run ncu -u to upgrade package.json
```

ちなみに、全てのパッケージが最新版であれば、以下のような結果になります。

```shell
$ ncu
Checking /src/project/package.json
[====================] 6/6 100%

All dependencies match the latest package versions :)
```

なお、最新版ではなく、マイナーバージョンやパッチバージョンでフィルタリングして更新有無を確認する場合は、以下のセクションで紹介するコマンドを実行してください。

##### マイナーバージョンの更新確認

マイナーバージョン更新を確認する場合、`--target minor` を追加で指定します。このコマンドは、現在のメジャーバージョンのうち、最新マイナーバージョンの最終パッチバージョンを取得します。

```shell
$ ncu --target minor
Checking /src/project/package.json
[====================] 6/6 100%

 eslint              ^8.56.0  →  ^8.57.1
 hexo-util            ^3.2.0  →   ^3.3.0
 open-graph-scraper   ^6.3.3  →   ^6.8.3

Run ncu --target minor -u to upgrade package.json
```

##### パッチバージョンの更新確認

パッチバージョン更新を確認する場合、`--target patch` を追加で指定します。このコマンドは、メジャーバージョンとマイナーバージョンを固定した状態で、最新となるパッチバージョンを取得します。

```shell
$ ncu --target patch
Checking /src/project/package.json
[====================] 6/6 100%

 open-graph-scraper  ^6.3.3  →  ^6.3.4

Run ncu --target patch -u to upgrade package.json
```

#### (2) package.json を更新する

`ncu -u` コマンドで、package.json の依存関係にある更新対象パッケージを最新バージョンにします。なお、全てのパッケージが最新の場合は、何も実行されません。

```shell
$ ncu -u
Upgrading /src/project/package.json
[====================] 6/6 100%

 eslint              ^8.57.1  →  ^9.17.0
 eslint-plugin-json   ^3.1.0  →   ^4.0.1
 hexo-util            ^3.2.0  →   ^3.3.0
 open-graph-scraper   ^6.3.3  →   ^6.8.3

Run npm install to install new versions.
```

このコマンドにおいても、確認時と同じく、マイナーバージョンアップやパッチアップデートのみに絞って実行できます。

##### マイナーバージョンを更新

確認で使った `ncu --target minor` コマンドに、`-u` を追加して実行します。

```shell
$ ncu --target minor -u
Upgrading /src/project/package.json
[====================] 6/6 100%

 eslint              ^8.56.0  →  ^8.57.1
 hexo-util            ^3.2.0  →   ^3.3.0
 open-graph-scraper   ^6.3.4  →   ^6.8.3

Run npm install to install new versions.
```

##### パッチバージョンを更新

確認で使った `ncu --target patch` コマンドに、`-u` を追加して実行します。

```shell
$ ncu --target patch -u
Upgrading /src/project/package.json
[====================] 6/6 100%

 open-graph-scraper  ^6.3.3  →  ^6.3.4

Run npm install to install new versions.
```

#### (3) npm install を実行する

npm-check-updates パッケージでできることは、package.json の更新までです。実際にインストールされているパッケージを更新するためには、`npm install` コマンドの実行が必要です。

```shell
npm install
```

### 便利な補助機能について

npm-check-updates は、グローバルインストールされている npm パッケージバージョン更新を補助するための便利な機能が付いているので、それを活用した更新手順もご紹介します。

#### (1) パッケージの更新を確認する

`ncu -g` コマンドを実行することで、グローバルインストールされたパッケージの最新版を確認できます。

```shell
$ ncu -g
[====================] 4/4 100%

 corepack  0.29.3  →  0.30.0
 npm       10.9.0  →  11.0.0
```

なお、package.json の更新と同様にフィルタリングして更新有無を確認をしたい場合は、次のセクションで紹介するコマンドを実行してください。

##### マイナーバージョンの更新確認

```shell
$ ncu -g --target minor
[====================] 4/4 100%

 corepack  0.29.3  →  0.30.0
 npm       10.9.0  →  10.9.2
```

##### パッチバージョンの更新確認

```shell
$ ncu -g --target patch
[====================] 4/4 100%

 corepack  0.29.3  →  0.29.4
 npm       10.9.0  →  10.9.2
```

#### (2) npm -g install を実行する

`npm -g install` コマンドで、対象パッケージを更新します。前手順の実行後に、下記のようなコマンドが標準出力されるので、それをコピペして実行してください。

##### 最新版にするコマンド例

```shell
npm -g install corepack@0.30.0 npm@11.0.0
```

##### マイナーバージョンアップするコマンド例

```shell
npm -g install corepack@0.30.0 npm@10.9.2
```

##### パッチアップデートするコマンド例

```shell
npm -g install corepack@0.29.4 npm@10.9.2
```

## おわりに

dependabot や Renovate 等のツールを利用するのは、とても楽です。しかし、lock ファイル競合が起こりえます。加えて、アプリケーションであれば、動作確認をしなければなりません。ならば、npm-check-updates を活用してパッケージバージョン管理をする方が、結果的に楽なのではないか、と最近は考えています。ただし、自動化が難しいため、プロダクトの運用・保守では、ツールによる上手く組み合わせて、低コストに抑えながらなるべくリターンを得られるように使うことが肝要でしょう。

### 参考文献

#### npm-check-updates

- [npm-check-updates - npm](https://www.npmjs.com/package/npm-check-updates)
- [npm パッケージをアップデートしたい - かもメモ](https://chaika.hatenablog.com/entry/2022/12/19/083000)
- [npm-check-updatesを使ってサクッとライブラリをアップデートする - その辺にいるWebエンジニアの備忘録](https://kossy-web-engineer.hatenablog.com/entry/2021/01/11/005854)

#### npm

- [npm-update | npm Docs](https://docs.npmjs.com/cli/v11/commands/npm-update)
- [npm-outdated | npm Docs](https://docs.npmjs.com/cli/v11/commands/npm-outdated)
- [npm-install | npm Docs](https://docs.npmjs.com/cli/v11/commands/npm-install)
- [npm-uninstall | npm Docs](https://docs.npmjs.com/cli/v11/commands/npm-uninstall)

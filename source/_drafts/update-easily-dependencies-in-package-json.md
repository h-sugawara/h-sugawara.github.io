---
title: 痒い所に手が届くpackage.jsonの依存関係の更新方法
date: 2025-06-23 09:00:00
updated: 2025-06-23 09:00:00
tags:
  - 技術解説
  - 解説
  - JavaScript
  - npm
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

package.json の依存関係の更新に使える、痒い所に手が届く便利な npm パッケージをご紹介します。

<!-- more -->

## はじめに

### 記事の存在意義

この記事を読み終わった後に、npm-check-updates パッケージを利用して、package.json の依存関係や npm のグローバルパッケージを更新できるようになっていること。

### 記事を推したい読者様

package.json の依存関係や npm のグローバルパッケージを、痒い所に手が届く方法で、任意のバージョンへ更新したい人。

## package.json の更新方法

### 依存関係を最新にする方法

プロジェクトで使用している package.json の依存関係（`dependencies` 及び `devDependencies`）を最新版に更新する手段は、次の四つの方法が存在します。

1. `npm update` コマンドの実行
2. `npm outdated`、`npm uninstall` 及び `npm install` コマンドの実行
3. dependabot や Renovate 等のツール利用
4. npm-check-updates パッケージと `npm install` コマンドの実行

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

### 痒い所に手が届く方法は？

前述の四つの方法のうち、利点と欠点を考慮してデベロッパーフレンドリーな順に並べると、(3)、(4)、(1)、(2) になります。
トップに位置する (3) の方法は、マイナーバージョン更新で破壊的変更が行われた（もしくは、意図せず行われた）パッケージがあると、不都合が発生することがあります。こういった場合に、パッケージの状況に合わせて設定ファイルに変更を加える工程を繰り返すのは、コストメリットが消えてしまいます。そのため、痒い所に手が届いて、そこそこのコストで済む方法が、(4) になります。
次のセクションからは、npm-check-updates パッケージを活用する (4) の方法を具体的に紹介します。

## npm-check-updates を活用

次のコマンドを実行して、npm-check-updates パッケージの最新版をグローバルインストールします。

```shell
npm install -g npm-check-updates
```

### プロジェクトパッケージ

まずは、npm-check-updates パッケージを利用して、プロジェクトで使用している package.json の依存関係を最新に更新する手順をご紹介します。

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

マイナーバージョンの更新を確認する場合、`--target minor` を追加で指定します。このコマンドは、現在のメジャーバージョンのうち、最新マイナーバージョンの最終パッチバージョンを取得します。

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

パッチバージョンの更新を確認する場合、`--target patch` を追加で指定します。このコマンドは、メジャーバージョンとマイナーバージョンを固定した状態で、最新となるパッチバージョンを取得します。

```shell
$ ncu --target patch
Checking /src/project/package.json
[====================] 6/6 100%

 open-graph-scraper  ^6.3.3  →  ^6.3.4

Run ncu --target patch -u to upgrade package.json
```

#### (2) package.json を更新する

`ncu -u` コマンドを実行して、package.json の依存関係にある更新対象パッケージを最新バージョンにします。なお、全てのパッケージが最新の場合は、何も実行されません。

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

このコマンドにおいても、確認時と同じく、マイナーバージョンアップやパッチアップデートのみに絞って実行することができます。

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

npm-check-updates パッケージで出来ることは、package.json の更新までです。実際にインストールされているパッケージを更新するためには、`npm install` コマンドの実行が必要です。

```shell
npm install
```

### グローバルパッケージ

次に、npm-check-updates パッケージを利用して、グローバルインストールされている npm パッケージを最新に更新する手順をご紹介します。

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

npm-check-updates ではグローバルパッケージの更新ができません。そのため、`npm -g install` コマンドを実行して対象パッケージを更新します。前手順の実行後に、下記のようなコマンドが標準出力されるので、それをコピペして実行してください。

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

dependabot や Renovate 等のツールを利用するのはとても楽ちんです。しかし、lock ファイルが競合したり、アプリケーションであれば実環境上の動作確認が必要だったりします。そのため、npm-check-updates を活用してパッケージバージョン管理をする方が良いのではないか、と最近は考えています。ただし、自動化には不向きなため、プロダクトの運用・保守では、ツールと上手に組み合わせて、低コストに抑えながら、なるべくリターンを得られるように使うことが必要でしょう。

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
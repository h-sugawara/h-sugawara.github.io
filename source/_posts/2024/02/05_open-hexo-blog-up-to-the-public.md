---
title: Hexo製ブログをGitHub Pagesに公開して検索可能にする
date: 2024-02-05 08:30:00
updated: 2025-02-04 22:00:00
tags:
  - ブログ作成・改良
  - Hexo
  - GitHub
  - GitHub Pages
  - Google Search Console
categories:
  - Technology
  - Frontend
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology/blog/title.webp
thumbnail: /images/thumbnails/technology/hexo_thumbnail.webp
cover:
  image: /images/technology/blog/cover.webp
  sources:
    small: /images/technology/blog/cover_small.webp
    medium: /images/technology/blog/cover_medium.webp
    large: /images/technology/blog/cover_large.webp
---

Hexo.js をジェネレータとして作成したブログを、GitHub Pages で公開して、Google 検索エンジンで表示できるようにする手順をご紹介します。

<!-- more -->

{% message color:info %}
Hexo.js でブログを作成する手順については、ブログ作成シリーズの{% post_link start-hexo-blog-in-github-pages '前編記事「Hexo.jsで自分好みの高機能なブログを手軽に作ろう」' %}をご覧ください。
{% endmessage %}

## はじめに

### 目的・ゴール

この記事をひと通り読んだ後に、GitHub Pages に公開した Hexo.js 製ブログを、Google 検索エンジンの検索結果に表示できる状態になっていること。もしくは、この記事を読みながら、ブログを公開して検索エンジンから検索可能にできること。

### 読者ターゲット

この記事は、以下のような方が読むことをオススメします。

- 一般的なブログサービスを使わずに、自分の力だけでブログを開設したい人
- メンテナンスやセキュリティ等の宗教上の理由で、WordPress を採用したくない人
- カスタムドメインを使ったり、ブログを自由自在にカスタマイズしたり等、やりこみたい人

## GitHub Pagesで公開する

GitHub Pagesで公開するためには、ブログを配置するレポジトリ、デプロイ設定、下書き記事の作り方等を理解しておく必要があります。

### レポジトリ作成

{% message color:warning %}
GitHub のアカウントはあらかじめ作成してください。
{% endmessage %}

#### (1) レポジトリ作成

自分のアカウントを使って、GitHub Pages 用のレポジトリを作成します。[GitHub 公式ドキュメント](https://docs.github.com/ja/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-a-repository-for-your-site)に、画像付きの作成手順がありますので、そちらをご確認ください。

{% message color:info %}
無料で使いたい場合は、パブリックレポジトリを作成する必要があります。
{% endmessage %}

#### (2) 手元にチェックアウト

レポジトリ作成後に、Git コマンド等のツール類を使用して、そのレポジトリを手元にチェックアウトします。その後で、前編記事で作成した blog ディレクトリの中身を丸ごと、チェックアウトした公開用レポジトリのディレクトリ直下にコピーします。
なお、先にこの手順を行ってから、前編の構築手順を行うこともできます。

{% message color:info %}
前編の構築手順（`hexo init` コマンド）で、ディレクトリを違う名前で作成した場合は、blog をその名前に読み替えてください。
{% endmessage %}

### デプロイ設定

#### (1) デプロイ設定を変更

ブログの設定ファイル `_config.yml` にあるデプロイの設定を、次のように書き換えます。

```yaml _config.yml
# Include / Exclude file(s)
include:
    - '.nojekyll'
exclude:
ignore:
# ... 途中省略...
# Deployment
deploy:
  type: git
  repo: https://github.com/octocat/octocat.github.io # 「octocat」（2ヶ所）は、ご自身のアカウントIDに変更してください。
  branch: gh-pages
  ignore_hidden:
      public: false
```

#### (2) .nojekyll ファイルを作成

チェックアウトした公開レポジトリのルートディレクトリ配下の source ディレクトリに移動してから、`.nojekyll` ファイルを作成します。

```shell
cd ./source
touch .nojekyll
```

これでデプロイの設定は完了です。デプロイする前に、次のセクションの「下書き記事を使いこなす」をよく読んでください。

### 下書き記事を使いこなす

`hexo new post` コマンドで作った記事は、公開状態の投稿記事になります。すなわち、ブログをGitHub Pagesに公開すると、それからは「書きかけの記事が投稿された」事故が起こりえます。非公開状態の下書き記事として作成するコマンドもありますので、それを使えば事故を防げます。
このセクションでは、下書き記事の作成方法と Hexo サーバーでの表示方法、そして下書き記事の公開方法を紹介します。

#### (1) 下書き記事を作成

次のコマンドで、下書き記事を作成します。

{% message color:info %}
コマンド中の `article-name` 部分は、記事名ですので、自由に入力してかまいません。
{% endmessage %}

```shell
hexo new draft "article-name"
```

#### (2) Hexo サーバーの設定を変更

下書き記事は、デフォルトでは手元で Hexo サーバーを起動しても、ブログの記事として認識されないため、設定変更が必要です。package.json にある `scripts` フィールドの `server` コマンドに `drafts` オプションを追加して、表示する記事として認識させます。

```json package.json（※注：scripts フィールドのみ抜粋）
{
  "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server --drafts"
  }
}
```

#### (3) Hexo サーバーの起動

次のコマンドで、通常通り Hexo サーバーを起動します。

```shell
npm run clean && npm run server
```

#### (4) 記事を下書きから投稿済みに変更

前述までの手順は、手元で表示できるようにしただけであり、デプロイしても、依然として下書き記事が非公開として扱われます。投稿記事は公開したものとして扱われる仕様なので、下書き状態の記事を投稿済みに変更すればよいのです。それは、次のコマンドで行います。

```shell
hexo publish "article-name"
```

### GitHub Pages にデプロイ

それでは、準備も整ったと思いますので、GitHub Pages にデプロイしましょう！
デプロイは下記のコマンドを実行するだけで終わります。

{% message color:warning %}
Windows で下記のコマンドを実行するには、PowerShell 7.x が必要です。それ以下のバージョンしか使えないなど制約がある場合は、二つのコマンドを順番に実行してください。
{% endmessage %}

```shell
npm run clean && npm run deploy
```

### カスタムドメイン登録

GitHub Pages のデフォルトドメインは、`アカウントID.github.io` となるため、嫌な人もいるでしょう。もちろん、カスタムドメインを無料で登録することもできます。詳細については、[GitHub 公式ドキュメントの説明](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)をご覧ください。
ただし、カスタムドメインの取得自体はご自身でやる必要がありますので、ドメインを取得できるサービスをご利用ください。ドメインだけ取りたいなら、[お名前ドットコム](https://www.onamae.com/)がオススメです。

## 検索できるようにしよう

ここまできたらあと少しで終わりです。公開済みのブログを検索できるようにしてみましょう。

### Google Analytics 登録

{% message color:info %}
所有者確認のみしたい場合は、この手順はスキップしても問題ありません。
{% endmessage %}

公開済みブログのアクセス解析と、「Google Search Console（以降、GSC と略）」の所有者確認のために、「Google Analytics（以降、GA と略）」にアカウントを作成します。
アカウント作成は、[Google の Analytics ページ](http://www.google.com/analytics)から行ってください。単語がよくわからなかったり、手順は面倒だったりしますが、作業自体はそれほど難しくはないので、ここでの説明は省きます。Google 検索で「Google Analytics 登録」で調べると、[詳しく説明してくれている方たち](https://www.google.com/search?client=firefox-b-d&q=Google+Analytics+%E7%99%BB%E9%8C%B2)がいますので、彼らのページを見ることをオススメします。

### サイトマップ作成

ブログに書いた記事を、GSC に認知してもらうためにサイトマップを作成します。

#### (1) プラグインのインストール

サイトマップを手作業で作る必要はなく、Hexo 公式が hexo-generator-sitemap プラグインを用意しているので、それをインストールします。

```shell
npm install hexo-generator-sitemap
```

#### (2) サイトマップ作成設定の追加

ブログの設定ファイル `_config.yml` に、サイトマップ作成用の設定を追加します。

```yaml _config.yml
# Sitemap
sitemap:
  path:
    - sitemap.xml
  tags: false
  categories: false
```

設定はこれだけで完了です。以降は、デプロイコマンドを実行する度に、Hexo がブログのサイトマップを作って、GitHub Pages にデプロイしてくれます。

### Google Search Console 登録

GSC で、[ブログの登録（または、プロパティ追加）](https://search.google.com/search-console/about?hl=ja)を行います。プロパティ追加を行うことで、Google 検索結果のインデックスを作成できます。

#### (1) 所有権の確認

GA・HTML ファイル・HTML タグ・Google タグマネージャー・ドメインの五つの中から確認方法を選びます。前述の手順で GA 登録を行っている方は、GA を選ぶと良いでしょう。それ以外の方は、HTML ファイル、または、HTML タグのどちらかで確認を行うのがオススメです。

##### HTML ファイルで確認する

まずは、GSC サイト内の「設定」の「所有権の確認」から、HTML ファイルをダウンロードします。次に、ダウンロードしたファイルをコピーして、ブログの source ディレクトリ直下に貼り付けます。
それから、ブログの設定ファイル `_config.yml` の `skip_render` に、ダウンロードした HTML ファイルの名前を、以下のように設定します。

```yaml _config.yml
skip_render:
  # ファイル名は、人によって異なりますので、コピペはしないでください
  - 'google0000000000000000.html'
```

##### HTML タグで確認する

{% message color:warning %}
Icarus テーマをご利用の場合の設定方法になります。
{% endmessage %}

まずは、GSC サイト内の「設定」の「所有権の確認」から、HTML のメタタグをコピーします。次に、Icarus のテーマ設定ファイル `_config.icarus.yml` を開き、以下のように設定します。

```yaml _config.icarus.yml
head:
  # 途中省略
  meta:
    # <meta name="theme-google-site-verification" content="abcdefghijklmnopqrstuvwxyz_01234567890_ABCD"> の場合、
    # 'name="google-site-verification";content="meta タグの content 属性の値"' に置き換えます。
    # meta タグの content 属性の値は、人によって異なりますので、コピペはしないでください
    - 'name="google-site-verification";content="abcdefghijklmnopqrstuvwxyz_01234567890_ABCD"'
```

#### (2) サイトマップ登録

所有者確認が済んだ後に、作成したサイトマップの登録を行います。数日後にクロールしてくれるかもしれません。ちなみに、後日「検出 - インデックス未登録」とされた場合は、未登録ページの一覧が見られますので、一つずつインデックス登録してあげましょう。

## おわりに

GitHub Pages や Google Search Console は、ブログ以外のウェブサイトであっても活用できる機会は結構ありそうなので、ご覧になった方の何かしらの一助となれば嬉しいです。

### 関連記事

#### ブログ作成

- {% post_link start-hexo-blog-in-github-pages '前編「Hexo.jsで自分好みの高機能なブログを手軽に作ろう」' %}

### 参考文献

#### GitHub 公式 ドキュメント

- [GitHub Pages サイトを作成する](https://docs.github.com/ja/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-a-repository-for-your-site)
- [GitHub Pages サイトのカスタムドメインを管理する](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

#### 各種サービス

- [お名前.com](https://www.onamae.com/)
- [Google アナリティクス](https://marketingplatform.google.com/about/analytics/)
- [Google Search Console](https://search.google.com/search-console/about?hl=ja)

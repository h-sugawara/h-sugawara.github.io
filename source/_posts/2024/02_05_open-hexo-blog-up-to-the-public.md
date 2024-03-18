---
title: Hexo製ブログを公開してGoogle検索できるようにする
date: 2024-02-05 08:30:00
updated: 2024-02-05 08:30:00
tags:
  - ブログ作成
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
og_image: /images/technology/blog_title.webp
thumbnail: /images/thumbnails/hexo_thumbnail.webp
cover:
  image: /images/technology/blog/cover.webp
  sources:
    small: /images/technology/blog/cover_small.webp
    medium: /images/technology/blog/cover_medium.webp
    large: /images/technology/blog/cover_large.webp
---

手元で作成したHexo.js製ブログを、GitHub Pagesで公開して、Google検索できるようにするまでの手順を、この記事にまとめました。
GitHub Pagesでサイトを公開しようと考えている方の参考になれば幸いです。

<!-- more -->

## はじめに

{% message color:info %}
この記事は、「ブログ作成」シリーズの後編です。
前編の記事である「{% post_link start-hexo-blog-in-github-pages 'Hexo.js+GitHub Pagesで高機能ブログを手軽に作ろう' %}」を未読の方は、この記事を読む前にそちらから拝読ください。
{% endmessage %}

### 前後編に分割した理由

下記の二つの理由を持って、記事を前後編の二つの記事に分割することにしました。

1. PageSpeed Insights で、ページ内の DOM 要素数が 800 を超えていると、警告を受けたから。
   - テンプレートやスタイルのリファクタを頑張ったが、800 を下回れなかった。
2. 技術的な内容にも関わらず、長すぎて可読性が落ちていると思ったから。
   - いくつか記事を書いた結果、読了時間が 10 分程度だとバランスが良いという結論になった。

### この記事の存在意義

読者様が、ブログ作成シリーズの記事をひと通り読んだ後に Hexo.js + GitHub Pages のブログを作成できるようになっていること。
もしくは、これらの記事を読みながらブログを作成できること。

## ブログをお外に公開しよう

さて、手元で表示しているブログが満足する出来になって、そろそろお外に公開したくなってきた頃かと思います。
このまま、後編（公開編）の手順に進みましょう。

### レポジトリ作成

{% message color:info %}
GitHub のアカウントはあらかじめ作成してください。
{% endmessage %}
{% message color:warning %}
無料で使いたい場合は、パブリックレポジトリにする必要があります。
{% endmessage %}

#### (1) レポジトリ作成

自分のアカウントを使って、GitHub Pages 用のレポジトリを作成します。
画像付きの作成手順が[GitHub公式ドキュメントにまとめられています](https://docs.github.com/ja/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-a-repository-for-your-site)ので、ご確認ください。

#### (2) 手元にチェックアウト

作成後に、Git コマンド等のツールを使用して、そのレポジトリを手元にチェックアウトします。
それから、構築実践編で作成した"blog"ディレクトリ(※)の中身を丸ごと、チェックアウトした公開用レポジトリのディレクトリ直下にコピーしましょう。
(※) `hexo init`コマンド実行時に、任意の名前で作成した場合、"blog"をそれに読み替えてください。

ちなみに、この手順を行ってから、構築手順を行うこともできます。

### デプロイ設定

#### (1) デプロイ設定を変更

ブログの設定ファイル"_config.yml"にあるデプロイの設定を、下記のように書き換えましょう。

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

チェックアウトした公開レポジトリのルートディレクトリ配下の source ディレクトリに移動し、".nojekyll"ファイルを作成しましょう。

```shell terminal
cd ./source
touch .nojekyll
```

これでデプロイの設定は完了です。デプロイする前に、次のセクションの「下書き記事を使いこなす」をよく読んでください。

### 下書き記事を使いこなす

`hexo new post`コマンドで作った記事は、公開状態の投稿記事になります。
ということは、ブログをお外に公開すると、今後は「書きかけの記事が投稿されちゃった」事故が起こりえます。
非公開状態の下書き記事として作成するコマンドもありますので、それを使えば事故を防げます。
このセクションでは、下書き記事の作成方法と、Hexo サーバーでの表示方法、下書き記事の公開方法を紹介します。

#### (1) 下書き記事を作成

次のコマンドで、下書き記事を作成します。

```shell terminal
hexo new draft "article-name"
```

#### (2) Hexo サーバーの設定を変更

下書き記事は、手元の Hexo サーバーを起動しても、ブログの記事として表示されません。
"package.json"にある scripts の"server"コマンドに手を加えて、表示する記事として認識させる必要があります。

```text package.json（※コピーせず、ご自身の手で修正してください）
  "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server --drafts" // 「 --drafts」を後ろに追加
  },
```

#### (3) Hexo サーバーの起動

このあとは、通常通り Hexo サーバーを起動させるだけです。

```shell terminal
npm run clean && npm run server
```

#### (4) 下書き記事を投稿記事に変換

さて、上記の手順は、あくまで手元で表示できるようにしただけであって、お外では依然として下書き記事が非公開状態として扱われます。
前述の通り、投稿記事は公開状態として扱われるので、下書き記事を投稿記事に変換しましょう。
下記のコマンドを実行することで実現できます。

```shell terminal
hexo publish "article-name"
```

### GitHub Pages にデプロイ

それでは、準備も整ったと思いますので、GitHub Pages にデプロイしましょう！
デプロイは下記のコマンドを実行するだけで終わります。

{% message color:warning %}
Windows で下記のコマンドを実行するには、"PowerShell 7.x"が必要です。
それ以下のバージョンしか使えないなど制約がある場合は、二つのコマンドを順番に実行してください。
{% endmessage %}

```shell terminal
npm run clean && npm run deploy
```

### カスタムドメイン登録

GitHub Pages のデフォルトドメインは、`アカウントID.github.io`となるため、嫌な人もいるでしょう。
もちろん、カスタムドメインを無料で登録することもできます。
詳細については、[GitHub公式ドキュメントの説明](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)にお任せします。

ただし、カスタムドメインの取得自体はご自身でやる必要がありますので、ドメインを取得できるサービスをご利用ください。
ドメインだけ取りたいなら、[お名前ドットコム](https://www.onamae.com/)がオススメです。

## 検索できるようにしよう

ここまできたらあと少しで終わりです。お外に公開したブログを検索できるようにしてみましょう。

### Google Analytics 登録

{% message color:info %}
所有者確認のみしたい場合は、この手順はスキップしても問題ありません。
{% endmessage %}

お外に公開したブログのアクセス解析と、"Google Search Console"（以下、GSC）の所有者確認のために、"Google Analytics"（以下、GA）にアカウントを作成します。

アカウント作成は、[GoogleのAnalyticsページ](http://www.google.com/analytics)から行ってください。
単語がよくわからなかったり、手順は面倒だったりしますが、作業自体はそれほど難しくはないので、ここでの説明は省きます。
Google 検索すると、[詳しく説明してくれている方たち](https://www.google.com/search?client=firefox-b-d&q=Google+Analytics+%E7%99%BB%E9%8C%B2)がいますので、彼らのページを見ることをオススメします。

### サイトマップ作成

ブログに書いた記事を、GSC に認知してもらうためにサイトマップを作成します。

#### (1) プラグインのインストール

もちろんサイトマップは、手作業で作る必要はなく、Hexo 公式が`hexo-generator-sitemap`プラグインを用意しているので、それをインストールしましょう。

```shell terminal
npm install hexo-generator-sitemap
```

#### (2) サイトマップ作成設定の追加

インストールが終わったら、ブログの設定ファイル"_config.yml"を開いて、サイトマップ作成用の設定を追加します。

```yaml _config.yml
# Sitemap
sitemap:
  path:
    - sitemap.xml
  tags: false
  categories: false
```

設定はこれだけでOKです。デプロイコマンドを実行する度に、Hexo がブログのサイトマップを作って、GitHub Pages にデプロイしてくれるようになります。

### Google Search Console 登録

GSCに[ブログの登録（または、プロパティ追加）](https://search.google.com/search-console/about?hl=ja)を行います。
プロパティ追加を行うことで、Google 検索結果にインデックスを作成できます。

#### (1) 所有者確認

GA・HTML ファイル・HTML タグ・Google タグマネージャー・ドメインの5つの中から確認方法を選んでください。
前述の手順で GA 登録を行っている方は、GA を選ぶと良いでしょう。それ以外の方は、HTML タグか、ドメインのどちらかで確認を行うのがオススメです。
なお、HTML ファイルでの確認方法は、Hexo が自動でテンプレートを適用して表示してしまい、Google が確認できないため、使用不可能です。

#### (2) サイトマップ登録

所有者確認が済んだ後に、作成したサイトマップの登録を行います。数日後にクロールしてくれるかもしれません（※私はされなかった）。
ちなみに、後日「検出 - インデックス未登録」とされた場合は、未登録ページの一覧が見られますので、一つずつインデックス登録してあげましょう。

## おわりに

後編の記事で紹介した GitHub Pages や、Google Search Console は、ブログでなくても活用できる機会は結構ありそうなので、ご覧になった方の何かしらの一助となれば嬉しいです。

仕事が忙しくて、千恋万花をプレイし始めたにも関わらず、ほとんど出来てない今日この頃。
記事を分割した本当の理由はお察しください。

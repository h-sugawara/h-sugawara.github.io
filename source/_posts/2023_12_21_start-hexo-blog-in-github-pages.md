---
title: Hexo.js+GitHub Pagesで高機能ブログを手軽に作ろう
date: 2023-12-21 09:00:00
updated: 2023-12-21 09:00:00
tags:
  - フロントエンド
  - Hexo
  - GitHub
  - GitHub Pages
  - Advent Calendar
category: Technology
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology_blog_title.webp
thumbnail: /images/thumbnails/hexo_thumbnail.webp
cover:
  image: /images/technology/blog_cover.webp
  sources:
    small: /images/technology/blog_cover_small.webp
    medium: /images/technology/blog_cover_medium.webp
    large: /images/technology/blog_cover_large.webp
---

ちゃろー☆今年もアドベントカレンダーの時期がやってきました！
今回は、例年通りのGitHub Actionsネタではなく、GitHub Pagesネタを提供します。

<!-- more -->

## はじめに

この記事は、{% anchor "mediba Advent Calendar 2023 の22日目" https://qiita.com/advent-calendar/2023/mediba true "mediba Advent Calendar 2023" %}にエントリーしています。

### この記事を書いている人

KDDI の子会社である mediba でテックリードをしている雑食系雑用エンジニア。
インフラ、フロントエンド、バックエンド、SRE、CI/CDなどプロダクトに必要な役割は、何でもやる人です（注：バックエンドが本職）。

この記事が投稿される頃は、忙しすぎて死にそうになっているでしょう。誰か私を救ってくれ。

### この記事の存在意義

読者様が、この記事をひと通り読んだ後に`Hexo.js` + `GitHub Pages`のブログを作成できるようになっていること。
もしくは、この記事を読みながらブログを作成できること。

### この記事を推したい読者様

この記事を読んで嬉しくなる読者様は、以下のような方を想定しています。

-  一般的なブログサービスを使わずに、自分の力だけでブログを開設したい人
- メンテナンスやセキュリティ等の宗教上の理由で、WordPress を採用したくない人
- カスタムドメインを使ったり、ブログを自由自在にカスタマイズしたり等、やりこみたい人

### この記事が生まれたきっかけ

書いた{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}を投稿する場所と方法を探していたことがきっかけです。

作中のスクショを張りたかったことと、R18 指定のゲームだったこともあり、Ameba や FC2 等のブログサービスを使用せず、ホスティングしようと考えました。
`GitHub Pages`で静的サイトホスティングができることは知っていたので、場所はすぐに決まりました。
あとは、ブログに必要なウェブページ一式を生成するジェネレーターを探すだけでした。
紆余曲折あって、`Hexo.js`に辿り着き、これを使うことにしました。

こうして、このブログが`Hexo.js` + `GitHub Pages`で爆誕し、さらにこの記事が生み出されることとなったのです。

なお、`Hexo`と書かれていると、`ヘクソ`と読みがちですが、`ヘキソ`の読みが正しいようです。
ぶっちゃけ、どっちでも伝わるとは思うので、どっちの呼び方でも良いと思います。

## 手元でブログを作ろう

御託を並べる暇があったら、早く作成手順を見せろ、とそろそろ言われそうなので、構築実践編に移りましょう。
まずは、手元でブログを作って、ローカル環境のパソコン内で動かしてみます。

### ローカル環境整備

{% message color:info %}
Node.js のバージョン管理ツールをインストールしておくと楽です。
・Windows => nvm-windows をインストール。
・Mac または Linux => お好きなツールをインストール。

Git はインストール必須です。
・Windows => {% anchor "Git for Windowsを公式サイトからダウンロード" https://gitforwindows.org/ true "Git for Windows" %}し、インストール。
・Mac => HomeBrew 等でインストール。
・Linux => apt-get や yum でインストール。
{% endmessage %}

1. Node.js のバージョン管理ツールから最新版をインストールします。
大抵のツールは、インストール後にバージョン切り替えをしないので、自分でインストールしたバージョンに変更するコマンドを実行してください。
その後、`node -v`コマンドで、最新バージョンに切り替わっていることを確認してください。
2. npm を最新バージョンに更新します。
3. npm 経由で、hexo-cli をインストールします。
```shell terminal
npm install -g hexo-cli
```

### ブログセットアップ

1. ブログ一式を作成するコマンドを実行します。
以下のコマンドは、"blog"という名前のディレクトリでブログ一式が作成されます。任意の名前に変えて実行しても大丈夫です。
```shell terminal
hexo init blog
```
2. "blog"ディレクトリ(※)に移動し、`npm install`コマンドを実行します。
(※) 手順1で、任意の名前で作成した場合、"blog"を読み替えてください。
```shell terminal
cd ./blog
npm install
```

これだけでブログのセットアップは完了です。ね？簡単でしょ？
では、下記のコマンドを実行してセットアップしたブログを表示してみましょう！

{% message color:warning %}
Windows で下記のコマンドを実行するには、"PowerShell 7.x"が必要です。
それ以下のバージョンしか使えないなど制約がある場合は、二つのコマンドを順番に実行してください。
{% endmessage %}

```shell terminal
npm run clean && npm run server
```

コマンド実行時にログにも出ますが、Ctrl+C で`Hexo`サーバーを止められます。

### カスタムテーマ導入

初回セットアップ時のデフォルトテーマは、landscape テーマというものです。
最低限のことはできるのですが、見た通りデザインがイケてません。オシャレ感が足りません。
そんな人のために、{% anchor "Hexo公式から有志が作成したテーマを検索" https://hexo.io/themes/ true "Hexo themes" %}できるようになっています。

検索してみるとたくさんあって悩みますが、私の一番のおすすめは`Icarus`テーマです。
`Icarus`テーマの{% anchor "ドキュメントからインストール手順" https://ppoffice.github.io/hexo-theme-icarus/uncategorized/getting-started-with-icarus/ true "Getting started with icarus" %}が見れるので、導入してみてください。

{% message color:warning %}
`npm install`で導入した場合は、フォントを変更できません（不可能ではないが非推奨）。
`git clone`する方法、または、GitHub から Download zip する方法で導入することを推奨します。
{% endmessage %}
{% message color:info %}
`Icarus`テーマの最新版 v5.x は、Hexo v6.x ベースで作成されています。
そのため、ブログ側の`Hexo`を最新版の v7.x ではなく v6.x にすると、互換性に関わる問題が発生しにくいでしょう。
私は念のため、Hexo v7.x を`npm uninstall`した後に、Hexo v6.x を`npm install`しました。
{% endmessage %}

### ブログ設定を整える

手元で確認した時に「ブログのタイトルを変えてぇなぁ」等、思った方はいらっしゃると思います。
"blog"ディレクトリ(※)直下に、ブログの設定ファイルがあるので、その中身を良い感じに書き換えていきましょう。
(※) `hexo init`コマンド実行時に、任意の名前で作成した場合、"blog"をそれに読み替えてください。

```yaml _config.yml
# Site
title: ブログタイトル
subtitle: '' # 使われないテーマでは設定不要
description: 'サイトの説明文 は、こんな　感じで書けます。'
keywords: 'Key,word'
author: author
language: ja
timezone: Japan # Asia/Tokyo 表記でも可

# URL
url: https://username.github.io/ # usernameは、GitHubのユーザー名に書き換える
permalink: articles/:title/ # デフォルトでも良い方は変更不要

# Writing
new_post_name: :year_:month_:day_:title.md # 日付が接頭辞にあると見やすいです（オススメ）
post_asset_folder: true # 記事ごとに画像ファイルを配置したいならtrue
```

上記に抜粋した設定項目は、必要最低限の変更した方が望ましい箇所です。
他の設定については、{% anchor "Hexo公式ホームページに設定に関する詳細説明がまとめられている" https://hexo.io/docs/configuration true "Hexo Configuration" %}ので、そちらをご確認ください。

### 試しに記事を書いてみる

ブログは記事がなければ何も始まらないので、さっそく作りましょう。
`Hexo`で記事を作成するには、以下のコマンドを実行します。

{% message color:info %}
記事名（コマンド中の article-name 部分）は、自由に入力してかまいません。
{% endmessage %}

```shell terminal
hexo new post "article-name"
```

記事は、`source/_posts`ディレクトリ直下に、MarkDown 形式のファイル（コマンド通りに実行した時は、"2023_12_22_article-name.md"）が生成されます。
このファイルを開いてみると、中身はこんな感じになっています。

```markdown source/_posts/2023_12_22_article-name.md
---
title: article-name
date: 2024-12-22 09:00:00
tags:
---
```

`---`で囲まれた部分を"Front Matter"と呼び、`Hexo`では記事のメタ情報を記載する場所です。
"title"は、記事タイトルに使われるので、ここを任意の日本語に変えちゃいましょう。
他にも、テーマによってはカスタムフィールドがあります（例：`Icarus`テーマなら、"thumbnail"や"cover"等）ので、お好みで設定してください。

そして、ブログの本文は、"Front Matter"の後に記述します。

実際の記事の執筆は、下記のように"Front Matter"に色々と設定したり、本文を書いたりします。
なお、本文中に`<!-- more -->`を入れると、その位置に「続きを読む」ボタンを差し込めます。

```markdown source/_posts/2023_12_22_article-name.md
---
title: Hexo.js+GitHub Pagesで高機能ブログを手軽に作ろう
date: 2023-12-22 09:00:00
updated: 2023-12-22 09:00:00
tags:
  - フロントエンド
  - Hexo
  - GitHub Pages
  - Advent Calendar
category: Technology
---

ちゃろー☆今年もアドベントカレンダーの時期がやってきました！
今年は、例年通りのGitHub Actionsネタではなく、GitHub Pagesネタで提供させていただきます。

<!-- more -->

## はじめに
```

### その他カスタマイズする

ここまでの手順で、ブログとしてはほぼ完成しています。

`Icarus`テーマを導入した方は、日本語の表示時フォントが"Microsoft YaHei"になっています。
見慣れているフォントに変えたいなら、フォント設定に関する処理を書き換えると変更できます（※前項「カスタムテーマ導入」の注意事項を読んでください）。
やり方については、{% anchor "「Hexoのicarusテーマのフォントの変え方」" https://omathin.com/icarus-theme-change/ true "Hexoのicarusテーマのフォントの変え方" %}や{% anchor "「HEXO の表示フォントを変更」" https://fennote.fareastnoise.com/2022/03/07/hexo-change-fonts/ true "HEXO の表示フォントを変更" %}をまねてみると良いでしょう。

あとは、テーマのデザインを弄ったり、プラグインを入れたりなど、皆様のお好みでどうぞ。
リンクプレビュー機能を導入したい方は、私がプラグインを作ってみたので、以下の記事も併せて読んでみてください。

{% link_preview https://blog.chaotic-notes.com/articles/hexo-link-preview-npm-publish/ %}hexo-tag-ogp-link-previewプラグインの公開秘話{% endlink_preview %}

## ブログをお外に公開しよう

さて、手元で表示しているブログが満足する出来になって、そろそろお外に公開したくなってきた頃かと思います。
このまま、公開実践編の手順に進みましょう。

### 公開用レポジトリ作成

{% message color:info %}
GitHub のアカウントはあらかじめ作成してください。
{% endmessage %}
{% message color:warning %}
無料で使いたい場合は、パブリックレポジトリにする必要があります。
{% endmessage %}

自分のアカウントを使って、`GitHub Pages`用のレポジトリを作成します。
画像付きの作成手順が{% anchor "GitHub公式ドキュメントにまとめられています" https://docs.github.com/ja/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-a-repository-for-your-site true "サイト用にリポジトリを作成する" %}ので、ご確認ください。

作成後に、Git コマンド等のツールを使用して、そのレポジトリを手元にチェックアウトします。
それから、構築実践編で作成した"blog"ディレクトリ(※)の中身を丸ごと、チェックアウトした公開用レポジトリのディレクトリ直下にコピーしましょう。
(※) `hexo init`コマンド実行時に、任意の名前で作成した場合、"blog"をそれに読み替えてください。

ちなみに、この手順を行ってから、構築手順を行うこともできます。

### デプロイ設定

デプロイの設定は、ブログの設定ファイルにあります。下記のように書き換えましょう。

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

その後は、チェックアウトした公開レポジトリのルートディレクトリ配下の source ディレクトリ直下に`.nojekyll`ファイルを作成しましょう。
これでデプロイの設定は完了です。デプロイする前に、次のセクションの「下書き記事を使いこなす」をよく読んでください。

### 下書き記事を使いこなす

`hexo new post`コマンドで作った記事は、公開状態の投稿記事になります。
ということは、ブログをお外に公開すると、今後は「書きかけの記事が投稿されちゃった」事故が起こりえます。
非公開状態の下書き記事として作成するコマンドもありますので、それを使えば事故を防げます。
次のコマンドで、下書き記事を作成します。

```shell terminal
hexo new draft "article-name"
```

ただし、下書き記事は、手元で`Hexo`サーバーを起動しても、初期状態のままだとブログの記事として表示できません。
`package.json`の`server scripts`コマンドに手を加える必要があります。

```text package.json（※コピーせず、ご自身の手で修正してください）
  "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server --drafts" // 「 --drafts」を後ろに追加
  },
```

このあとは、通常通り`Hexo`サーバーを起動させるだけです。

```shell terminal
npm run clean && npm run server
```

さて、上記の手順は、あくまで手元で表示できるようにしただけであって、お外では依然として下書き記事が非公開状態として扱われます。
前述の通り、投稿記事は公開状態として扱われるので、下書き記事を投稿記事に変換しましょう。
下記のコマンドを実行することで実現できます。

```shell terminal
hexo publish "article-name"
```

### GitHub Pages にデプロイ

それでは、準備も整ったと思いますので、`GitHub Pages`にデプロイしましょう！
デプロイは下記のコマンドを実行するだけで終わります。

{% message color:warning %}
Windows で下記のコマンドを実行するには、"PowerShell 7.x"が必要です。
それ以下のバージョンしか使えないなど制約がある場合は、二つのコマンドを順番に実行してください。
{% endmessage %}

```shell terminal
npm run clean && npm run deploy
```

### カスタムドメイン登録

`GitHub Pages`のデフォルトドメインは、`アカウントID.github.io`となるため、嫌な人もいるでしょう。
もちろん、カスタムドメインを無料で登録することもできます。
詳細については、{% anchor "GitHub公式ドキュメントの説明" https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site true "カスタムドメイン管理" %}にお任せします。

ただし、カスタムドメインの取得自体はご自身でやる必要がありますので、ドメインを取得できるサービスをご利用ください。
ドメインだけ取りたいなら、{% anchor "お名前ドットコム" https://www.onamae.com/ true "お名前ドットコム" %}がオススメです。

## 検索できるようにしよう

ここまできたらあと少しで終わりです。お外に公開したブログを検索できるようにしてみましょう。

### Google Analytics 登録

{% message color:info %}
所有者確認のみしたい場合は、この手順はスキップしても問題ありません。
{% endmessage %}

お外に公開したブログのアクセス解析と、"Google Search Console"（以下、GSC）の所有者確認のために、"Google Analytics"（以下、GA）にアカウントを作成します。

アカウント作成は、{% anchor "GoogleのAnalyticsページ" http://www.google.com/analytics true "Google Analytics" %}から行ってください。
単語がよくわからなかったり、手順は面倒だったりしますが、作業自体はそれほど難しくはないので、ここでの説明は省きます。
Google 検索すると、{% anchor "詳しく説明してくれている方たち" https://www.google.com/search?client=firefox-b-d&q=Google+Analytics+%E7%99%BB%E9%8C%B2 true "Google検索結果" %}がいますので、彼らのページを見ることをオススメします。

### サイトマップ作成

ブログに書いた記事を、GSC に認知してもらうためにサイトマップを作成します。
もちろん手作業で作る必要はなく、`Hexo`公式が`hexo-generator-sitemap`プラグインを用意しているので、それをインストールしましょう。

```shell terminal
npm install hexo-generator-sitemap
```

インストールが終わったら、ブログの設定ファイル`_config.yml`を開いて、サイトマップ作成用の設定を追加します。

```yaml _config.yml
# Sitemap
sitemap:
  path:
    - sitemap.xml
  tags: false
  categories: false
```

設定はこれだけでOKです。デプロイコマンドを実行する度に、`Hexo`がブログのサイトマップを作って、`GitHub Pages`にデプロイしてくれるようになります。

### Google Search Console 登録

GSCに{% anchor "ブログの登録（または、プロパティ追加）" https://search.google.com/search-console/about?hl=ja true "Google Search Console" %}を行います。
登録を行うことで、Google 検索結果にインデックスが作成することができます。

はじめに所有者確認を行う必要がありますので、GA・HTML ファイル・HTML タグ・Google タグマネージャー・ドメインの5つの中から確認方法を選んでください。
前述の手順で GA 登録を行っている方は、GA を選ぶと良いでしょう。それ以外の方は、HTML タグか、ドメインのどちらかで確認を行うのがオススメです。
なお、HTML ファイルでの確認方法は、`Hexo`が自動でテンプレートを適用して表示してしまい、Google が確認できないため、使用不可能です。

所有者確認が済んだ後に、作成したサイトマップの登録を行います。数日後にクロールしてくれるかもしれません（※私はされなかった）。
ちなみに、後日「検出 - インデックス未登録」とされた場合は、未登録ページの一覧が見れますので、一つずつインデックス登録してあげましょう。

## おわりに

とても楽にブログを作れるし、カスタマイズも簡単だし、さらに無料でホスティングできるとは、便利な世の中になったものだなぁ（小並感）。
私は、十数年前の学生時代に、さくらインターネット + WordPress でブログを作っていましたが、このようになるとは露程も思っていませんでした。
イマどきホスティングでブログを作ろうなんて酔狂な人は少ないかもしれませんが、機会があれば是非参考にしてみてください。

あぁ、早く仕事片付かないかなぁ。千恋万花プレイしたいなぁ。

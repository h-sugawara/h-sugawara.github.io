---
title: Hexo.jsで自分好みの高機能なブログを手軽に作ろう
date: 2023-12-21 09:00:00
updated: 2025-02-02 14:00:00
tags:
  - ブログ作成・改良
  - Advent Calendar
  - npm
  - Hexo
  - Icarus
categories:
  - Technology
  - Frontend
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology/blog/title.webp
thumbnail: /images/thumbnails/hexo_thumbnail.webp
cover:
  image: /images/technology/blog/cover.webp
  sources:
    small: /images/technology/blog/cover_small.webp
    medium: /images/technology/blog/cover_medium.webp
    large: /images/technology/blog/cover_large.webp
---

Hexo.js をジェネレータとして、テーマやプラグインを使って自分好みにカスタマイズできる高機能なブログを、簡単に作成する手順をご紹介します。

<!-- more -->

{% message color:info %}
この記事は、[mediba Advent Calendar 2023](https://qiita.com/advent-calendar/2023/mediba) の22日目にエントリーしています。
Hexo.js でブログを公開する手順については、ブログ作成シリーズの{% post_link open-hexo-blog-up-to-the-public '後編記事「Hexo製ブログをGitHub Pagesで公開して検索可能にする」' %}をご覧ください。
{% endmessage %}

## はじめに

### 筆者の紹介

KDDI の子会社である mediba でテックリードをしている雑食系雑用エンジニア。インフラ、フロントエンド、バックエンド、SRE、CI/CD などプロダクトに必要な役割は、何でもやる人（注：バックエンドが本職）。この記事が投稿される頃は、忙しすぎて死にそうになっているでしょう。誰か私を救ってくれ。

### 目的・ゴール

この記事をひと通り読んだ後に、Hexo.js でブログを作成できるようになっていること。もしくは、この記事を読みながらブログを作成できること。

### 読者ターゲット

この記事は、以下のような方が読むことをオススメします。

- 一般的なブログサービスを使わずに、自分の力だけでブログを開設したい人
- メンテナンスやセキュリティ等の宗教上の理由で、WordPress を採用したくない人
- カスタムドメインを使ったり、ブログを自由自在にカスタマイズしたり等、やりこみたい人

### 記事が生まれたきっかけ

書いた{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}を投稿する場所と方法を探していたことがきっかけです。作中のスクショを張りたかったことと、R18 指定のゲームだったこともあり、Ameba や FC2 等のブログサービスを使用せず、ホスティングしようと考えました。
場所は、GitHub Pages で静的サイトホスティングができることは知っていたので、すぐに決まりました。あとは、ブログに必要なウェブページ一式を生成するジェネレーターを探すだけでした。紆余曲折あって、Hexo.js に辿り着き、これを使うことにしました。こうして、このブログが Hexo.js + GitHub Pages で爆誕し、さらにこの記事が生み出されたのです。
なお、Hexo と書かれていると、**ヘクソ**と読みがちですが、**ヘキソ**の読みが正しいようです。ぶっちゃけ、どっちでも伝わるとは思うので、どっちの呼び方でも良いと思います。

## 手元でブログを作成する

まずは、手元でブログを作って、ローカル環境のパソコン内で動かします。

### ローカル環境の整備

{% message color:info %}
Node.js のバージョン管理ツールをインストールしておくと楽です。

- Windows の場合、nvm-windows をインストール。
- Mac または Linux の場合、お好きなツールをインストール。

Git はインストール必須です。

- Windows の場合は、[Git for Windowsを公式サイトからダウンロード](https://gitforwindows.org/)し、インストール。
- Mac の場合は、HomeBrew 等でインストール。
- Linux の場合は、apt-get や yum でインストール。
{% endmessage %}

#### (1) Node.js 最新版インストール

1. Node.js のバージョン管理ツールから最新版をインストールします。
    - 大抵のツールは、インストール後にバージョン切り替えをしないので、自分でインストールしたバージョンに変更するコマンドを実行してください。
    - その後、`node -v` コマンドで、最新バージョンに切り替わっていることを確認してください。
2. npm を最新バージョンに更新します。

#### (2) hexo-cli コマンドのインストール

npm 経由で、`hexo-cli` コマンドをインストールします。

```shell
npm install -g hexo-cli
```

### ブログセットアップ

#### (1) 初期化

以下のコマンドで、blog ディレクトリ配下にブログ一式を作成します。ディレクトリの名前は、任意のものに変えても大丈夫です。

```shell
hexo init blog
```

#### (2) インストール

作成したディレクトリに移動し、`npm install` コマンドを実行します。

{% message color:info %}
手順 (1) で、ディレクトリを違う名前で作成した場合は、blog をその名前に読み替えてください。
{% endmessage %}

```shell
cd ./blog
npm install
```

これだけでブログのセットアップは完了です。ね？簡単でしょ？

#### (3) 表示確認

では、下記のコマンドを実行してセットアップしたブログを表示してみましょう！

{% message color:warning %}
Windows で下記のコマンドを実行するには、PowerShell 7.x が必要です。それ以下のバージョンしか使えないなど制約がある場合は、二つのコマンドを順番に実行してください。
{% endmessage %}

```shell
npm run clean && npm run server
```

コマンド実行時にログにも出ますが、Ctrl+C で Hexo サーバーを止められます。

### カスタムテーマの導入

初回セットアップ時のデフォルトテーマは、「landscape」です。最低限のことはできます。しかし、見た通りデザインがイケてませんし、オシャレ感が足りません（※個人の感想です）。そんな人のために、Hexo 公式ホームページから、[有志が作成したテーマを検索](https://hexo.io/themes/)できるようになっています。

#### おすすめのテーマは？

検索してみるとたくさんあって悩みますが、私の一番のおすすめは「Icarus」テーマです。「Icarus」テーマの公式ドキュメントに[インストール手順](https://ppoffice.github.io/hexo-theme-icarus/uncategorized/getting-started-with-icarus/)があるので、導入してみてください。

{% message color:warning %}
`npm install` で導入した場合は、フォントを変更できません（不可能ではないが非推奨です）。`git clone` する方法、または、GitHub から Download zip する方法で導入することを推奨します。
{% endmessage %}

### ブログ設定の調整

手元で確認した時に「ブログのタイトルを変えたい」等思った方はいらっしゃると思います。blog ディレクトリの直下に、ブログの設定ファイルがあるので、その中身を次のように書き換えていきます。

{% message color:info %}
セクション「ブログセットアップ」の手順 (1) で、ディレクトリを違う名前で作成した場合は、blog をその名前に読み替えてください。
{% endmessage %}

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
他の設定については、Hexo 公式ホームページに[設定に関する詳細説明](https://hexo.io/ja/docs/configuration)がまとめられているので、そちらをご確認ください。

### 記事の生成と書き方

#### (1) 記事ファイル生成

次のコマンドを実行して、記事を作成します。

{% message color:info %}
コマンド中の `article-name` 部分は、記事名ですので、自由に入力してかまいません。
{% endmessage %}

```shell
hexo new post "article-name"
```

#### (2) 記事のメタ情報を書く

`source/_posts` ディレクトリ直下に、Markdown 形式のファイルとして、記事が生成されます。このファイルは、次のような内容になっています。

```yaml
---
title: article-name
date: 2024-12-22 09:00:00
tags:
---
```

`---` で囲まれた部分を「Front Matter」と呼び、Hexo では記事のメタ情報を記載する場所です。
記事のタイトルは、`title` フィールドの値を参照するので、ここを表示したいタイトル文言に変えてください。他にも、導入したカスタムテーマによっては、カスタムフィールドが用意されている場合があります（例：Icarus テーマなら、`thumbnail` や `cover` 等）。お好みで追加の設定をしてください。

#### (3) 記事の本文を書く

ブログの本文は、「Front Matter」の後に記述します。
以下は、当ブログで実際に執筆した記事を引用したもので、「Front Matter」に色々と設定したり、本文を書いたりしています。本文中の `<!-- more -->` は何かというと、「続きを読む」ボタンを差し込み、後続の文章を隠すための機能です。これより前の文章がインデックスページに抜粋として表示されます。

```yaml source/_posts/2023_12_22_article-name.md
---
title: Hexo.js+GitHub Pagesで高機能ブログを手軽に作ろう
date: 2023-12-22 09:00:00
updated: 2023-12-22 09:00:00
tags:
  - ブログ作成
  - Hexo
  - Icarus
  - npm
  - Advent Calendar
category: Technology
---

ちゃろー☆今年もアドベントカレンダーの時期がやってきました！
今年は、例年通りのGitHub Actionsネタではなく、GitHub Pagesネタで提供させていただきます。

<!-- more -->

## はじめに
```

### その他のカスタマイズ

ここまでの手順で、ブログとしてはほぼ完成しています。あとは、テーマのデザインを弄ったり、プラグインを入れたりなど、皆様のお好みでどうぞ。

#### Icarus テーマのカスタマイズ

Icarus テーマを導入した方は、日本語の表示時フォントが `Microsoft YaHei` になっています。
見慣れているフォントに変えたいなら、フォント設定に関する処理を書き換えると変更できます（※前項「カスタムテーマ導入」の注意事項を読んでください）。やり方については、[「Hexoのicarusテーマのフォントの変え方」](https://omathin.com/icarus-theme-change/)や[「HEXO の表示フォントを変更」](https://fennote.fareastnoise.com/2022/03/07/hexo-change-fonts/)をまねてみると良いでしょう。

#### リンクプレビュー機能のプラグイン

リンクプレビュー機能を導入したい方は、私が自作プラグインを作ってみたので、以下の記事も併せて読んでみてください。

{% link_preview https://blog.chaotic-notes.com/articles/hexo-link-preview-npm-publish/ %}hexo-tag-ogp-link-previewプラグインの公開秘話{% endlink_preview %}

## おわりに

とても楽にブログを作れるし、カスタマイズも簡単だし、さらに無料でホスティングできるとは、便利な世の中になったものだなぁ（小並感）。私は、十数年前の学生時代に、さくらインターネット + WordPress でブログを作っていましたが、このようになるとは露程も思っていませんでした。
イマどきホスティングでブログを作ろうなんて酔狂な人は少ないかもしれませんが、機会があれば是非参考にしてみてください。

### 関連記事

#### ブログ作成

- {% post_link open-hexo-blog-up-to-the-public '後編「Hexo製ブログをGitHub Pagesで公開して検索可能にする」' %}

#### 自作Hexoプラグイン

- {% post_link hexo-link-preview-npm-publish '「hexo-tag-ogp-link-preview v1.0」のリリース解説' %}
- {% post_link update-hexo-link-preview-plugin-v1-1-0 '「hexo-tag-ogp-link-preview v1.1」のリリース解説' %}

### 参考文献

#### ローカル環境整備

- [Git for Windows](https://gitforwindows.org/)

#### Hexo 公式

- [設定 | Hexo](https://hexo.io/ja/docs/configuration)
- [Themes | Hexo](https://hexo.io/themes/)

#### icarus テーマ

- [Getting Started with Icarus - Icarus](https://ppoffice.github.io/hexo-theme-icarus/uncategorized/getting-started-with-icarus/)
- [Hexoのicarusテーマのフォントの変え方 - omathin blog](https://omathin.com/icarus-theme-change/)
- [HEXO の表示フォントを変更 - FENNOTE](https://fennote.fareastnoise.com/2022/03/07/hexo-change-fonts/)

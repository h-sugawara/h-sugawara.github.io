---
title: Hexo.js+GitHub Pagesで高機能ブログを手軽に作ろう
date: 2023-12-21 09:00:00
updated: 2024-02-05 08:30:00
tags:
  - ブログ作成
  - Hexo
  - Icarus
  - npm
  - Advent Calendar
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

ちゃろー☆今年もアドベントカレンダーの時期がやってきました！
今回は、例年通りのGitHub Actionsネタではなく、GitHub Pagesネタを提供します。

<!-- more -->

{% message color:info %}
この記事は、[mediba Advent Calendar 2023 の22日目](https://qiita.com/advent-calendar/2023/mediba)にエントリーしています。
{% endmessage %}

## はじめに

{% message color:info title:2024年02月05日更新 %}
2024年02月05日に、この記事を「ブログ作成」シリーズとして前後編の二つに分割しました。この記事は、前編の記事となります。
後半は、「{% post_link open-hexo-blog-up-to-the-public 'Hexo製ブログを公開してGoogle検索できるようにする' %}」の記事で読むことができます。
{% endmessage %}

### この記事を書いている人

KDDI の子会社である mediba でテックリードをしている雑食系雑用エンジニア。
インフラ、フロントエンド、バックエンド、SRE、CI/CDなどプロダクトに必要な役割は、何でもやる人です（注：バックエンドが本職）。

この記事が投稿される頃は、忙しすぎて死にそうになっているでしょう。誰か私を救ってくれ。

### この記事の存在意義

読者様が、この記事をひと通り読んだ後に Hexo.js + GitHub Pages のブログを作成できるようになっていること。
もしくは、この記事を読みながらブログを作成できること。

### この記事を推したい読者様

この記事を読んで嬉しくなる読者様は、以下のような方を想定しています。

-  一般的なブログサービスを使わずに、自分の力だけでブログを開設したい人
- メンテナンスやセキュリティ等の宗教上の理由で、WordPress を採用したくない人
- カスタムドメインを使ったり、ブログを自由自在にカスタマイズしたり等、やりこみたい人

### この記事が生まれたきっかけ

書いた{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}を投稿する場所と方法を探していたことがきっかけです。

作中のスクショを張りたかったことと、R18 指定のゲームだったこともあり、Ameba や FC2 等のブログサービスを使用せず、ホスティングしようと考えました。
GitHub Pages で静的サイトホスティングができることは知っていたので、場所はすぐに決まりました。
あとは、ブログに必要なウェブページ一式を生成するジェネレーターを探すだけでした。
紆余曲折あって、Hexo.js に辿り着き、これを使うことにしました。

こうして、このブログが Hexo.js + GitHub Pages で爆誕し、さらにこの記事が生み出されることとなったのです。

なお、Hexo と書かれていると、**ヘクソ**と読みがちですが、**ヘキソ**の読みが正しいようです。
ぶっちゃけ、どっちでも伝わるとは思うので、どっちの呼び方でも良いと思います。

## 手元でブログを作ろう

御託を並べる暇があったら、早く作成手順を見せろ、とそろそろ言われそうなので、構築編に移りましょう。
まずは、手元でブログを作って、ローカル環境のパソコン内で動かしてみます。

### ローカル環境整備

{% message color:info %}
Node.js のバージョン管理ツールをインストールしておくと楽です。
・Windows => nvm-windows をインストール。
・Mac または Linux => お好きなツールをインストール。

Git はインストール必須です。
・Windows => [Git for Windowsを公式サイトからダウンロード](https://gitforwindows.org/)し、インストール。
・Mac => HomeBrew 等でインストール。
・Linux => apt-get や yum でインストール。
{% endmessage %}

#### (1) Node.js 最新版インストール

1. Node.js のバージョン管理ツールから最新版をインストールします。
大抵のツールは、インストール後にバージョン切り替えをしないので、自分でインストールしたバージョンに変更するコマンドを実行してください。
その後、`node -v`コマンドで、最新バージョンに切り替わっていることを確認してください。
2. npm を最新バージョンに更新します。

#### (2) hexo-cli インストール

npm 経由で、hexo-cli をインストールします。

```shell terminal
npm install -g hexo-cli
```

### ブログセットアップ

#### (1) ブログ一式を作成

以下のコマンドで、"blog"ディレクトリ配下にブログ一式を作成します。
"blog"は、任意の名前に変えても大丈夫です。

```shell terminal
hexo init blog
```

#### (2) npm install

"blog"ディレクトリ(※)に移動し、`npm install`コマンドを実行します。
(※) 任意の名前で作成した場合、"blog"を読み替えてください。

```shell terminal
cd ./blog
npm install
```

これだけでブログのセットアップは完了です。ね？簡単でしょ？

#### (3) 表示確認

では、下記のコマンドを実行してセットアップしたブログを表示してみましょう！

{% message color:warning %}
Windows で下記のコマンドを実行するには、"PowerShell 7.x"が必要です。
それ以下のバージョンしか使えないなど制約がある場合は、二つのコマンドを順番に実行してください。
{% endmessage %}

```shell terminal
npm run clean && npm run server
```

コマンド実行時にログにも出ますが、Ctrl+C で Hexo サーバーを止められます。

### カスタムテーマ導入

初回セットアップ時のデフォルトテーマは、landscape テーマというものです。
最低限のことはできるのですが、見た通りデザインがイケてません。オシャレ感が足りません。
そんな人のために、[Hexo公式から有志が作成したテーマを検索](https://hexo.io/themes/)できるようになっています。

検索してみるとたくさんあって悩みますが、私の一番のおすすめは Icarus テーマです。
Icarus テーマの[公式ドキュメントにインストール手順がある](https://ppoffice.github.io/hexo-theme-icarus/uncategorized/getting-started-with-icarus/)ので、導入してみてください。

{% message color:warning %}
`npm install`で導入した場合は、フォントを変更できません（不可能ではないが非推奨）。
`git clone`する方法、または、GitHub から Download zip する方法で導入することを推奨します。
{% endmessage %}
{% message color:info %}
Icarus テーマの最新版 v5.x は、Hexo v6.x ベースで作成されています。
そのため、ブログ側の Hexo を最新版の v7.x ではなく v6.x にすると、互換性に関わる問題が発生しにくいでしょう。
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
他の設定については、[Hexo公式ホームページに設定に関する詳細説明がまとめられている](https://hexo.io/docs/configuration)ので、そちらをご確認ください。

### 試しに記事を書いてみる

ブログは記事がなければ何も始まらないので、さっそく作りましょう。

#### (1) 記事ファイル生成

Hexo で記事を作成するには、以下のコマンドを実行します。

{% message color:info %}
記事名（コマンド中の article-name 部分）は、自由に入力してかまいません。
{% endmessage %}

```shell terminal
hexo new post "article-name"
```

#### (2) 記事のメタ情報を書く

記事は、"source/_posts"ディレクトリ直下に、MarkDown 形式のファイル（コマンド通りに実行した時は、"2023_12_22_article-name.md"）が生成されます。
このファイルを開いてみると、中身はこんな感じになっています。

```markdown source/_posts/2023_12_22_article-name.md
---
title: article-name
date: 2024-12-22 09:00:00
tags:
---
```

`---`で囲まれた部分を"Front Matter"と呼び、Hexo では記事のメタ情報を記載する場所です。
"title"は、記事タイトルに使われるので、ここを任意の日本語に変えちゃいましょう。
他にも、テーマによってはカスタムフィールドがあります（例：Icarus テーマなら、"thumbnail"や"cover"等）ので、お好みで設定してください。

#### (3) 記事の本文を書く

そして、ブログの本文は、"Front Matter"の後に記述します。

実際の記事の執筆は、下記のように"Front Matter"に色々と設定したり、本文を書いたりします。
なお、本文中に`<!-- more -->`を入れると、その位置に「続きを読む」ボタンを差し込めます。

```markdown source/_posts/2023_12_22_article-name.md
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

### その他カスタマイズする

ここまでの手順で、ブログとしてはほぼ完成しています。

Icarus テーマを導入した方は、日本語の表示時フォントが"Microsoft YaHei"になっています。
見慣れているフォントに変えたいなら、フォント設定に関する処理を書き換えると変更できます（※前項「カスタムテーマ導入」の注意事項を読んでください）。
やり方については、[「Hexoのicarusテーマのフォントの変え方」](https://omathin.com/icarus-theme-change/)や[「HEXO の表示フォントを変更」](https://fennote.fareastnoise.com/2022/03/07/hexo-change-fonts/)をまねてみると良いでしょう。

あとは、テーマのデザインを弄ったり、プラグインを入れたりなど、皆様のお好みでどうぞ。
リンクプレビュー機能を導入したい方は、私がプラグインを作ってみたので、以下の記事も併せて読んでみてください。

{% link_preview https://blog.chaotic-notes.com/articles/hexo-link-preview-npm-publish/ %}hexo-tag-ogp-link-previewプラグインの公開秘話{% endlink_preview %}

## 後編へ続く

続きは、「{% post_link open-hexo-blog-up-to-the-public 'Hexo製ブログを公開してGoogle検索できるようにする' %}」をご覧ください。

## おわりに

とても楽にブログを作れるし、カスタマイズも簡単だし、さらに無料でホスティングできるとは、便利な世の中になったものだなぁ（小並感）。
私は、十数年前の学生時代に、さくらインターネット + WordPress でブログを作っていましたが、このようになるとは露程も思っていませんでした。
イマどきホスティングでブログを作ろうなんて酔狂な人は少ないかもしれませんが、機会があれば是非参考にしてみてください。

あぁ、早く仕事片付かないかなぁ。千恋万花プレイしたいなぁ。

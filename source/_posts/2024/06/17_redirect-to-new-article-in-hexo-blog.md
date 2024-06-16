---
title: GitHub PagesのHexo製ブログ記事のURLを差し替える
date: 2024-06-17 09:00:00
updated: 2024-06-17 09:00:00
tags:
  - ブログ改良
  - Hexo
  - GitHub
  - GitHub Pages
  - SEO
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

GitHub Pages+Hexo.js のブログで、Google 検索エンジンにインデックス登録済みされた投稿記事を新しい URL に差し替える方法を、備忘録も兼ねて紹介します。

<!-- more -->

## はじめに

### 存在意義

この記事を読み終わった後に、GitHub Pages+Hexo.js のブログで、投稿済み記事を新しい URL に差し替えられるようになっていること。

### 推したい読者様

Google 検索エンジンにインデックス登録した後に、投稿記事の URL を変えるために _config.yml の permalink 設定値を変更したけれども、それからどうすれば良いか分からない、という人。

### 前提条件

Hexo.js v6.x 以降をジェネレータ―とするブログを、GitHub Pages 上でホスティングしている。

## Google 検索エンジン対応

投稿記事の URL が、Google 検索エンジンのインデックスに登録済みであれば、URL が変わったことを伝えなければいけません。その方法として、新しい URL へリダイレクトするようにします。

### リダイレクト方法

Google 検索エンジンは、リダイレクトを、永続的か、一時的か、厳密に認識します。
これらは、検索結果で表示する URL の取り扱い方法が異なります。
一時的なリダイレクトであれば、検索結果はそのままで、永続的なリダイレクトであれば、検索結果を新しい URL に置き換えます。
この記事の要件では、記事の URL を置き換えたいので、永続的な方法を採用する必要があります。

#### 永続的なリダイレクトの種類

永続的なリダイレクトは、サーバーサイドでもクライアントサイドでも、どちらでも実現できます。
とはいえ、GitHub Pages でホスティングしている場合、サーバーサイドでのリダイレクト設定を、ユーザーが行うことは一切できません（ただし、Trailing Slash が必要なページ URL の末尾にスラッシュなしでアクセスした時のみ、301 リダイレクトが発動します）。
そして、クライアントサイドのリダイレクト方法のうち、`JavaScript location`は、Google から推奨されていないため、使える方法は、実質的に `HTML meta refresh (0 sec)`の一択となります。

| 方法                            | 説明                 | GitHub Pages で使えるか？ |
|:------------------------------|:-------------------|:-------------------:|
| HTTP 301 Moved Permanently    | HTTP リダイレクト        |    △（特定条件下のみ利用可）    |
| HTTP 308 Permanent Redirect   | HTTP リダイレクト        |          ×          |
| **HTML meta refresh (0 sec)** | HTML リダイレクト        |          ○          |
| JavaScript location           | JavaScript リダイレクト  |    △（Google 非推奨）    |

### HTML meta refresh

http-equiv 属性の値を refresh とする meta タグを head タグに含めることで、ブラウザでページが読み込まれた時にリダイレクトさせられます。
このとき、meta タグの content 属性の値は、`待機秒数（※整数で単位は不要）; url=リダイレクト先のURL`の書式で記述します。
ブラウザは、0秒指定の時はすぐにリダイレクトを行い、1秒以上を指定した時はその秒数分待ってからリダイレクトを行います。
Google 検索エンジンにとっては、0秒指定のものを永続的なリダイレクト、1秒以上のものを一時的なリダイレクトとして扱います。

```html https://www.mozilla.org へ即時リダイレクト
<!doctype html>
<html lang="ja">
<head>
    <meta http-equiv="refresh" content="0;url=https://www.mozilla.org" />
    <title>Example title</title>
</head>
<!-- ... 省略 ... -->
</html>
```

##  Hexo で差し替える方法

Hexo の初期状態では、投稿済み記事の URL を差し替える機能がありません。
そのため、`HTML meta refresh`をさせるには、次の2種類のどちらかで対応します。

1. テーマテンプレートの改造
2. プラグインの導入

テーマテンプレートの改造は、難易度が高い割に、リダイレクト元となるソースファイルも自分で用意する必要があり、コストパフォーマンスが非常に悪いです。
そのため、本記事では、とても簡単にできるプラグイン導入で対応する手順を紹介します。

### プラグイン導入で対応

#### (1) プラグインのインストール

`hexo-generator-alias`プラグインの最新版をインストールします。

```shell terminal
npm install hexo-generator-alias
```

#### (2) Front Matter に追加

新 URL にリダイレクトさせたい記事の Front Matter に、旧 URL を記述（パス部分のみでOK）した alias を追加します。
下記の場合は、旧 URL のパス`/2023/11/08/riddle-joker-review/`から、新 URL へ、リダイレクトさせる設定となります。

{% message color:warning %}
Front Matter に設定する alias については、下記の2点に注意してください。
1. _config.yml の permalink 設定値のパターンと一致しないように記述してください。
2. 値として記載する旧 URL は、".html"で終わるように記述しなければいけません。
{% endmessage %}

```markdown FrontMatter の記述例
---
title: RIDDLE JOKER 感想＆評価 レビュー
alias: 2023/11/08/riddle-joker-review/index.html
---
```

#### (3) 動作確認

Hexo サーバーを起動します。

```shell terminal
npm run server
```

サーバー起動後に、ブラウザでリダイレクトの確認をします。
例えば、手順(2)の記事の動作確認をする場合は、ブラウザのアドレスバーを http://localhost:4000/2023/11/08/riddle-joker-review/ に変更して開きます。

{% message color:warning %}
表示確認において下記の2点を留意してご利用ください。
1. ローカル環境のドメインは、Hexo.js の設定により異なる可能性があります。
2. 表示確認時のリダイレクト先は、GitHub Pages でホスティングしているページです。<br />変更後のページが存在しない場合、404 エラーとなります。
{% endmessage %}

### プラグインの別の使い方

{% message color:warning %}
下記の使い方は、投稿済み記事(post)やドラフト記事(draft)で設定した場合、Home 等の記事一覧画面を読み込むとリダイレクトが発生して正常表示できません。
{% endmessage %}

#### (1) 別の記事やページへリダイレクト

既に存在する記事やページへリダイレクトするように設定できます。
主たる利用目的は、特定のページから別の記事やページへ、リダイレクトさせることでしょう。

```markdown FrontMatter の記述例
---
title: RIDDLE JOKER 感想＆評価 レビュー
redirect: /article/riddle-joker-review/
---
```

#### (2) 外部サイトへリダイレクト

外部サイトへのリダイレクトも可能です。用途はなさそうですが、できますので紹介しておきます。

```markdown FrontMatter の記述例
---
title: Example title
redirect: https://www.mozilla.org
---
```

## おわりに

ちなみに、Search Console で、インデックスから古い URL を削除した後に、新しい URL で新規にインデックス登録することもできます。
ただし、この方法だと、Search Console の削除履歴に残ることと、完全削除はできず期限が切れたら検索結果に復活することなど、色々と不都合があります。
そのため、本記事で紹介した方法でアプローチする方が、SEO の側面からもコストの側面からも優位性は十分にあります。
「検索にヒットしていれば、こんなに苦労することなかったのに」と思ってまとめた記事ですので、みなさんのお役に立てれば幸いです。

### 参考文献

#### リダイレクト

- [hexojs/hexo-generator-alias](https://github.com/hexojs/hexo-generator-alias)
- [リダイレクトと Google 検索](https://developers.google.com/search/docs/crawling-indexing/301-redirects?hl=ja)

#### HTTP レスポンスステータスコード

- [HTTP 301 Moved Permanently](https://developer.mozilla.org/ja/docs/Web/HTTP/Status/301)
- [HTTP 308 Permanent Redirect](https://developer.mozilla.org/ja/docs/Web/HTTP/Status/308)

#### HTML 仕様

- [meta 要素の http-equiv](https://developer.mozilla.org/ja/docs/Web/HTML/Element/meta#http-equiv)

---
title: GitHub PagesのHexo製ブログの記事URLを差し替える
date: 2024-06-17 09:00:00
updated: 2025-01-21 18:00:00
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

GitHub Pages でホスティングしている Hexo.js 製ブログの記事 URL を変更して、検索エンジンに認知させる方法を紹介します。

<!-- more -->

## はじめに

### 存在意義

この記事を読み終わった後に、GitHub Pages でホスティングしている Hexo.js 製ブログの投稿済み記事を、検索エンジンに認知させる方法で、新しい URL に差し替えられるようになっていること。

### 推したい読者様

Google 検索エンジンにインデックス登録した後に、投稿記事の URL を変えるために `_config.yml` の `permalink` 設定の値を変更したけれども、それからどうすれば良いか分からない、という人。

### 前提条件

ブログのジェネレータ―に Hexo.js のバージョン 6.x 以降を使用しており、GitHub Pages でホスティングしている。

## Google 検索エンジン対応

ブログの投稿済み記事が、Google 検索エンジンのインデックスに登録済みの場合、URL が変わったことを伝えなければいけません。その方法として、新しい URL の記事へリダイレクトするようにします。

### リダイレクト方法

Google 検索エンジンは、リダイレクトが永続的なものであるか、あるいは、一時的なものであるかを厳密に認識します。これらの違いは、検索結果で表示される URL がどのように扱われるか、にあります。一時的なリダイレクトであれば、検索結果はそのまま維持され、永続的なリダイレクトであれば、検索結果は新しい URL に置き換えられます。
今回は、記事 URL を置き換えたいので、永続的なリダイレクトであると検索エンジンに認識させなければなりません。

#### 永続的なリダイレクトの種類

永続的なリダイレクトは、サーバーサイドでもクライアントサイドでも、どちらでも実現できます。しかし、GitHub Pages でホスティングしている場合は、制約があります。それは、我々ユーザー側から、サーバーサイドのリダイレクト設定を任意に変更することは一切できない、ということです。したがって、クライアントサイドでリダイレクトすることで、永続的なリダイレクトを実現しなければなりません。

{% message color:warning %}
GitHub Pages は、 Trailing Slash が必要なページ URL の末尾にスラッシュなしでアクセスした時のみ、`301 Moved Permanently` の永続的リダイレクトが発動します。
{% endmessage %}

さて、下表の４つの方法が、永続的なリダイレクトに分類されます。これらのうち、`HTTP 301 Moved Permanently` と `HTTP 308 Permanent Redirect` の HTTP ステータスコードを設定することが前述の通りできず、加えて、`JavaScript location` は、Google から推奨されていません。
結果として、GitHub Pages で使える方法は、`HTML meta refresh (0 sec)` の一択に限られます。

| 方法                            | 種類                | GitHub Pages で使えるか？ |
|:------------------------------|:------------------|:-------------------:|
| `HTTP 301 Moved Permanently`  | HTTP リダイレクト       |  △<br/>※特定条件下のみ利用可  |
| `HTTP 308 Permanent Redirect` | ^^                |          ×          |
| `HTML meta refresh (0 sec)`   | ^^                |          ○          |
| `JavaScript location`         | JavaScript リダイレクト |  ○<br/>※Google 非推奨  |

### HTML meta refresh

`HTML meta refresh` とは、`http-equiv` 属性の値を `refresh` とする `meta` タグを `head` タグに含めることで、ブラウザでページが読み込まれた時に、任意のページへリダイレクトさせられる機能のことです。
`meta` タグの `content` 属性の値には、`待機秒数（※整数で単位は不要）; url=リダイレクト先のURL` の書式で記述します。例えば、`https://www.mozilla.org` へリダイレクトする場合は、次のようになります。

```html
<!doctype html>
<html lang="ja">
<head>
    <meta http-equiv="refresh" content="0;url=https://www.mozilla.org" />
    <title>Example title</title>
</head>
<!-- ... 省略 ... -->
</html>
```

ブラウザは、待機秒数に 0 秒が指定されているのであれば、即座にリダイレクトを行い、1 秒以上が指定されているのであれば、その秒数分だけ待ってからリダイレクトします。Google 検索エンジンにとっては、0 秒指定のものを永続的なリダイレクト、1 秒以上のものを一時的なリダイレクトとして扱います。

##  Hexo で差し替える方法

Hexo の初期状態では、投稿済み記事の URL を差し替える機能がありません。そのため、次の二つの方法のうち、どちらかで対応することで、リダイレクトさせなければなりません。

1. テーマテンプレートの改造
2. プラグインの導入

一つ目として挙げた「テーマテンプレートの改造」は、難易度が高い割に、リダイレクト元となるソースファイルも自分で用意する必要があり、コストパフォーマンスが非常に悪く、オススメできません。
そのため、導入が簡単な、二つ目の方法の「プラグインの導入」で対応する手順を紹介します。

### プラグイン導入で対応

#### (1) プラグインのインストール

hexo-generator-alias プラグインの最新版を、次のコマンドでインストールします。

```shell
npm install hexo-generator-alias
```

#### (2) Front Matter に追加

新しい URL にリダイレクトさせたい記事のソースファイルの Front Matter に、古い URL を記述（パス部分のみでOK）した `alias` フィールドを追加します。下記のように書いた場合は、古い URL のパス `/2023/11/08/riddle-joker-review/` から、新しい URL にリダイレクトさせる設定となります。

```yaml
---
title: RIDDLE JOKER 感想＆評価 レビュー
alias: 2023/11/08/riddle-joker-review/index.html
---
```

{% message color:warning %}
Front Matter に設定する `alias` については、下記の2点に注意してください。
1. `_config.yml` の `permalink` 設定の値のパターンと一致しないように記述してください。
2. 値として記載する旧 URL は、`.html` で終わるように記述しなければいけません。
   {% endmessage %}

#### (3) 動作確認

Hexo サーバーを起動して、ブラウザでリダイレクトの確認をします。手順「(2) Front Matter に追加」で変更した記事の動作確認をする場合は、古い URL である `http://localhost:4000/2023/11/08/riddle-joker-review/` を、ブラウザのアドレスバーに入力して、開きます。

```shell
npm run server
```

{% message color:warning %}
表示確認において下記の2点を留意してご利用ください。
1. ローカル環境のドメインは、Hexo.js の設定により異なる可能性があります。
2. 表示確認時のリダイレクト先は、GitHub Pages でホスティングしているページです。変更後のページが存在しない場合、404 エラーとなります。
{% endmessage %}

### プラグインの別の使い方

{% message color:warning %}
下記の使い方は、投稿済み記事(post)やドラフト記事(draft)で設定した場合、Home 等の記事一覧画面を読み込むとリダイレクトが発生して正常表示できません。
{% endmessage %}

#### (1) 別の記事やページへリダイレクト

Front Matter の `redirect` の値にパス形式で記述すると、既に存在する記事やページへリダイレクトできます。ユースケースは、特定のページから別の記事やページへ、リダイレクトさせることでしょうか。

```yaml
---
title: RIDDLE JOKER 感想＆評価 レビュー
redirect: /article/riddle-joker-review/
---
```

#### (2) 外部サイトへリダイレクト

Front Matter の `redirect` の値に URL 形式で記述すると、外部サイトへのリダイレクトも可能です。ウェブサイトのお引越し等、特別な目的以外での一般的な用途はなさそうです。

```yaml
---
title: Example title
redirect: https://www.mozilla.org
---
```

## おわりに

Google Search Console で、インデックスから古い URL を削除した後で、新しい URL で新規にインデックス登録できます。ただし、この場合は、Google Search Console の削除履歴に残ることと、完全削除はできず期限が切れたら検索結果に復活すること等、色々と不都合があります。そのため、今回紹介した方法を採用する方が、SEO の側面からもコストの側面からも優位性は十分にあります。
「検索にヒットしていれば、こんなに苦労することなかったのに」と思ってまとめた記事ですので、みなさんのお役に立てれば幸いです。

### 参考文献

#### プラグイン

- [hexo-generator-alias](https://github.com/hexojs/hexo-generator-alias)

#### リダイレクト

- [リダイレクトと Google 検索](https://developers.google.com/search/docs/crawling-indexing/301-redirects?hl=ja)
- [HTTP 301 Moved Permanently](https://developer.mozilla.org/ja/docs/Web/HTTP/Status/301)
- [HTTP 308 Permanent Redirect](https://developer.mozilla.org/ja/docs/Web/HTTP/Status/308)

#### HTML 仕様

- [meta 要素の http-equiv](https://developer.mozilla.org/ja/docs/Web/HTML/Element/meta#http-equiv)

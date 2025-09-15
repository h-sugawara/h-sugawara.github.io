---
title: hexo-tag-ogp-link-previewプラグインを公開しました
date: 2023-11-20 21:00:00
updated: 2025-01-16 17:00:00
tags:
  - 自作プラグイン
  - 解説
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
og_image: /images/technology/programming/title.webp
thumbnail: /images/thumbnails/technology/npm_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

2023年11月19日に npm で初公開の Hexo.js 製ブログ用リンクプレビュープラグインについて、開発経緯やデザイン設定例等を解説します。

<!-- more -->

## はじめに

### 何のためのプラグインか

hexo-tag-ogp-link-preview は、OpenGraph プロトコル対応のページから取得したデータを用いてリンクプレビューを生成し、Hexo のブログ記事に埋め込むためのプラグインです。

{% link_preview https://www.npmjs.com/package/hexo-tag-ogp-link-preview %}
hexo-tag-ogp-link-preview@npm
{% endlink_preview %}

FaceBook を始め X(Twitter) 等の SNS でリンク共有時に表示されるようなカードを、Hexo でも上記のような感じで再現できます。

## プラグインについて

このセクションでは、プラグインの開発に至るまでの経緯と、参考にしたプラグインとの差異について、説明します。

### 開発に至った経緯

#### (1) Hexo.js でブログ作成

元々は、書いた{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}に、Fanza Games や Steam へのビジュアルリッチなリンクを欲したことが発端です。
レビューを投稿するにあたり、作中のスクショを張りたかったことと、ゲームそのものが R18 指定だったこともあり、Ameba や FC2 等のブログサービスを使用せず、ホスティングしようと考えました。結果、GitHub Pages + Hexo.js + Icarus の組み合わせで、ブログの作成と相成りました。

#### (2) 既存のリンクプレビュープラグイン導入

Hexo と Icarus には、リンクプレビュー機能がバンドルされていません。そのため、まずは実現方法についてググりました。すると、「[Hexo+Icarus リンクカードを設定する](https://circleken.net/2020/10/post32/)」という、まさに正鵠を射る記事を発見。そこに書かれていた hexo-tag-link-preview を `npm install` して使うことにしました。
しかし、レビュー記事をプレビュー表示してみると、生成したページに問題が発生しています。なんと、Fanza Games 版のリンクが、「undefined」ではありませんか。

#### (3) 長期間メンテナンスされていない

該当のプラグインは OSS なので、Bug issue を立てて修正していただく考えに至りました。とはいえ、プラグインの最終更新日は、今から2年以上前で止まっています。加えて、作者のブログ記事の「hexo-tag-link-previewをnpmで公開しました。」で、現在は Hexo を使用していない、との記述を発見。
ゆえに、このプラグインがメンテナンスされることは今後ないだろうと判断し、参考にしてゼロから作り直すことを決意しました。

{% message color:info title:2025年01月16日追記 %}
長期間メンテナンスされていなかった hexo-tag-link-preview ですが、2024年7月についにアーカイブされました。また、作者のブログ記事が削除されているため、リンクを解除しました。
{% endmessage %}

#### (4) 自作プラグイン開発＆公開へ

それから、数日で自作プラグインが完成し、無事にレビュー記事にも反映。作り始めた頃は公開しようとは思っていなかったのですが、もしかして同じ問題にぶち当たってリンクプレビューを諦めた人がいるのではないかと思いました。なので、しっかりとコードリファクタしたうえで、テストも整備して、プラグインを公開させていただきました。皆様に使っていただければ幸いです。

### 参考プラグインとの違い

#### (1) 命名規則が異なる

Hexo.js は、snake_case がデファクトスタンダードのようです。そのため、hexo-tag-link-preview が lowerCamelCase だったところを、hexo-tag-ogp-link-preview では snake_case に変えています。これは、タグ名と設定項目の両方に適用されます（例えば、タグ名は `linkPreview` から `link_preview` に、設定項目は、`className` が `class_name` に変わっています）。
この違いさえ忘れずに、正しく修正すれば、プラグインそのものを差し替えても、そのまま動作する仕様となっています。

#### (2) パラメータの順番を問わない

hexo-tag-ogp-link-preview は、hexo-tag-link-preview と異なり、タグのパラメータの記載順を入れ替えても正しく認識します。

{% message color:info title:2025年01月16日追記 %}
hexo-tag-ogp-link-preview は、バージョン 1.1.0 から、名前付きパラメータがサポートされ、必要なパラメータだけを任意に設定できるように機能強化されました。
{% endmessage %}

## デザイン設定例

### Icarusテーマ利用者向け

このセクションは、Icarus テーマ利用者向けに{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}で表示している FaceBook 風リンクプレビューデザインを設定するための解説をします。

#### (1) デザイン設定

記事のスタイル定義ファイルに、リンクプレビューで使用する変数定義と各種クラスを追加します。

```stylus themes/icarus/include/style/article.styl
$link-preview-card-border ?= 1px solid #cbd0d3
$link-preview-card-radius ?= 8px
$link-preview-card-margin ?= 1rem 0
$link-preview-card-bg-color ?= #f2f3f5
$link-preview-card-og-description-color ?= #525252

article
    /* ... 省略 ... */
    &.article
        /* ... 省略 ... */
        .content
            /* ... 省略 ... */
            .link-preview
                display: block
                overflow: hidden
                border: $link-preview-card-border
                border-radius: $link-preview-card-radius
                margin: $link-preview-card-margin
                font-size: 1rem
                background-color: $link-preview-card-bg-color

                .og-image
                    img
                        display: block
                        object-fit: cover
                        object-position: center
                        aspect-ratio: 40 / 21
                        width: 100%
                        height: auto

                .descriptions
                    padding: 0.5rem 1rem

                    .og-title
                        font-size: 1.25rem
                        font-weight: 600
                        margin-bottom: 0.25rem

                    .og-description
                        color: $link-preview-card-og-description-color
```
以上で、デザインの設定は完了です。

#### (2) Hexo設定

続いて、Hexo 設定ファイルで、hexo-tag-ogp-link-preview の設定調整を行います。
ただし、デフォルト設定のままでは、FaceBook 風デザインの再現を阻む不都合が二つ起こります。一つはリンクの文字色が目立つということ、もう一つは画像がギャラリーにアイテムとして追加されてしまうということです。
これらの不都合に対しては、`class_name.anchor_link` に `link-muted link-preview` を設定することでリンクの文字色が目立たないようにでき、`class_name.image` に `not-gallery-item` を設定することでギャラリーへのアイテム追加を阻止できます。
設定ファイルは、以下のように記載してください。

```yaml _config.yml
# ... ファイルの上の部分は、省略 ...
link_preview:
  class_name:
    anchor_link: link-muted link-preview
    image: not-gallery-item
```

他の設定値はデザインに影響しませんので、皆様のご自由にしていただいて大丈夫です。

## おわりに

今後は、`v1.1.0` のマイナーアップデートリリースを予定しており、ソースコードのメンテナビリティ強化のためのリファクタがメインとなります。
機能の強化としては、プラグインが生成する HTML タグの固定クラス（`og-image` や `descriptions` など）に対して、リンクプレビューごとに同一の接尾辞をつけられるようにして、シーンに応じてデザインを調整できるようにする予定です。このサイトでは、レビュー記事にラージサイズ画像のリンクプレビュー、それ以外の記事に細長なリンクプレビューといった使い分けをする想定です。
それでは、ここまでご覧いただきありがとうございました。次回のマイナーアップデート後も、今回のような閑話記事を投稿予定なので、その時は良しなに。

### 関連記事

- {% post_link update-hexo-link-preview-plugin-v1-1-0 '「hexo-tag-ogp-link-preview v1.1」のリリース解説' %}

### 参考文献

- [hexo-tag-ogp-link-preview - npm](https://www.npmjs.com/package/hexo-tag-ogp-link-preview)
- [Hexo + Icarus リンクカードを設定する](https://circleken.net/2020/10/post32/)

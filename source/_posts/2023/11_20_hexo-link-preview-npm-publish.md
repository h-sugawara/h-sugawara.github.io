---
title: hexo-tag-ogp-link-previewの公開に纏わる閑話
date: 2023-11-20 21:00:00
updated: 2024-01-20 13:30:00
tags:
  - Hexo
  - Icarus
  - JavaScript
  - npm
  - Link Preview
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

2023年11月19日（日）、自作したHexo用タグプラグイン hexo-tag-ogp-link-preview v1.0.0 を、npmに公開しました。
本記事では、プラグインの開発に至った経緯やIcarusテーマでの設定例等、プラグインのREADMEに書いていないような他愛もない話題を中心に書き綴ります。

<!-- more -->

## 何のためのプラグインか

`hexo-tag-ogp-link-preview`は、OpenGraph プロトコル対応のページから取得したデータを用いてリンクプレビューを生成し、Hexo のブログ記事に埋め込むためのプラグインです。

{% link_preview https://www.npmjs.com/package/hexo-tag-ogp-link-preview %}
hexo-tag-ogp-link-preview@npm
{% endlink_preview %}

FaceBook を始め X(Twitter) 等の SNS でリンク共有時に表示されるようなカードを、Hexo でも上記のような感じで再現できます。

## 開発に至った経緯

元々は、書いた{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}に、Fanza Games や Steam へのビジュアルリッチなリンクを欲したことが発端です。

レビューを投稿するにあたり、作中のスクショを張りたかったことと、ゲームそのものが R18 指定だったこともあり、Ameba や FC2 等のブログサービスを使用せず、ホスティングしようと考えました。
結果、GitHub Pages + Hexo.js + Icarus の組み合わせで、ブログの作成と相成りました。

ですが、Hexo 並びに Icarus にはデフォルトでリンクプレビュー機能が存在しません。
まずは、どうすれば実現できるのかをググりました。
すると、[「Hexo+Icarus リンクカードを設定する](https://circleken.net/2020/10/post32/)という、まさに正鵠を射る記事を発見。
そこに書かれていた`hexo-tag-link-preview`を`npm install`して使うことにしました。

しかし、レビュー記事をプレビュー表示してみると、生成したページに問題が発生しています。
なんと、Fanza Games 版のリンクが、"undefined"ではありませんか。

そこで、該当のプラグインは OSS なので、Bug issue を立てて修正していただく考えに至りました。
とはいえ、プラグインの最終更新日は、今から2年以上前で止まっています。
加えて、作者のブログ記事の[「hexo-tag-link-previewをnpmで公開しました。」](https://minamo173.com/blog/publish-hexo-tag-link-preview/)で、現在は Hexo を使用していない、との記述を発見。 
ゆえに、このプラグインがメンテナンスされることは今後ないだろうと判断し、参考にしてゼロから作り直すことを決意しました。

それから、数日で自作プラグインが完成し、無事にレビュー記事にも反映。
作り始めた頃は公開しようとは思っていなかったのですが、もしかして同じ問題にぶち当たってリンクプレビューを諦めた人がいるのではないかと思いました。
なので、しっかりとコードリファクタしたうえで、テストも整備して、プラグインを公開させていただきました。
皆様に使っていただければ幸いです。

## 参考プラグインとの違い

`Hexo`は、`snake_case`で記載するのが一般的であるようです。
そのため、`hexo-tag-link-preview`が`lowerCamelCase`表記であったところを、`hexo-tag-ogp-link-preview`では`snake_case`に変えています。
これは、タグ名と設定項目の両方に適用されます（タグ名は"linkPreview"から"link_preview"に、設定項目は例えば、"className"が"class_name"へ変更）。
この違いさえ忘れずに、正しく修正すれば、プラグインそのものを差し替えても、そのまま動作する仕様となっています。

また、`hexo-tag-link-preview`と異なり、`hexo-tag-ogp-link-preview`では、タグのパラメータの記載順を入れ替えても正しく認識します。
とはいえ、現バージョンで出来るようにしているだけ（※注：動作未保証です）で、将来的には変更する可能性があるので、この仕様については参考程度にして頂ければと思います。

## Icarusテーマ利用者向け

このセクションは、Icarus テーマ利用者向けに{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}で表示している FaceBook 風なリンクプレビューデザインを設定するための解説をします。

### デザイン設定

記事のスタイル定義ファイルに、リンクプレビューで使用する変数定義と各種クラスを追加します。

{% message color:info title:2024年01月16日更新 %}
1. 変数の記載場所を一か所に集約
2. 1.91:1 のアスペクト比でリンクプレビュー画像を表示できるように修正
3. 角半径を親要素で調整するように修正
4. 画像の下部に余白ができないように修正
5. descriptions クラスの padding 設定を修正
6. link-preview クラスの一部の設定値を変数宣言に変更
{% endmessage %}

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

### Hexo設定

続いて、Hexo 設定ファイルで、`hexo-tag-ogp-link-preview`の設定調整を行います。
デフォルト設定状態では、FaceBook 風なデザインの再現を阻む不都合が二つ発生します。
それは、リンクの文字色が目立つということと、画像がギャラリーにアイテムとして追加されてしまうということです。
一つ目は、`class_name.anchor_link`に`link-muted link-preview`を設定することで防ぎます。
二つ目は、`class_name.image`に`not-gallery-item`を設定することで対策できます。
設定ファイルは、以下のように記載してください。

```yaml _config.yml
# ... ファイルの上の部分は、省略 ...
link_preview:
  class_name:
    anchor_link: link-muted link-preview
    image: not-gallery-item
```

他の設定値はデザインに影響しませんので、皆様のご自由にしていただいて大丈夫です。

## 今後のアップデート予定

今後は、`v1.1.0`のマイナーアップデートリリースを予定しており、ソースコードのメンテナビリティ強化のためのリファクタがメインとなります。

機能の強化としては、プラグインが生成する HTML タグの固定クラス（"og-image"や"descriptions"など）に対して、リンクプレビューごとに同一の接尾辞をつけられるようにして、シーンに応じてデザインを調整できるようにする予定です。
このサイトでは、レビュー記事にラージサイズ画像のリンクプレビュー、それ以外の記事に細長なリンクプレビューといった使い分けをする想定です。

ここまでご覧いただきありがとうございました。
次回のマイナーアップデート後も、今回のような閑話記事を投稿予定なので、その時は良しなに。

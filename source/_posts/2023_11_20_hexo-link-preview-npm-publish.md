---
title: hexo-tag-ogp-link-previewの公開に纏わる閑話
date: 2023-11-20 21:00:00
updated: 2023-11-20 21:00:00
tags:
  - フロントエンド
  - Hexo
  - Icarus
  - JavaScript
  - npm
category: Technology
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology_programming_title.webp
thumbnail: /images/npm_thumbnail.webp
cover: /images/technology_programming_cover.webp
---

2023年11月19日（日）、自作したHexo用タグプラグイン`hexo-tag-ogp-link-preview v1.0.0`を、npmに公開しました。
本記事では、プラグインの開発に至った経緯やIcarusテーマでの設定例等、プラグインのREADMEに書いていないような他愛もない話題を中心に書き綴ります。

<!-- more -->

## 何のためのプラグインか

`hexo-tag-ogp-link-preview`は、OpenGraphプロトコル対応のページから取得したデータを用いてリンクプレビューを生成し、Hexoのブログ記事に埋め込むためのプラグインです。

{% link_preview https://www.npmjs.com/package/hexo-tag-ogp-link-preview %}
hexo-tag-ogp-link-preview@npm
{% endlink_preview %}

FaceBookを始めX(Twitter)等のSNSで、リンク共有時に表示されるようなカードを、Hexoでも上記のような感じで再現することができます。

## 開発に至った経緯

元々は、書いた[「RIDDLE JOKER」のレビュー](https://blog.chaotic-notes.com/2023/11/08/riddle-joker-review/)に、`Fanza Games`や`Steam`へのビジュアルリッチなリンクを欲したことが発端です。

レビューを投稿するにあたり、作中のスクショを張りたかったことと、ゲームそのものがR18指定だったこともあり、AmebaやFC2等のブログサービスを使用せず、ホスティングしようと考えました。
結果、`GitHub Pages`+`Hexo.js`+`Icarus`の組み合わせで、ブログの作成と相成りました。

ですが、Hexo並びにIcarusにはデフォルトでリンクプレビュー機能が存在しません。
まずは、どうすれば実現できるのかをググりました。
すると、「[Hexo + Icarus リンクカードを設定する](https://circleken.net/2020/10/post32/)」という、まさに正鵠を射る記事を発見。
そこに書かれていた`hexo-tag-link-preview`を`npm install`して使うことにしました。

しかし、レビュー記事をプレビュー表示してみると、生成したページに問題が発生しています。
なんと、`Fanza Games`版のリンクが、`undefined`になっているではありませんか。

そこで、該当のプラグインはOSSなので、Bug issueを立てて修正していただく考えに至りました。
とはいえ、プラグインの最終更新日は、今から2年以上前で止まっています。
加えて、作者のブログの[「hexo-tag-link-previewをnpmで公開しました。」](https://minamo173.com/blog/publish-hexo-tag-link-preview/)記事で、現在はHexoを使用していない、との記述を発見。 
ゆえに、このプラグインがメンテナンスされることは今後ないだろうと判断し、参考にしてゼロから作り直すことを決意しました。

それから、数日で自作プラグインが完成し、無事にレビュー記事にも反映。
作り始めた頃は公開しようとは思っていなかったのですが、もしかして同じ問題にぶち当たってリンクプレビューを諦めた人がいるのではないかと思いました。
なので、しっかりとコードリファクタしたうえで、テストも整備して、プラグインを公開させていただきました。
皆様に使っていただければ幸いです。

## 参考プラグインとの違い

Hexoは、`snake_case`で記載するのが一般的であるようです。
そのため、`hexo-tag-link-preview`が`lowerCamelCase`表記であったところを、`hexo-tag-ogp-link-preview`では`snake_case`に変えています。
これは、タグ名と設定項目の両方に適用されます（タグ名は`linkPreview`から`link_preview`に、設定項目は例えば、`className`が`class_name`へ変更）。
この違いさえ忘れずに、正しく修正すれば、プラグインそのものを差し替えても、そのまま動作する仕様となっています。

また、`hexo-tag-link-preview`と異なり、`hexo-tag-ogp-link-preview`では、タグのパラメータの記載順を入れ替えても正しく認識します。
とはいえ、現バージョンで出来るようにしているだけ（※注：動作未保証です）で、将来的には変更する可能性があるので、この仕様については参考程度にして頂ければと思います。

## Icarusテーマ利用者向け

このセクションは、Icarusテーマ利用者向けに、[「RIDDLE JOKER」のレビュー](https://blog.chaotic-notes.com/2023/11/08/riddle-joker-review/)で表示しているFaceBook風なリンクプレビューデザインを設定するための解説をします。

### デザイン設定

まずは、ベース設定ファイルに、リンクプレビューのレイアウトで共通使用する変数を定義します。

```stylus themes/icarus/include/style/base.styl
// 上から50行目あたりまでの間の変数がずらっと並んでいるところのどこかに足す
$link-card-radius ?= 8px
```

次に、記事のスタイル定義があるファイルに、リンクプレビューで使用する各種classを追加します。

```stylus themes/icarus/include/style/article.styl
// 省略
article
    // ...
    // 省略
    // ...
    &.article
        // ...
        // 省略
        // ...
        .content
            // ...
            // 省略
            // ...
            // ------ ここからコピペ ------
            .link-preview
                display: block
                border: 1px solid #cbd0d3
                border-radius: $link-card-radius
                margin: 1rem 0 1rem 0
                font-size: 1rem
                background-color: #f2f3f5

                .og-image
                    img
                        overflow: hidden
                        border-top-left-radius: $link-card-radius
                        border-top-right-radius: $link-card-radius
                        max-height: 270px
                        object-fit: cover
                        object-position: center;
                        width: 100% !important
                        height: 100% !important

                .descriptions
                    padding: 0 1rem 0.5rem 1rem
                    border-bottom-left-radius: $link-card-radius
                    border-bottom-right-radius: $link-card-radius

                    .og-title
                        font-size: 1.25rem
                        font-weight: 600
                        margin-bottom: 0.25rem

                    .og-description
                        color: #757c83
                // ------ ここまでコピペ ------
```
以上で、デザインの設定は完了です。

### Hexo設定

続いて、Hexo設定ファイルで、`hexo-tag-ogp-link-preview`の設定調整を行います。
デフォルト設定状態では、FaceBook風なデザインの再現を阻む不都合が二つ発生します。
それは、リンクの文字色が目立つということと、画像がギャラリーにアイテムとして追加されてしまうということです。
一つ目は、`class_name.anchor_link`に`link-muted link-preview`を設定することで防ぎます。
二つ目は、`class_name.image`に`not-gallery-item`を設定することで対策できます。
設定ファイルは、以下のように記載してください。

```yaml _config.yml
# ...
# ファイルの上の部分は、省略
# ...
link_preview:
  class_name:
    anchor_link: link-muted link-preview
    image: not-gallery-item
```

他の設定値はデザインに影響しませんので、皆様のご自由にしていただいて大丈夫です。

## 今後のアップデート予定

今後は、`v1.1.0`のマイナーアップデートリリースを予定しており、ソースコードのメンテナビリティ強化のためのリファクタがメインとなります。

機能の強化としては、プラグインが生成するHTMLタグの固定class（`og-image`や`descriptions`など）に対して、リンクプレビューごとに同一の接尾辞をつけられるようにして、シーンに応じてデザインを調整できるようにする予定です。
このサイトでは、レビュー記事にラージサイズ画像のリンクプレビュー、それ以外の記事に細長なリンクプレビューといった使い分けをする想定です。

ここまでご覧いただきありがとうございました。
次回のマイナーアップデート後も、今回のような閑話記事を投稿予定なので、その時は良しなに。

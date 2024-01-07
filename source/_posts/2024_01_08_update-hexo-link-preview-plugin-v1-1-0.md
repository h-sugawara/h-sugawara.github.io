---
title: hexo-tag-ogp-link-preview v1.1.0 更新内容の解説
date: 2024-01-08 08:30:00
updated: 2024-01-08 08:30:00
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
thumbnail: /images/thumbnails/npm_thumbnail.webp
cover:
  image: /images/technology/programming_cover.webp
  sources:
    small: /images/technology/programming_cover_small.webp
    medium: /images/technology/programming_cover_medium.webp
    large: /images/technology/programming_cover_large.webp
---

2023年12月26日（火）、Hexo 用タグプラグイン hexo-tag-ogp-link-preview v1.1.0 のアップデートを公開しました。
今回は、README.md に書いていないアップデート内容の解説とリリースの小噺を書き綴ります。

<!-- more -->

## プラグインの紹介

`hexo-tag-ogp-link-preview`については、{% post_link hexo-link-preview-npm-publish '前回の初回リリース記事' %}にまとめています。
どんなプラグインか、どうして開発に至ったかを説明していますので、気になった方は是非ご拝読ください。

## アップデート内容の解説

今回のアップデートで、以下の3つの新機能を追加しています。

1. 名前付きパラメータ
2. 画像に代替テキスト追加
3. ネイティブ遅延読み込み

名前付きパラメータを除いて、PageSpeed Insights にてパフォーマンス・アクセサビリティ・SEO の各監査項目に合格するための改良が主体です。

### 名前付きパラメータ

アップデートを今後も重ねていく上で、名前付きパラメータのサポートは必須でした。
なぜなら、この改修が含まれずに現状のままの場合、指定したいパラメータのために他の全てのパラメータもセットで指定するという現象を、将来的に引き起こす可能性があるからです。
これは、プラグインを利用するユーザーにとって大きなストレスとなります。
ゆえに、記事を書く人のためのユーザビリティと、記事のメンテナビリティを高く保つことを目的として導入したのです。

この機能は、プログラミングに慣れ親しんでいる方であればご存じかと思いますが、それ以外の方のためにも簡単に使い方をご紹介します。
できることをとても大雑把に表現すると、**「必須ではないパラメータを、名前と値をセットで指定すると、任意の順番で配置できる」**という機能です。

より分かりやすいように実例を示します。
あなたは、自分が設定したリンクプレビューに対して、`rel`に`noreferrer`を、`loading`に`eager`を指定したいと考えた、としましょう。
その時、この機能があることで、次のような書き方ができるのです。

```markdown rel:noreferrer, eager:loading の書き方
{% link_preview https://blog.chaotic-notes.com/articles/hexo-link-preview-npm-publish/ loading:eager rel:noreferrer %}
hexo-link-preview-npm-publish の記事
{% endlink_preview %}
```

プラグインのパラメータは、`url`、`target`、`rel`、`loading`の順で書くのが通常です。
なんと、この機能によって、`target`を省略して、`rel`や`loading`の値を指定できるのです（※上記例の場合、`target`はデフォルト値の`_blank`になります）。
そして、実際の記事では、以下のようなHTMLが生成されます。

```html 生成されるHTMLのイメージ
<a href="https://blog.chaotic-notes.com/articles/hexo-link-preview-npm-publish/" target="_blank" rel="noreferrer" class="link-preview">
    <div class="og-image">
        <img src="https://blog.chaotic-notes.com/images/technology_programming_title.webp" alt="hexo-tag-ogp-link-previewの公開に纏わる閑話" loading="eager">
    </div>
    <div class="descriptions">
        <div class="og-title">hexo-tag-ogp-link-previewの公開に纏わる閑話</div>
        <div class="og-description">2023年11月19日（日）、自作したHexo用タグプラグイン hexo-tag-ogp-link-preview v1.0.0 を、npmに公開しました。本記事では、プラグインの開発に至った経緯やIcarusテーマでの設定例等、プラグインのREADMEに書いていないような他愛も...</div>
    </div>
</a>
```

便利な機能ですので、是非ご活用ください。

### 画像に代替テキスト追加

これを新機能として取り扱っていますが、実質的には不具合修正となります。
プラグイン作成の参考とした`hexo-tag-link-preview`で、イメージエレメントに対して`alt`属性が無かったため、そのまま見落としていました。
このブログを PageSpeed Insights で監査し、アクセサビリティ・SEO の項目で検知されたことで、ようやく気が付いたのです。
修正自体はすぐでしたので、今回のバージョンに取り込ませて頂きました。

この改修により、プラグインを利用している方が、特別な対応をする必要はありません。
プラグインをアップデートしてから記事を再生成すれば、リンクプレビュー画像に代替テキストが付与されるようになります。
PageSpeed Insights のアクセサビリティ・SEO の改善にご利用ください。

### ネイティブ遅延読み込み

ネイティブ遅延読み込みは、今回のアップデートの目玉機能として位置付けています。

プラグインは、OpenGraph プロトコルの`og:image`の値から画像の URL を取得します。
取得した URL 先の画像は、圧縮率の悪いフォーマットであったり、横 1200 ピクセルに縦 630 ピクセルの巨大なサイズであったりすることもあります。
その一方で、リンクプレビューは、重要度の高いコンテンツとして取り扱うことは多くありません。
なぜなら、ブログのドキュメント内でビジュアルリッチな引用の用途であることがほとんどだからです。

初期バージョンで生成したリンクプレビューは、上述のようにページに対して、低い重要度にも関わらず、高い影響度を持つという、ギャップを抱えていました。
この状態だと、ページ読み込み時、ブラウザにリンクプレビュー画像のダウンロードとレンダリングを優先させます。そう、すぐに必要でないにも関わらず、です。
これは、リンクプレビューを使用したページの First Contentful Paint や Largest Contentful Paint の速度に悪い影響を齎します。
実際にこのブログでは、{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}や{% post_link sabbat-of-the-witch-review '「サノバウィッチ」のレビュー' %}が、その影響を多大に受けました。
これらのページに様々なチューニングを施しても、ついにパフォーマンススコアが90点を超える機会を得ることはできなかったのです。
以上より、優先的に解決するべき課題だと認識したため、今回のアップデートに組み込みました。

この機能も、プラグインアップデート後に特別何かする必要はありません。
記事を再生成すれば、`lazy`の値を持つ`loading`属性が、リンクプレビュー画像に自動で付与されます。
もちろん、遅延読み込みをしたくない方もいらっしゃるでしょうから、ブラウザの規定動作となる`eagar`も用意してあります。
加えて、初期バージョンとの後方互換性を維持する目的で、`loading`属性を消す`none`も利用できます。
ご自身のシーンや状況にあわせて、ご使用いただければ幸いです。

## リリース小噺

### リリースに四回失敗した

プラグインのプロジェクトでは、Markdown 形式でマイルストーンの説明文を記載していて、リリースパブリッシュ時に使用しています。
この時の GitHub Actions ワークフローで、`toJSON`関数によりマイルストーンの説明文を取得します。
しかし、この関数は、特殊文字をエスケープ処理しない仕様です（数年間使用していたけど、このパターンに遭遇したことがなかったため、今まで知らなかった）。
そのため、そのトラップに上手く嵌り、リリースできない事件が発生。
とはいえ、ワークフローはアプリケーションのリリースに影響を及ぼすものではないため、今回は手動でリリース発行しました。
GitHub Actions 等の CI/CD ツールってこういうの良くあるんですよねぇ、っていう愚痴でした。

## 今後のアップデート予定

次のマイナーバージョンである`v1.2.0`では、エラーハンドリングとリトライ処理を中心としたアップデートを行う予定です。

また、{% post_link hexo-link-preview-npm-publish '初回リリース記事' %}でアップデート予定に記載した「固定class名に接頭語を付与」する機能も、新機能として追加します。
これにより、リンクプレビューごとにデザイン調整を行えるようになりますので、次のバージョンまで気長にお待ちいただければと思います。

ここまでご覧いただきありがとうございました。
次回のマイナーアップデート後も今回と同様の解説記事を投稿予定なので、その時はどうぞよろしく。

---
title: Hexo製ブログ用リンクプレビュープラグインv1.1 解説
date: 2024-01-08 08:30:00
updated: 2025-01-25 14:00:00
tags:
  - 自作プラグイン
  - 解説
  - npm
  - Hexo
  - PageSpeed Insights
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

2023年12月26日（火）に公開した hexo-tag-ogp-link-preview v1.1 について解説やリリース小噺を書き綴ります。

<!-- more -->

## プラグイン紹介

`hexo-tag-ogp-link-preview` の詳細については、{% post_link hexo-link-preview-npm-publish 'v1.0 リリース解説の記事' %}でまとめています。どんなプラグインか、どうして開発に至ったかを説明していますので、そちらも是非ご拝読ください。

## アップデート解説

今回のアップデートにて、次の三つの新機能を追加しました。

1. 名前付きパラメータ
2. 画像の代替テキスト追加
3. ネイティブ遅延読み込み

名前付きパラメータを除いて、PageSpeed Insights の各監査項目「パフォーマンス」「アクセシビリティ」「SEO」に合格するための改良が主体となります。

### 名前付きパラメータ

#### 導入の経緯

アップデートを今後も重ねていく上で、名前付きパラメータのサポートは必須でした。なぜなら、この改修が含まれずに現状のままの場合、指定したいパラメータのために他の全てのパラメータもセットで指定するという現象を、将来的に引き起こす可能性があるからです。これは、プラグインを利用するユーザーにとって大きなストレスとなります。ゆえに、記事を書く人のためのユーザビリティと、記事のメンテナビリティを高く保つことを目的として導入したのです。

#### 使い方の説明

プログラミングに慣れ親しんでいる方であればご存じかと思いますが、それ以外の方のためにも簡単に使い方をご紹介します。この機能でできることをとても大雑把に表現すると、**必須ではないパラメータを、名前と値をセットで指定すると、任意の順番で配置できる**という機能です。
より分かりやすいように実例を示します。設定したリンクプレビューに対して、`rel="noreferrer"` と `loading="eager"` を指定するとしましょう。それは、この機能によって、次のように書けます。

```markdown
{% link_preview https://blog.chaotic-notes.com/articles/hexo-link-preview-npm-publish/ loading:eager rel:noreferrer %}
hexo-link-preview-npm-publish の記事
{% endlink_preview %}
```

パラメータは、`url`、`target`、`rel`、`loading` の順であることを、今までは求められていました。これからは、この機能によって、`target` を省略して、`rel` や `loading` の値を指定できるようになりました。

{% message color:warning %}
パラメータ指定を省略した場合は、初期値を指定している状態と等しく扱います。上記例の場合であれば、`target` はデフォルト値の `_blank` になります。
{% endmessage %}

実際の記事では、以下のようなHTMLが生成されます。

```html
<a href="https://blog.chaotic-notes.com/articles/hexo-link-preview-npm-publish/" target="_blank" rel="noreferrer" class="link-preview">
    <div class="og-image">
        <img src="https://blog.chaotic-notes.com/images/technology/programming/title.webp" alt="hexo-tag-ogp-link-previewの公開に纏わる閑話" loading="eager">
    </div>
    <div class="descriptions">
        <div class="og-title">hexo-tag-ogp-link-previewの公開に纏わる閑話</div>
        <div class="og-description">2023年11月19日（日）、自作したHexo用タグプラグイン hexo-tag-ogp-link-preview v1.0.0 を、npmに公開しました。本記事では、プラグインの開発に至った経緯やIcarusテーマでの設定例等、プラグインのREADMEに書いていないような他愛も...</div>
    </div>
</a>
```

便利な機能ですので、是非ご活用ください。

### 画像の代替テキスト追加

これを新機能として取り扱っていますが、実質的には不具合修正となります。

#### 導入の経緯

プラグイン作成の参考とした `hexo-tag-link-preview` で、`image` エレメントに対して `alt` 属性が無かったため、そのまま見落としていました。このブログを PageSpeed Insights で監査して、「アクセシビリティ」及び「SEO」の項目で検知されたことで、ようやく気が付きました。修正自体はすぐでしたので、今回のバージョンに取り込ませて頂きました。

#### 使い方の説明

この改修により、プラグインを利用している方が、特別な対応をする必要はありません。プラグインをアップデートしてから記事を再生成すれば、リンクプレビュー画像に代替テキストが付与されるようになります。PageSpeed Insights の「アクセシビリティ」と「SEO」の改善にご利用ください。

### ネイティブ遅延読み込み

ネイティブ遅延読み込みは、今回のアップデートの目玉機能として位置付けています。

#### 導入の経緯

プラグインは、OpenGraph プロトコルの `og:image` の値から画像の URL を取得します。URL 先の画像は、低圧縮率のフォーマットであったり、巨大なサイズであったりすることもあります。その一方で、リンクプレビューそのものは、重要度の高いコンテンツとして取り扱うことは多くありません。なぜなら、ブログのドキュメント内でビジュアルリッチな引用の用途であることがほとんどだからです。
初期バージョン v1.0 で生成したリンクプレビューは、ページに対して低い重要度にも関わらず、レンダリングに対して高い影響度を持つ、悪いギャップを抱えていました。ブラウザがページを読み込んだ時に、すぐに必要ではないにも関わらず、リンクプレビュー画像のダウンロードとレンダリングを優先する状態でした。これは、リンクプレビューを使用したページの「First Contentful Paint」や「Largest Contentful Paint」に悪い影響を与えます。実際に、当ブログでは、{% post_link riddle-joker-review '「RIDDLE JOKER」のレビュー' %}や{% post_link sabbat-of-the-witch-review '「サノバウィッチ」のレビュー' %}が、その影響を多大に受けました。これらのページに様々なチューニングを施しても、ついにパフォーマンススコアが90点を超える機会を得ることはできなかったのです。
ゆえに、優先的に解決するべき課題だと認識したため、今回のアップデートに組み込みました。

#### 使い方の説明

この機能も、プラグインアップデート後に特別何かする必要はありません。記事を再生成すれば、`lazy` の値を持つ `loading` 属性が、リンクプレビュー画像に自動で付与されます。もちろん、遅延読み込みをしたくない方もいらっしゃるでしょうから、ブラウザの規定動作となる `eager` も用意してあります。加えて、初期バージョンとの後方互換性を維持する目的で、`loading` 属性を消すための `none` も利用できます。ご自身のシーンや状況にあわせて、ご使用いただければ幸いです。

## リリース小噺

### リリースに四回失敗した

プラグインのプロジェクトでは、Markdown 形式でマイルストーンの説明文を記載していて、リリースパブリッシュ時に使用しています。この時の GitHub Actions ワークフローで、`toJSON` 関数によりマイルストーンの説明文を取得します。しかし、この関数は、特殊文字をエスケープ処理しない仕様です（数年間使用していたけど、このパターンに遭遇したことがなかったため、今まで知らなかった）。そのため、そのトラップに上手く嵌り、リリースできない事件が発生。とはいえ、ワークフローはアプリケーションのリリースに影響を及ぼすものではないため、今回は手動でリリース発行しました。GitHub Actions 等の CI/CD ツールってこういうの良くあるんですよねぇ、っていう愚痴でした。

## 今後のアップデート予定

次回のマイナーアップデート `v1.2.0` では、エラーハンドリングとリトライ処理を中心としたアップデートを行う予定です。また、v1.0 リリース解説記事で、アップデート予定に記載した「固定 class 名に接頭語を付与」する機能も、新機能として追加します。これにより、リンクプレビューごとにデザイン調整を行えるようになりますので、次のバージョンまで気長にお待ちいただければと思います。
ここまでご覧いただきありがとうございました。次回のマイナーアップデート後も今回と同様の解説記事を投稿予定なので、その時はどうぞよろしく。

{% message color:info title:2025年01月25日追記 %}
` v1.2.0` のリリースは、2025年から2026年前半までの間で行う予定です。私事ですが、仕事を始め、当ブログの執筆・改稿等で多忙になっており、開発に割り当てられるほどの時間がありません。アップデートをお待ちの方は、期待せずにもうしばらくお待ちいただければ幸いです。
{% endmessage %}

### 関連記事

- {% post_link hexo-link-preview-npm-publish '「hexo-tag-ogp-link-preview v1.0」のリリース解説' %}

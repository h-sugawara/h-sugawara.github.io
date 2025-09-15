---
title: 癖が強すぎるGitHub Actionsのon.pushの解説
date: 2024-04-22 08:30:00
updated: 2025-01-18 14:00:00
tags:
  - 解説
  - 技術解説
  - CI/CD
  - GitHub
  - GitHub Actions
categories:
  - Technology
  - DevOps
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology/devops/title.webp
thumbnail: /images/thumbnails/technology/github_thumbnail.webp
cover:
  image: /images/technology/devops/cover.webp
  sources:
    small: /images/technology/devops/cover_small.webp
    medium: /images/technology/devops/cover_medium.webp
    large: /images/technology/devops/cover_large.webp
---

GitHub Actions で多用するイベントトリガーとして on.push がありますが、癖があって使いにくいため、分かりやすく解説します。

<!-- more -->

## はじめに

### on.push の理解度確認テスト

まずは、この記事を画面の前で読んでいるみなさんに質問です。ワークフローのイベントトリガーが下記の場合、GitHub Actions が処理を行うタイミングは、次の選択肢のうちどれでしょうか？（複数回答可）

```yaml
on:
  push:
    branches:
      - 'feature/**'
    tags:
      - 'api-**'
    paths:
      - 'src/**'
```

1. `feature/foobar` ブランチで、`dst/foobar.txt` のみのコミットをプッシュした時。
2. `feature/foobar` ブランチで、`src/foobar.txt` のみのコミットをプッシュした時。
3. `hot-fix/bug-foobar` ブランチで、`src/foobar.txt` のみのコミットをプッシュした時。
4. `dst/foobar.txt` のみのコミットに、`api-foobar` タグを付けてプッシュした時。
5. `src/foobar.txt` のみのコミットに、`api-foobar` タグを付けてプッシュした時。

#### 答え

正解は、「2」と「4」と「5」になります。みなさんは正解できましたか？

## on.push の仕様をおさらい

次に、GitHub 公式ドキュメントの「Workflow syntax for GitHub Actions」を使って、仕様をおさらいします。このページは、日本語翻訳されていた記憶がありますが、2024年04月22日時点では原文に戻っていて、Actions に不慣れな人にとっては苦行ですね。閑話休題。

{% message color:info %}
2025年01月18日時点では、GitHub 公式ドキュメントの対象ページの日本語翻訳が復活していることを確認済みです。
{% endmessage %}

### イベントフィルタ

on.push イベントのフィルタは次の３種類で、計６つあります。

1. ブランチフィルタ
    - `branches`
    - `branches-ignore`
2. タグフィルタ
    - `tags`
    - `tags-ignore`
3. パスフィルタ
    - `paths`
    - `paths-ignore`

以降のセクションでは、上記３種類のフィルタの解説を行います。

#### (1) ブランチフィルタ

ブランチフィルタは、特定のブランチのプッシュイベントに対して、ワークフローを実行したい時に設定します。対象とするブランチのホワイトリストとして `branches` フィルタを、対象としないブランチのブラックリストとして `branches-ignore` フィルタを使用します。これら二つのフィルタは、**同じイベントトリガー内で併用できません**。

##### 対象及び対象外のブランチを対象にしたい場合は？

ブランチフィルタは併用できない仕様ですが、対象と対象外にするブランチを両方を指定したい場合、どのように設定すればよいのでしょうか？
答えは、『**`branches` フィルタに、接頭辞として否定演算子 `!` を付けた対象外ブランチを記述する**』です。ホワイトリストから対象外ブランチを除外するアプローチになります。

```yaml 間違った書き方
# 「branches」フィルタと「branches-ignore」フィルタは併用できません
on:
  push:
    branches:
      - 'feature/**'
    branches-ignore:
      - 'release/**'
```

```yaml 正しい書き方
on:
  push:
    branches:
      - 'feature/**'
      - '!release/**'
```

ただし、次の制限事項があることを留意して使用しなければいけません。

1. 対象ブランチとなる定義も併せて必要です。すなわち、`branches` フィルタのリストの項目は、二つ以上定義されていることになります。
2. フィルタのリストは上から順番に全て評価します。よって、否定演算子付き定義でブランチを対象外にした後に、別定義でそのブランチが対象に含まれる可能性があります。

#### (2) タグフィルタ

タグフィルタは、特定のタグのプッシュイベントに対して、ワークフローを実行したい時に設定します。ブランチフィルタと同じ仕様であり、ホワイトリストとして `tags` フィルタを、ブラックリストとして `tags-ignore` フィルタを使用します。また、これらは同じイベントトリガー内で併用できません。

##### 対象及び対象外のタグを対象にしたい場合は？

対象と対象外にするタグの両方を指定したい場合は、前述の通りホワイトリストから対象外タグを除外するアプローチとなり、`tag` フィルタに対象外タグを追記し、接頭辞として否定演算子 `!` を付与します。また、ブランチフィルタと同じ制限事項があることを留意して使う必要があります。

```yaml 間違った書き方
# 「tags」フィルタと「tags-ignore」フィルタは併用できません
on:
  push:
    tags:
      - 'api-**'
    tags-ignore:
      - 'batch-**'
```

```yaml 正しい書き方
on:
  push:
    tags:
      - 'api-**'
      - '!batch-**'
```

#### (3) パスフィルタ

パスフィルタは、特定のパスを含む**コミットまたはタグ**のプッシュイベントに対して、ワークフローを実行したい時に設定します。ブランチフィルタやタグフィルタと同じ仕様であり、ホワイトリストとして `paths` フィルタを、ブラックリストとして `paths-ignore` フィルタを使用します。これらは、同じイベントトリガー内で併用できません。

##### 対象及び対象外のパスを対象にしたい場合は？

よって、対象及び対象外となるパスを同時に指定したい場合は、`paths` フィルタのリストに対象外パスを含め、接頭辞として否定演算子 `!` を付けます。こちらも、前述のブランチフィルタ及びタグフィルタと同じ制限事項があります。

```yaml 間違った書き方
on:
  push:
    paths:
      - 'src/**'
    paths-ignore:
      - 'dist/**'
```

```yaml 正しい書き方
on:
  push:
    paths:
      - 'src/**'
      - '!dist/**'
```

### フィルタ併用時の挙動

#### ブランチフィルタとパスフィルタの組み合わせ

ブランチフィルタとパスフィルタを併用した場合、イベントの発動条件が変わります。なぜなら、論理和条件（OR）ではなく、論理積条件（AND）として作用するからです。ゆえに、論理和条件で想定した安易なリファクタリングにより、ブランチフィルタのワークフローとパスフィルタのワークフローを一つに統合すると、想定外の動作で痛い目を見ることになるでしょう。では、どうしてこれらのフィルタを併用すると、論理積条件として作用するのでしょうか？
それは、どちらのフィルタも「コミットのプッシュイベントを対象とするから」だと考えています。

#### タグフィルタとパスフィルタの組み合わせ

一方で、タグフィルタとパスフィルタの併用は、無効な組み合わせになります。セットで書いたとしても、それぞれが別のフィルタとして独立する論理和条件（OR）となります。そのため、前述のルールが適用されると勘違いして、パスフィルタと併用すれば論理積条件（AND）になる、という安易な覚え方をしてしまうと、非常に危険です。しかし、タグフィルタは、単独だと両方のプッシュイベントを対象にするわけですから、パスフィルタとの組み合わせが論理積条件にならないことに大いに不満があります。

### 理解度確認テストの解説

さて、これまでの説明で、理解度テストの解答の理由は、お分かりいただけたでしょうか。ブランチとパスのフィルタは論理積条件で、タグのフィルタは論理和条件です。ゆえに、ブランチとパスの両方の条件を満たすのは「2」で、タグの条件を満たすのは「4」及び「5」になるということです。

## on.push を使いこなす

### 論理積フィルタを作る

#### タグとパスの論理積フィルタ

on.push では、タグフィルタとパスフィルタの組み合わせが論理積条件になりませんが、次のようにワークフローを作ると、タグとパスの組み合わせで論理積条件にできます。ただし、Billable Time（請求可能時間）が計上される機会が増えるため、かかるコストを意識して使わなければいけません。

```yaml
on:
  push:
    tags:
      - 'api-**'

jobs:
  branches_and_paths_or_tags_and_paths:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Check event trigger enabled
        id: event_trigger
        env:
          PATHS: 'src/'
        run: |
          git checkout HEAD^ --quiet
          files=$(jq -n '$ARGS.positional' --args -- $(git show --pretty='' --name-only "${{ github.sha }}"))
          if "$(jq -n -r --argjson files "${files}" --arg filter "${{ env.PATHS }}" 'isempty($files[]|select(startswith($filter)))')"; then
            echo "enabled=false" >> $GITHUB_OUTPUT
            exit 0
          fi
          echo "enabled=true" >> $GITHUB_OUTPUT

      - name: Tags and Paths event
        id: tags_and_paths
        if: steps.event_trigger.outputs.enabled == 'true'
        run: |
          echo "Tags and Paths event"
```

##### 解説

下記の順番で、イベントをフィルタリングしています。

1. HEAD コミットをチェックアウトし、コミットの含まれるファイルの一覧を取得します。
2. パスフィルタとなる環境変数 `PATHS` を用いて、処理 1 で取得したファイルの一覧に、対象とするパスの絞り込みをかけます。

#### ブランチとパス・タグとパスの論理和フィルタ

先ほどのサンプルコードにブランチフィルタを追加すると、下記のようにブランチとパスの論理積フィルタとタグとパスの論理積フィルタの二つを論理和にした条件にできます。これは、日本語だとわかりにくいので式にして書くと、「（ブランチ条件 AND パス条件）OR（タグ条件 AND パス条件）」という意味になります。また、こちらの方法でも同様に Billable Time（請求可能時間）に気を付けてください。

```yaml
on:
  push:
    branches:
      - 'feature/**'
    tags:
      - 'api-**'

jobs:
  branches_and_paths_or_tags_and_paths:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Check event trigger enabled
        id: event_trigger
        env:
          PATHS: 'src/'
        run: |
          git checkout HEAD^ --quiet
          files=$(jq -n '$ARGS.positional' --args -- $(git show --pretty='' --name-only "${{ github.sha }}"))
          if "$(jq -n -r --argjson files "${files}" --arg filter "${{ env.PATHS }}" 'isempty($files[]|select(startswith($filter)))')"; then
            echo "enabled=false" >> $GITHUB_OUTPUT
            exit 0
          fi
          echo "enabled=true" >> $GITHUB_OUTPUT
          case "${{ github.ref_type }}" in
            "branch") echo "name=branches_and_paths" >> $GITHUB_OUTPUT ;;
            "tag") echo "name=tags_and_paths" >> $GITHUB_OUTPUT ;;
          esac

      - name: Branches and Paths event
        id: branches_and_paths
        if: steps.event_trigger.outputs.enabled == 'true' && steps.event_trigger.outputs.name == 'branches_and_paths'
        run: |
          echo "Branches and Paths event"

      - name: Tags and Paths event
        id: tags_and_paths
        if: steps.event_trigger.outputs.enabled == 'true' && steps.event_trigger.outputs.name == 'tags_and_paths'
        run: |
          echo "Tags and Paths event"
```

##### 解説

`github.ref_type` の値を参照して、「ブランチとパス」と「タグとパス」のどちらの組み合わせフィルタかを判定しています。この値が、`branch` であれば「ブランチフィルタとパスフィルタ」条件を、`tag` であれば「タグフィルタとパスフィルタ」条件を、それぞれ満たしているということになります。

## おわりに

on.push について、イベントフィルタの仕様をおさらいして、タグとパスの論理積条件を実現したワークフローを例示しました。このイベントトリガー以外にも、GitHub Actions には癖のある仕様のものが多いです。場合によっては、公式ドキュメントに説明がない仕様がある等、取り扱いがなかなかに大変です。本記事を、みなさんの最良な CI/CD の仕組みを作るために役立ててもらえれば嬉しいです。

### 参考文献

- [GitHub Actionsのワークフロー構文](https://docs.github.com/ja/actions/using-workflows/workflow-syntax-for-github-actions)

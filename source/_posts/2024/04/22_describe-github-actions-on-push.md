---
title: 癖が強すぎるGitHub Actionsのon.pushの解説
date: 2024-04-22 08:30:00
updated: 2024-04-22 08:30:00
tags:
  - 技術解説
  - 解説
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
thumbnail: /images/thumbnails/github_thumbnail.webp
cover:
  image: /images/technology/devops/cover.webp
  sources:
    small: /images/technology/devops/cover_small.webp
    medium: /images/technology/devops/cover_medium.webp
    large: /images/technology/devops/cover_large.webp
---

GitHub Actions の on.push は、多用するイベントトリガーの一つですが、とても癖のある仕様です。
本記事では、使いこなすための解説します。

<!-- more -->

## はじめに

### on.push の理解度確認テスト

まずは、この記事を画面の前で読んでいるみなさんに質問です。
下記のように、ワークフローのイベントトリガーを書いた場合、GitHub Actions が処理を行うのは、次の選択肢のうちどれでしょうか？（複数回答可）

```yaml 理解度確認テスト
on:
  push:
    branches:
      - 'feature/**'
    tags:
      - 'api-**'
    paths:
      - 'src/**'
```

1. 「feature/foobar」ブランチで、「dst/foobar.txt」のみのコミットをプッシュした時。
2. 「feature/foobar」ブランチで、「src/foobar.txt」のみのコミットをプッシュした時。
3. 「hot-fix/bug-foobar」ブランチで、「src/foobar.txt」のみのコミットをプッシュした時。
4. 「dst/foobar.txt」のみのコミットに、「api-foobar」タグを付けてプッシュした時。
5. 「src/foobar.txt」のみのコミットに、「api-foobar」タグを付けてプッシュした時。

#### 答え

正解は、「2」と「4」と「5」になります。

さて、みなさんは正解できましたか？
次のセクションでは、on.push の仕様をおさらいします。

## on.push の仕様をおさらい

GitHubの公式ドキュメントの[「Workflow syntax for GitHub Actions」](https://docs.github.com/ja/actions/using-workflows/workflow-syntax-for-github-actions)のページを使って、仕様をおさらいします。
このページは、日本語翻訳されていた記憶があるのですが、今（※2024年04月22日時点）は原文に戻っていて、癖のある仕様でこれを読まないといけないのは、Actions に不慣れな人にとっては苦行ですね。閑話休題。

### イベントフィルタ

on.push イベントのフィルタは、次の3種類で、計6つあります。

1. 「branches」と「branches-ignore」
2. 「tags」と「tags-ignore」
3. 「paths」と「paths-ignore」

次以降のセクションでは、上記3種類のフィルタの解説を行います。

#### (1) branches (branches-ignore)

特定のブランチのプッシュイベントに対して、ワークフローを実行したい時に設定します。

対象とするブランチのホワイトリストとして「branches」フィルタを、対象としないブランチのブラックリストとして「branches-ignore」フィルタを使用します。
これら二つのフィルタは、同じイベントトリガーで同時に使用することはできません。

では、対象ブランチと対象外ブランチの両方を指定したいユースケースがあった場合、どのように設定すればよいのでしょうか？
答えは、『「branches」フィルタで、対象外ブランチの前に否定演算子`!`を付けて記述する』です。

加えて、このユースケースの場合、次の制限事項があることを留意して使用しなければいけません。

1. 対象ブランチとなる定義も併せて必要です。すなわち、「branches」フィルタのリストは、最低でも2件定義することになります。
2. フィルタのリストは上から順番に全て評価します。よって、否定演算子付き定義でブランチを対象外にした後に、別定義でそのブランチが対象に含まれる可能性があります。

#### (2) tags (tags-ignore)

特定のタグのプッシュイベントに対して、ワークフローを実行したい時に設定します。

こちらも「branches」フィルタと同様の仕様で、ホワイトリストとして「tags」フィルタを、ブラックリストとして「tags-ignore」フィルタを使用します。
これら二つのフィルタは、同じイベントトリガーで同時に使用することはできません。

そのため、対象タグと対象外タグの両方を指定したい場合は、「tag」フィルタで、対象外タグの前に否定演算子`!`を付けて記述します。
また、「branches」フィルタと同じ制限事項があります。

#### (3) paths (paths-ignore)

特定のパスを含む**コミットまたはタグ**のプッシュイベントに対して、ワークフローを実行したい時に設定します。

「branches」フィルタや「tags」フィルタと同様の仕様で、ホワイトリストとして「paths」フィルタを、ブラックリストとして「paths-ignore」フィルタを使用します。
これら二つのフィルタは、同じイベントトリガーで同時に使用することはできません。

よって、対象及び対象外となるパスを同時に指定したい場合は、「paths」フィルタで、対象外パスの前に否定演算子`!`を付けて記述します。
こちらも、「branches」フィルタや「tags」フィルタと同じ制限事項があります。

### フィルタ併用時の挙動

#### branches＆paths

「branches（branches-ignore）」フィルタと「paths（paths-ignore）」フィルタを併用した場合、イベントの発動条件が変わります。
なぜなら、論理和条件（OR）ではなく、論理積条件（AND）として作用するからです。
ゆえに、論理和条件で想定した安易なリファクタリングにより、ブランチフィルタのワークフローとパスフィルタのワークフローを一つに統合すると、想定外の動作で痛い目を見ることになるでしょう。

では、どうしてこれらのフィルタを併用すると、論理積条件として作用するのでしょうか？
それは、どちらのフィルタも「コミットのプッシュイベントを対象とするから」だと考えています。

#### tags＆paths

一方で、「tags（tags-ignore）」フィルタと「paths（paths-ignore）」フィルタの併用は、無効な組み合わせになります。
セットで書いたとしても、それぞれが別のフィルタとして独立する論理和条件（OR）となります。
そのため、前述のルールが適用されると勘違いして、「paths（paths-ignore）」フィルタと併用すれば論理積条件（AND）になる、という安易な覚え方をしてしまうと、非常に危険です。

とはいえ、「tags（tags-ignore）」フィルタは、単独だと両方のプッシュイベントを対象にするわけですから、「paths（paths-ignore）」フィルタとの組み合わせが論理積条件にならないことに大いに不満があります。

### 理解度確認テストの解説

さて、これまでの説明で、理解度テストの解答の理由は、お分かりいただけたでしょうか？
前述の通り、ブランチとパスのフィルタは論理積条件で、タグのフィルタは論理和条件です。
そのため、ブランチとパスの両方の条件を満たすのは「2」で、タグの条件を満たすのは「4」及び「5」になるということです。

## on.push を使いこなす

### タグ＆パスの論理積

on.push は、「tags（tags-ignore）」フィルタと「paths（paths-ignore）」フィルタの組み合わせが論理積条件にならないことは、先に述べました。
しかし、下記のようにワークフローを作ると、タグとパスの組み合わせで論理積条件にできます。
ただし、この方法は、Billable Time（請求可能時間）が計上される機会が増えるため、かかるコストを意識して使わなければいけません。

```yaml タグ＆パスの論理積
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

#### 解説

下記の順番で、イベントをフィルタリングしています。

1. HEAD コミットをチェックアウトし、コミットの含まれるファイルの一覧を取得します。
2. ファイルパスフィルタとなる環境変数「PATHS」を用いて、1で取得したファイルの一覧に絞り込みをかけます。

### ブランチ＆パスとタグ＆パスの論理和

先ほどのサンプルコードにブランチフィルタを追加して下記のようにすると、ブランチとパスの論理積条件とタグとパスの論理積条件の論理和条件にできます。
これは、日本語だとわかりにくいので式にして書くと、「（ブランチ条件 AND パス条件）OR（タグ条件 AND パス条件）」という意味になります。
また、こちらの方法でも同様に Billable Time（請求可能時間）に気を付けてください。

```yaml ブランチ＆パス・タグ＆パスの論理和
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

#### 解説

「ブランチとパス」と「タグとパス」のどちらの組み合わせのフィルタか、判定するために、「github.ref_type」の値を参照しています。
この値が「branch」であれば、「ブランチとパス」条件を満たしていて、「tag」であれば、「タグとパス」条件を満たしているということになります。

## おわりに

on.push について、イベントフィルタの仕様をおさらいして、タグ＆パスの論理積条件を実現したワークフローを例示しました。
このイベントトリガーを始めとして、GitHub Actions には癖のある仕様のものが多いです。
場合によっては、公式ドキュメントに説明がない仕様がある等、取り扱いがなかなかに大変です。
本記事を、みなさんの最良な CI/CD の仕組みを作るために役立ててもらえれば嬉しいです。

### 参考文献

#### GitHub 公式ドキュメント

- [「Workflow syntax for GitHub Actions」](https://docs.github.com/ja/actions/using-workflows/workflow-syntax-for-github-actions)

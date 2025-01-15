---
title: GitHub Actionsでプルリクエストを作成する方法
date: 2024-10-21 09:00:00
updated: 2024-10-21 09:00:00
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

GitHub Actions のワークフローを用いて、プルリクエスト作成工程を自動化する方法をまとめました。

<!-- more -->

## はじめに

### 記事の存在意義

この記事を読み終わった後に、GitHub Actions のワークフローを経由で、プルリクエストを作成できるようになっていること。

### 記事を推したい読者様

任意のユースケースにおけるプルリクエストを作成する工程を、GitHub Actions を用いて自動化しようとしている人。

## 汎用的な作成方法

テストパス時やビルド・デプロイ完了時にプルリクエストを作成したり、追加でコミットをプッシュさせてからプルリクエストを作成したりなど、様々なユースケースに対応できる汎用的な方法です。
これは、万能 Action である`actions/github-script`を用いる方法と、GitHub CLI のコマンドを用いる方法の二つがあります。

### 万能 Action を使う

`actions/github-script`は、GitHub でやりたいことをほぼ何でもできる万能 Action です。ゆえに、これを使えば大抵のユースケースに対応できます。しかし、それを実現するためのある程度の知識や技能が要求されることが唯一の難点です。

#### 実装例

ブランチへのコミットプッシュ、または、プルリクエストの何らかのイベントで、プルリクエストを作成する実装例です。
なお、`actions/github-script`でプルリクエストを作成する場合、base や head のパラメータに指定する値は、ブランチの名前でなければいけません。
よって、値が refs から始まる`github.ref`を使うことはできず、push イベントは`github.ref_name`を、pull_request イベントは`github.event.pull_request.head.ref`（`github.head_ref`でも可）を使う必要があります。
そのため、実装例では`github.event_name`に合わせて、プルリクエストの head となるブランチの名前の取得方法を変えています。イベントを固定できる場合は、実装例のようにする必要はありませんので、留意してください。

```yaml actions/github-script を用いる方法
jobs:
  raise_pull_request:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - name: Get a pull request head ref
        id: pull_request_head
        run: |
          case "${{ github.event_name }}" in
            "pull_request") echo "ref=${{ github.event.pull_request.head.ref }}" >> GITHUB_OUTPUT ;;
            "push") echo "ref=${{ github.ref_name }}" >> $GITHUB_OUTPUT ;;
            *) exit 1 ;;
          esac

      - name: Create a pull request
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const headRef = '${{ steps.pull_request_head.outputs.ref }}'
            const createParams = {
              owner: context.repo.owner,
              repo: context.repo.repo,
              base: 'main',
              head: headRef,
              title: `${headRef.substring(0,1).toUpperCase()}${headRef.substring(1)}`
            }
            const { data } = await github.rest.pulls.create(createParams)
            return data
```

#### パラメータ解説

`github.rest.pulls.create`で、使用頻度の高いパラメータの一覧は、以下の通りです。

| 名前    | 必須か？ | 説明                                  |
|-------|:----:|-------------------------------------|
| owner |  はい  | レポジトリのアカウント所有者。大文字と小文字は区別されません。     |
| repo  |  ^^  | `.git`拡張子なしのレポジトリ名。大文字と小文字は区別されません。 |
| head  |  ^^  | 変更が実装されるブランチ名。                      |
| base  |  ^^  | 変更を取り込むブランチ名。                       |
| title |  ^^  | 作成するプルリクエストの題名。                     |
| body  | いいえ  | プルリクエストの内容。                         |
| draft |  ^^  | プルリクエストがドラフトであるか。                   |

### コマンドだけで実現する

外部 Action の使用制限があって、`actions/github-script`を使えない場合は、GitHub CLI のコマンドを用いる方法で解決します。積極的に利用する方法ではありませんが、覚えておくとどこかで役に立つかもしれません。

#### 実装例

こちらも、ブランチへのコミットプッシュ、または、プルリクエストの何らかのイベントで、プルリクエストを作成する実装例です。`github.ref`に関する注意事項は同じですので、詳細は前セクションをご覧ください。

```yaml GitHub CLI のコマンドを用いる方法
jobs:
  raise_pull_request:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - name: Get a pull request head ref
        id: pull_request_head
        run: |
          case "${{ github.event_name }}" in
            "pull_request") echo "ref=${{ github.event.pull_request.head.ref }}" >> GITHUB_OUTPUT ;;
            "push") echo "ref=${{ github.ref_name }}" >> $GITHUB_OUTPUT ;;
            *) exit 1 ;;
          esac

      - name: Checkout branch
        uses: actions/checkout@v4
        with:
          ref: ${{ steps.pull_request_head.outputs.ref }}

      - name: Create a pull request
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr create -B main -t "Pull request title" -a "${{ github.actor }}"
```

## 特定の場合の作成方法

Actions 上で、新規または既存のブランチに対して、ファイル追加・編集・削除などのコミットをプッシュしてから、プルリクエストを作成するユースケースの場合、`actions/github-script`ではなく、`peter-evans/create-pull-request`を用いることで、より簡単に実現できます。
ただし、`peter-evans/create-pull-request`は、上述のユースケース以外で用いようとしても、上手く動かないことに注意が必要です。

### 実装例

汎用的な方法と同じく、ブランチへのコミットプッシュ、または、プルリクエストの何らかのイベントで、プルリクエストを作成する実装例です。`github.ref`に関する注意事項は同じですので、詳細は前セクションをご覧ください。
`peter-evans/create-pull-request`は、変更があるファイルが存在すれば、コミットをプッシュしてプルリクエストを作成するまでを一つのステップで実行できます。しかし、一つのコミットにすべての変更をまとめたくない場合は、含めたくない変更だけを git コマンドでコミットしておく必要があります。

```yaml peter-evans/create-pull-request を用いる方法
jobs:
  raise_pull_request:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: write
    steps:
      - name: Get a pull request head ref
        id: pull_request_head
        run: |
          case "${{ github.event_name }}" in
            "pull_request") echo "ref=${{ github.event.pull_request.head.ref }}" >> GITHUB_OUTPUT ;;
            "push") echo "ref=${{ github.ref_name }}" >> $GITHUB_OUTPUT ;;
            *) exit 1 ;;
          esac

      - name: Checkout branch
        uses: actions/checkout@v4
        with:
          ref: ${{ steps.pull_request_head.outputs.ref }}

      - name: Make changes to pull request
        run: date +%s > report.txt

      - name: Create a pull request
        uses: peter-evans/create-pull-request@v6
        with:
          base: 'main'
          branch: ${{ steps.pull_request_head.outputs.ref }}
          commit-message: Update report
```

### パラメータ解説

`peter-evans/create-pull-request`で、使用頻度の高いパラメータの一覧は、以下の通りです。

| 名前             | 説明                                        |
|----------------|-------------------------------------------|
| branch         | 変更が実装されるブランチ名。                            |
| base           | 変更を取り込むブランチ名。                             |
| title          | 作成するプルリクエストの題名。                           |
| body           | プルリクエストの内容。                               |
| draft          | プルリクエストがドラフトであるか。デフォルトは`false`。           |
| labels         | コンマまたは改行で区切られたラベルリスト。                     |
| assignees      | コンマまたは改行で区切られた担当者リスト。                     |
| reviewers      | コンマまたは改行で区切られたレビュワーリスト。                   |
| milestone      | プルリクエストに関連付けるマイルストーンの番号。                  |
| commit-message | 変更をコミットする時に使用するメッセージ。                     |
| committer      | コミッタの名前とメールアドレス。デフォルトはGitHub Actions Bot。 |

## おわりに

GitHub Actions でプルリクエストを作成する方法をいくつかまとめました。
ユースケースやご自身の環境に合わせて、この記事でご紹介した方法をご活用いただければ幸いです。

### 参考文献

#### GitHub Marketplace

- [GitHub Script · Actions · GitHub Marketplace](https://github.com/marketplace/actions/github-script)
- [Create Pull Request · Actions · GitHub Marketplace](https://github.com/marketplace/actions/create-pull-request)
- [Checkout · Actions · GitHub Marketplace](https://github.com/marketplace/actions/checkout)

#### GitHub

- [actions/github-script](https://github.com/actions/github-script)
- [peter-evans/create-pull-request](https://github.com/peter-evans/create-pull-request)
- [actions/checkout](https://github.com/actions/checkout)
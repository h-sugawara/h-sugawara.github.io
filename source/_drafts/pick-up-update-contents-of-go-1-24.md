---
title: Go 1.24 アップデート内容のピックアップ解説
date: 2025-03-17 09:00:00
updated: 2025-03-17 09:00:00
tags:
  - 技術解説
  - 解説
  - プログラミング
  - Go言語
categories:
  - Technology
  - Backend
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology/programming/title.webp
thumbnail: /images/thumbnails/golang_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

記事見出し文章

<!-- more -->

## はじめに



## ピックアップ解説

### 言語に対する変更

#### Generic Type Aliases 導入

Go 1.23 で実験的導入の機能だった Generic Type Aliases が、Go 1.24 で正式に導入されました。
Generic Type Aliases は、名前の通り、ジェネリクス型のエイリアスを定義するための機能です。これまでのエイリアスでは、左辺で型パラメータを使うことができず、ジェネリクス型にできませんでした（※注：右辺をジェネリクス型にする場合、その型パラメータに具象型を代入すれば利用可能でした）。
この変更によって、次のようなコードを書くことができ、ジェネリクスの型パラメータを引き継げるようになります。なお、埋め込みとは異なりエイリアスのため、レシーバーの追加等の拡張はできません。

```go Generic Type Aliases
// 組み込み型の map を拡張した MyMap 型。int 型がキーの map であることを保証する。
type MyMap[V any] = map[int]V
```

主なユースケースとしては、別パッケージ等で定義されているジェネリクス型の一部を、自分側の定義に置き換える、といった使い方でしょうか。後方互換性を維持しなければならないライブラリのプロバイダには馴染みのある機能になりそうですが、一般ユーザーが直接触れる機会は非常に少なそうです。

### ツール類

#### go.mod に tool ディレクティブ追加

go get コマンドや go mod edit コマンドを使って、ツールの管理や編集ができるようになりました。恐らく今回のアップデートで最も有用なものの一つでしょう。
ツール管理のアプローチは、tools.go を用意（方法1）したり、Go 1.16 以降であれば、Makefile に go install コマンドを集約（方法2）したりする方法が、2つ存在しました。

```go 方法1「tools.go を用意」
// +build tools

package tools

import (
	_ "golang.org/x/tools/cmd/stringer"
)
```

```makefile その2「Makefile に go install コマンドを集約」
.PHONY: tools

tools:
	golang.org/x/tools/cmd/stringer@latest
```

これらのアプローチでは、方法1で tools.go に対する操作がツール同士で競合する場合や、方法2で開発者が複数プロジェクトに関わっている場合、メンテナンスやトラブルシューティングにかかるコストが非常に高く付く可能性があります。
その問題を解消するために、今回のアップデートで、go.mod に tool ディレクティブが追加されました。これにより、プロジェクト内で使用するツールを個別に管理できるようになります。
go.mod には、次のコマンドを実行することで、ツールパッケージが追加されます。

```shell go get コマンドで追加して、go mod tidy コマンドを実行する
$ go get -tool golang.org/x/tools/cmd/stringer
$ go mod tidy
```

```mod コマンド実行後の go.mod
go 1.24

tool (
    golang.org/x/tools/cmd/stringer
)

require (
    golang.org/x/tools v0.28.0
)
```

こうして追加されたツールパッケージは、次のコマンドによって実行できます（注：go.mod に require ディレクティブがあれば実行可能です。ない場合は、go mod tidy コマンドを実行してください）。

```shell go.mod にある stringer を実行する
$ go tool stringer
```

### 標準ライブラリ

#### 制限付ファイルシステム操作



#### weak package 追加



#### iterator に関する関数の追加

bytes パッケージ及び strings パッケージで、Go 1.23 で正式に導入されたイテレータを活用できるように、以下の5つの関数がそれぞれ追加されました。

- Lines
  - 改行ごとで区切られたバイト列（以下、bytes パッケージの場合はこちら）・文字列（以下、strings パッケージの場合はこちら）をイテレータとして返却します。
- SplitSeq
  - 任意のバイト列・文字列で区切られたバイト列・文字列をイテレータとして返却します。
- SplitAfterSeq
  - 任意のバイト列・文字列で区切られた、その任意の値を接尾辞とするバイト列・文字列をイテレータとして返却します。
- FieldsSeq
  - 1つ以上の連続した空白文字列をひと塊の区切り文字とみなし、それで区切られたバイト列・文字列をイテレータとして返却します。
- FieldsFuncSeq
  - 任意の関数を用いて、バイト列・文字列を区切ったものをイテレータとして返却します。

## おわりに



### 参考文献

- [The Go Programming Language Specification - The Go Programming Language](https://tip.golang.org/ref/spec#Alias_declarations)
- [What's in an (Alias) Name? - The Go Programming Language](https://go.dev/blog/alias-names)
- [Managing dependencies - The Go Programming Language](https://tip.golang.org/doc/modules/managing-dependencies#tools)
- [cmd/go: track tool dependencies in go.mod · Issue #48429 · golang/go](https://github.com/golang/go/issues/48429)

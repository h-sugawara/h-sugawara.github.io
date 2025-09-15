---
title: Go 1.24 Generic Type Aliases等のアップデート解説
date: 2025-03-17 09:00:00
updated: 2025-03-17 09:00:00
tags:
  - 解説
  - 技術解説
  - アップデート解説
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
thumbnail: /images/thumbnails/technology/golang_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

Go 1.24 のアップデートから、Generic Type Aliases を始め、いくつかトピックをピックアップしてサンプルコード付きで解説します。

<!-- more -->

## はじめに

冬のメジャーリリースである Go 1.24 が、2025年2月11日（現地時間）にリリースされました。
この記事は、アップデート内容からピックアップしたものを、Go のリリースノートのカテゴライズに倣い、言語に対する変更・ツール・標準ライブラリの三つの大きなセクションに分けて、一部サンプルコード付きで解説したものになります。

## ピックアップ解説

### 言語に対する変更

#### Generic Type Aliases 導入

Go 1.23 で実験的導入だった Generic Type Aliases が、Go 1.24 で正式に導入されました。
この機能は、名前の通り、ジェネリクス型のエイリアスを定義するための機能です。これまでのエイリアスは左辺で型パラメータを使えず、ジェネリクス型にできませんでした（※注：右辺をジェネリクス型にする場合、その型パラメータに具象型を代入すれば利用可能でした）。
これを活用することで、次のようにジェネリクスの型パラメータを引き継げるようになります。なお、埋め込みとは異なりエイリアスのため、レシーバーの追加等の拡張はできません。

```go
// 組み込み型の map を拡張した MyMap 型。int 型がキーの map であることを保証する。
type MyMap[V any] = map[int]V
```

主なユースケースとしては、別パッケージ等で定義されているジェネリクス型の一部を、自分側の定義に置き換える、といった使い方でしょうか。後方互換性を維持しなければならないライブラリのプロバイダには馴染みのある機能になりそうですが、一般ユーザーが直接触れる機会は非常に少なそうです。

### ツール

#### go.mod に tool ディレクティブ追加

`go get` コマンドや `go mod edit` コマンドを使って、ツールの管理や編集ができるようになりました。恐らく今回のアップデートで最も有用なものの一つでしょう。

##### 従来の方法と問題点

ツール管理のアプローチは、tools.go を用意する方法と、Makefile に `go install` コマンドを集約する方法の二つがありました。

{% message color:warning %}
二つ目の Makefile を利用する方法は、Go 1.16 以降から使えます。
{% endmessage %}

```go tools.go を用意する方法
// +build tools

package tools

import (
	_ "golang.org/x/tools/cmd/stringer"
)
```

```makefile Makefile に go install コマンドを集約する方法
.PHONY: tools

tools:
	golang.org/x/tools/cmd/stringer@latest
```

一つ目の方法で tools.go に対する操作がツール同士で競合する場合や、二つ目の方法で開発者が複数プロジェクトに関わっている場合、メンテナンスやトラブルシューティングにかかるコストが非常に高くなる可能性があります。それらの不都合を解消するために、go.mod に `tool` ディレクティブが追加されました。これにより、プロジェクト内で使用するツールを個別に管理できるようになります。

##### tool ディレクティブの使い方

次のコマンドを実行することで、go.mod に `tool` ディレクティブとそのパッケージが追加されます。

```shell
go get -tool golang.org/x/tools/cmd/stringer
go mod tidy
```

```text コマンド実行後の go.mod
go 1.24

tool (
	golang.org/x/tools/cmd/stringer
)

require (
	golang.org/x/tools v0.28.0
)
```

こうして追加されたツールパッケージは、次のコマンドによって実行できます（注：go.mod に `require` ディレクティブがあれば実行可能です。ない場合は、`go mod tidy` コマンドを実行してください）。

```shell
go tool stringer
```

#### go run 及び go tool のビルドキャッシュ

`go run` コマンド及び新しい `go tool` コマンドで作成された実行可能ファイルが、Go のビルドキャッシュに保持されるようになります。キャッシュが大きくなる代わりに、再実行時は高速で動作します。

### 標準ライブラリ

#### encoding/json に omitzero オプション追加

構造体フィールドの json タグに `omitzero` オプションが追加されました。
これは、`encoding/json.Marshal` 等の JSON エンコーディング関数が実行された時に、このオプションを付与した構造体フィールドがゼロ値と判定された場合、出力内容から省略する機能です。構造体フィールドの型が `IsZero` メソッドを持っている場合は、それをゼロ値判定に利用します。
この判定処理の仕様を上手に活用すれば、本来はゼロ値のものをそうとは扱わない、というアプローチができます。以下は、負の整数をゼロ値とみなすフィールドを持つ構造体の例です。

```go
type unsignedInt int

func (i unsignedInt) IsZero() bool {
	if i < 0 {
		return true
	}
	return false
}

type Data struct {
	Status unsignedInt `json:",omitzero"`
}

func main() {
	omitted, _ := json.Marshal(&Data{Status: -1})
	fmt.Printf("omitted is %s\n", omitted)

	included, _ := json.Marshal(new(Data))
	fmt.Printf("included is %s\n", included)
}
```

なお、`omitzero` と `omitempty` のオプションの両方が指定されている場合、少なくともどちらか一つの条件が満たされると、出力内容から省略されます。例えば、直前のサンプルコード内にある Data 構造体 Status フィールドの json タグに `omitempty` オプションを追加した場合、二つ目の出力内容でも Status が省略されます。

#### 制限付ファイルシステム操作

任意のディレクトリ内だけでファイルシステム操作を実行できる `os.Root` 型が追加されました。
ディレクトリトラバーサルやシンボリックリンクなど、想定外の場所にあるディレクトリやファイルへのファイルシステム操作を防ぐためのセキュリティ強化対策として使えます。
以下のように、任意のディレクトリ配下にある全てのファイル及びディレクトリは操作可能ですが、「/」を指定すると制限をかけた意味がなくなるので、気を付けて取り扱ってください。

```go
func main() {
	dir, err := os.OpenRoot(os.TempDir())
	if err != nil {
		fmt.Println(err)
		return
	}
	defer dir.Close()

	if err := dir.Mkdir("app", 0750); err != nil {
		fmt.Println(err)
		return
	}

	file, err := dir.Create("app/test.txt")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()
	file.WriteString("Directory-limited filesystem access test.")
	file.Seek(0, io.SeekStart)

	read, _ := io.ReadAll(file)
	fmt.Printf("test.txt file contents is '%s'\n", read)
	fi, _ := dir.Lstat("app/test.txt")
	fmt.Printf("filename is %s, file size is %d.\n", fi.Name(), fi.Size())
}
```

#### weak パッケージの追加

メモリの再利用を妨げない安全な弱参照ポインタを実装するための weak パッケージが追加されました。
以下に示した実装例の通り、GC が走ると弱参照ポインタが持っている全データを解放できます。
そのため、バッチ処理などで巨大なデータ群を取り扱うようなユースケースであれば、メモリの大食い予防に活用できます。しかしながら、このパッケージも Generic Type Alias と同様に、一般ユーザーは、ライブラリ経由で恩恵を受けることはあっても、自らが使う機会はそれほどなさそうです。

```go
type CachedMap struct {
	kv map[string]weak.Pointer[string]
}

func (c *CachedMap) Get(key string) *string {
	if pointer, exists := c.kv[key]; !exists {
		return nil
	} else if value := pointer.Value(); value != nil {
		return value
	}
	return nil
}

func (c *CachedMap) Set(key string, value string) {
	c.kv[key] = weak.Make(&value)
}

func main() {
	cache := &CachedMap{make(map[string]weak.Pointer[string])}

	for i := 1; i <= 2; i++ {
		key, value := fmt.Sprintf("key%d", i), fmt.Sprintf("value%d", i)
		cache.Set(key, value)
		fmt.Printf("%s value is %v\n", key, cache.Get(key))
	}

	// GC で CachedMap 構造体のマップが保持していた全てのデータが解放される
	runtime.GC()

	for i := 1; i <= 2; i++ {
		key := fmt.Sprintf("key%d", i)
		fmt.Printf("%s value is %v\n", key, cache.Get(key))
	}
}
```

#### sync.Map の処理速度向上

sync パッケージの Map 構造体の実装が変更され、処理速度が向上しました。

#### 何も出力しない log/slog ハンドラの追加

log/slog パッケージに、何も出力しない `DiscardHandler` が新しく追加されました。

#### iterator に関する関数の追加

bytes パッケージ及び strings パッケージで、Go 1.23 で正式に導入されたイテレータを活用できるように、以下の5つの関数がそれぞれ追加されました。

- `Lines`
- `SplitSeq`
- `SplitAfterSeq`
- `FieldsSeq`
- `FieldsFuncSeq`

#### TextAppender と BinaryAppender の追加

encoding パッケージに、`BinaryAppender` と `TextAppender` の2つのインターフェイスが追加されました。これらのインターフェイスが持つ関数は、既存のバイト列に対して、文字列またはバイナリデータを直接追加できます。
下記のパッケージで、定義された構造体、または、関数の戻り値となる構造体において、それぞれのインターフェイスが実装されました。

##### encoding.BinaryAppender を実装したパッケージ

- crypto/md5.New(), crypto/sha1.New(), crypto/sha256.(New() | New224()), crypto/sha512.(New() | New384() | New512_224() | New512_256()), crypto/x509.OID
- hash/adler32.New(), hash/crc32.(New() | NewIEEE()), hash/crc64.New(), hash/fnv.(New32() | New32a() | New64() | New64a() | New128() | New128a())
- math/rand/v2.(ChaCha8 | PCG)
- net/netip.(Addr | AddrPort | Prefix), net/url.URL
- time.Time

##### encoding.TextAppender を実装したパッケージ

- crypto/x509.OID
- log/slog.(Level | LevelVar)
- math/big.(Float | Int | Rat)
- net.IP, net/netip.(Addr | AddrPort | Prefix)
- regex.Regex
- time.Time

## おわりに

Go 1.24 では、Generic Type Alias の正式導入を始め、go.mod への `tool` ディレクティブ追加や encoding/json パッケージへの `omitzero` オプション追加など、小粒な内容ながら開発者体験が良くなるものが揃っています。今回のアップデート内容も活用して、生産性を向上していきたいものです。

### 参考文献

#### Documents

- [Go 1.24 Release Notes](https://tip.golang.org/doc/go1.24)
- [The Go Programming Language Specification](https://tip.golang.org/ref/spec#Alias_declarations)
- [What's in an (Alias) Name?](https://go.dev/blog/alias-names)
- [Managing dependencies](https://tip.golang.org/doc/modules/managing-dependencies#tools)

#### GitHub Issues

- [cmd/go: track tool dependencies in go.mod](https://github.com/golang/go/issues/48429)
- [cmd/go: cache link output binaries in the build cache](https://github.com/golang/go/issues/69290)
- [weak: new package providing weak pointers](https://github.com/golang/go/issues/67552)

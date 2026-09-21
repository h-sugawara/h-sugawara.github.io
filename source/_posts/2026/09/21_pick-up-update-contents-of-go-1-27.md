---
title: Go 1.27 ジェネリックメソッド追加等のアップデート解説
date: 2026-09-21 09:00:00
updated: 2026-09-21 09:00:00
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

Go 1.27 のアップデートから、ジェネリックメソッド追加を始め、いくつかトピックをピックアップしてサンプルコード付きで解説します。

<!-- more -->

## はじめに

夏のメジャーリリースである Go 1.27 が、2026年8月19日（現地時間）にリリースされました。
この記事では、Go のリリースノートからピックアップしたアップデートを、「言語に対する変更」「ツール」「ランタイム・コンパイラ」「標準ライブラリ」のセクションにカテゴライズして解説します。

## ピックアップ解説

### 言語に対する変更

#### ジェネリックメソッド追加

これまでの型パラメータは、構造体のメソッドには適用できず、パッケージ全体をスコープとした関数でしか適用できませんでした。そのため、これまでは別の型へと射影する処理を行う関数は、構造体のメソッドとして実装することを泣く泣く諦めて、次のようにパッケージ関数にしていたことでしょう。

```go
type List[T any] struct {
	items []T
}

// 別の型への射影のためにFilter関数をパッケージの関数として定義する必要がある
func Map[T any, U any](list List[T], fn func(T) U) *List[U] {
	newItems := []U{}
	for item := range slices.Values(list.items) {
		newItems = append(newItems, fn(item))
	}
	return &List[U]{items: newItems}
}

func main() {
	products := List[string]{
		items: []string{
			"天色＊アイルノーツ",
			"サノバウィッチ",
			"千恋＊万花",
			"RIDDLE JOKER",
			"喫茶ステラと死神の蝶",
		},
	}
	mapped := Map(
		products,
		func(title string) bool { return strings.Contains(title, "＊") },
	)
	fmt.Printf("%v\n", mapped)
}
```

ところが、Go 1.27 にて構造体のメソッドに型パラメータを適用できる改良がなされたため、以下のようにメソッドチェーンによる記述を有効活用できるようになりました。ただし、インターフェイスのメソッドについては、今後も引き続き対象外となることを覚えておかなければなりません。

```go
func (list *List[T]) Map[U any](fn func(T) U) *List[U] {
	newItems := []U{}
	for item := range slices.Values(list.items) {
		newItems = append(newItems, fn(item))
	}
	return &List[U]{items: newItems}
}

func main() {
	products := List[string]{
		items: []string{
			"天色＊アイルノーツ",
			"サノバウィッチ",
			"千恋＊万花",
			"RIDDLE JOKER",
			"喫茶ステラと死神の蝶",
		},
	}
	mapped := products.Map(func(title string) bool {
		return strings.Contains(title, "＊")
	})
	fmt.Printf("%v\n", mapped)
}
```

#### 構造体リテラルのキー拡張

構造体リテラルのキーとして、その構造体のトップレベルのフィールド名だけではなく、それ以外（主にネストされた構造体）の有効なフィールド名も指定できるようになりました。ただし、ポインタ型で埋め込んだ構造体のフィールドは、無効扱いで「invalid implicit pointer indirection to reach FamilyName」といったエラーが発生するため、この方法が使えないことを留意しておく必要があります。

```go
type Family struct {
	FamilyName string `json:"familyName"`
}

type Person struct {
	// ポインタ型で埋め込んではいけない
	Family
	GivenName string `json:"givenName"`
}

func (p *Person) Hello() string {
	return fmt.Sprintf("「僕の名前は、%s %sだ」", p.FamilyName, p.GivenName)
}

func main() {
	p := &Person{
		FamilyName: "白雪",
		GivenName:  "乃愛",
	}
	fmt.Println(p.Hello())
}
```

### ツール

#### go mod tidy

これまでは、状況によって go.mod 内の require ブロックのうち、direct または indirect のいずれか、または、両方が重複して存在する可能性があり、`go mod tidy` コマンドを用いても、綺麗に再構成できませんでした。Go 1.27 では、標準的で綺麗な構造へと自動的に統合するようになり、これらの問題が解決されました。ただし、依存関係に付随していたコメントブロックはそのまま保持されます。なお、直接的および間接的な依存関係が混在するディレクティブのセットにコメントブロックが関連付けられている場合、それらは統合されて新しい「直接的な依存関係用」のブロックに付加されます。

#### go test

デフォルトで `stdversion` による vet チェックが呼び出されるようになり、go.mod で設定された Go バージョンよりも新しい標準ライブラリのシンボルを誤って参照していないかを自動で検証できるようになりました。また、`-json` フラグ使用時、Action Output 行に出力の種類（`error`、`error-continue` や `frame` など）を示す OutputType フィールドが追加されました。

#### go fix

新しく `atomictypes`、`embedlit`、`slicesbackward`、`unsafefuncs` などのモダンな記述へ変換するアナライザーが追加された一方、`fmtappendf` アナライザーが削除されました。また、既存の `waitgroup` アナライザーは、曖昧さを避けるために `waitgroupgo` に名前が変わりました。

### ランタイム・コンパイラ

#### 小規模メモリ割り当ての高速化

コンパイラがサイズに特化したメモリ割り当てルーチンを生成するようになり、80バイト未満の小さなメモリ割り当てコストが最大30%削減され、メモリ割り当てが頻繁に発生するプログラムでは全体で約1%のパフォーマンス向上が期待できます。ただし、バイナリサイズは一律約60KB増加します。

### 標準ライブラリ

#### encoding/json/v2 パッケージ追加

Go 1.25 から実験的に導入されていた encoding/json/v2 パッケージが、Go 1.27 にて正式版として追加されました。このパッケージは、従前より存在する `encoding/json` パッケージを性能面や利便性の面で改良することを目的としています。JSON に対するシリアライズ・デシリアライズの関数がひと通り揃っており、構造体から変換する `Marshal` と、構造体へと変換する `Unmarshal` を始め、新たに追加された `MarshalWrite`、`MarshalEncode`、`UnmarshalRead`、`UnmarshalDecode` 等があります。また、これらの関数の引数にはオプションを指定でき、より柔軟な呼び出しに対応しました。

```go
type Person struct {
	FamilyName string `json:"familyName"`
	GivenName  string `json:"givenName"`
}

func (p *Person) FullName() string {
	return fmt.Sprintf("%s %s", p.FamilyName, p.GivenName)
}

func main() {
	inputJson := `[
		{
			"familyName": "白雪",
			"givenName": "乃愛"
		},
		{
			"familyName": "明月",
			"givenName": "栞那"
		},
		{
			"familyName": "三司",
			"givenName": "あやせ"
		},
		{
			"familyName": "朝武",
			"givenName": "芳乃"
		},
		{
			"familyName": "綾地",
			"givenName": "寧々"
		}
	]`
	var persons []Person
	// v1 と同じ記述をするのであれば、v2 での書き方は何も変わらない
	_ = json.Unmarshal([]byte(inputJson), &persons)
	for person := range slices.Values(persons) {
		fmt.Println(person.FullName())
	}
}
```

ちなみに、Go 1.27 にて既存の `encoding/json` パッケージ内部の実装も v2 ベースに刷新されているため、やることは Go のバージョンを更新するだけです。したがって、前述のサンプルコードは、Go 1.27 であれば、v1 と v2 のどちらをインポートしても同じ恩恵を受けられます。しかしながら、それゆえに実際のプロダクトコードでは何かしらの問題が発生するかもしれません。該当する場合は、ビルド時に `GOEXPERIMENT=nojsonv2` を指定すると、元の挙動に戻せます。ただし、このオプトアプトフラグは将来的に削除されるため、それまでに問題を解決する必要があります。

#### encoding/json/jsontext パッケージ追加

`encoding/json/v2` パッケージが従来のパッケージを刷新するために用意されたのと同時に、JSON の構文や文字列を低次元で処理するために `encoding/json/jsontext` パッケージも用意されました。`Encoder` および `Decoder` 型は、JSON を `Token` と `Value` のシーケンスとして処理し、生成または消費されるシーケンスが妥当な JSON 文字列であることを保証するために、ステートマシンを維持します。

#### uuid パッケージ追加

UUID v4 及び v7 の生成や UUID 文字列の解析に対応した uuid パッケージが追加されました。

```go
func main() {
	// uuid.UUID は、Go 1.27 時点では v4 形式で生成する
	fmt.Printf("uuid.New(UUIDv4): %32s\n", uuid.New())
	fmt.Printf("uuid.NewV4: %42s\n", uuid.NewV4())
	fmt.Printf("uuid.NewV7: %42s\n", uuid.NewV7())
	fmt.Printf("uuid.Nil(all 0): %37s\n", uuid.Nil())
	fmt.Printf("uuid.Max(all f): %37s\n", uuid.Max())

	// uuid.Parse は、UUID 形式以外の文字列を渡すとエラーになる
	if _, err := uuid.Parse("not-uuid-string"); err != nil {
		fmt.Println("uuid.Parse error:", err)
	}

	// uuid.MustParse は、UUID 形式以外の文字列を渡すと Panic する
	mustParsed := uuid.MustParse("6a79f747-85b6-4f2b-9125-7c7d8cdb4145")
	fmt.Printf("uuid.MustParse: %38s\n", mustParsed)
}
```

#### bytes.CutLast 追加

指定したセパレータの「最後の出現位置」でスライスを分割する `bytes.CutLast` 関数が、bytes パッケージに追加されます。`bytes.LastIndex` 関数を使うよりも簡単に記述できるようになりました。

#### database/sql.ConvertAssign 追加

データベースドライバーが `Rows.Scan` 関数で実行される型変換処理に直接アクセスできる `database/sql.ConvertAssign` 関数が追加されました。

## おわりに

Go 1.27 では、長年待ち望まれていた構造体のジェネリックメソッドが実装されたことに加え、JSON ライブラリの処理性能や利便性における改善、uuid の公式サポート等、嬉しいこと尽くしのアップデートになりました。ツールチェインのメンテナンスの成果もあり、Go は生成 AI と非常に相性が良い言語の一つですから、これからの時代も積極的にプロジェクトに採用していきましょう。

### 参考文献

#### Documents

- [Go 1.27 Release Notes](https://tip.golang.org/doc/go1.27)

#### GitHub Issues

- [spec: generic methods for Go](https://github.com/golang/go/issues/77273)
- [spec: direct reference to embedded fields in struct literals](https://github.com/golang/go/issues/9859)
- [cmd/go: mod tidy should join "require" sections if there are more than two](https://github.com/golang/go/issues/56471)
- [cmd/go: stdversion check should be on by default for go test](https://github.com/golang/go/issues/77729)
- [encoding/json/v2: new API for encoding/json](https://github.com/golang/go/issues/71497)
- [uuid: add API to generate and parse UUID](https://github.com/golang/go/issues/62026)


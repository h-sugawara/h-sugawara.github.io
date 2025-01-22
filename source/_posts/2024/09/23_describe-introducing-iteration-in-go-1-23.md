---
title: Go 1.23で正式に導入されたイテレータを使いこなそう
date: 2024-09-23 09:00:00
updated: 2025-01-22 18:00:00
tags:
  - 技術解説
  - 解説
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
thumbnail: /images/thumbnails/golang_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

Go 1.23 でイテレータが正式に導入され、本格的に利用できるようになったので、この機能が導入された背景と使うことで齎される恩恵を解説します。

<!-- more -->

## なぜ導入されたのか

かつての Go には、データ反復処理を実装するための標準的な方法が存在しませんでした。そのため、標準ライブラリ（`bufio.Scanner.Scan`、`bufio.Reader.ReadByte`、`bytes.Buffer.ReadByte`、`database/sql.Rows` 等）を始め、数多のモジュールで、反復処理に対する様々なアプローチがそれぞれ個別に採用された結果、利用者側に不都合が生じるようになりました。利用者側の不都合とは、本質的に同じ処理でも、ライブラリやモジュールの仕様に合わせて実装する必要があり、それらの使い方を逐次習得するコストが要求されることです。
イテレータは、この不都合を解消するために、Go 1.22 で実験的に導入された後、Go 1.23 で正式に導入されました。

### 利用者側の不都合とは？

イテレータがなければどのような不都合があるのでしょうか。次のコードは、任意のデータ列から、一行ごとに読み取ってその内容を出力するイテレーションを、最終行まで繰り返す反復処理です。

{% message color:info %}
サンプルコードの完全版は、「[The Go Playground](https://go.dev/play/p/hiYtL1w9Z4r)」にあります。
{% endmessage %}

```go
func main() {
	titles := []string{
		"天色＊アイルノーツ",
		"サノバウィッチ",
		"千恋＊万花",
		"RIDDLE JOKER",
	}
	buf := bytes.NewBufferString(strings.Join(titles, "\n"))
	for {
		line, err := buf.ReadString('\n')
		if err != nil {
			if !errors.Is(err, io.EOF) {
				panic(err)
			}
			if len(line) == 0 {
				break
			}
		}
		fmt.Printf("%v\n", strings.TrimSuffix(line, "\n"))
	}
}
```

これは極端な例になりますが、反復処理の中で、本処理のデータ出力が一行しかないのに対して、それ以外の事前処理や事後処理が、ほぼ全体を占めます。また、一行分の文字列を取得するために使っている関数 `bytes.Buffer.ReadString` を別のものに置き換える場合、例えば、`bufio.Reader.ReadLine` 関数にするのであれば、前述の通り仕様が異なるため、適合するように書き換える必要があります。
Go に慣れるとこれらの事実に対して何も感じないかもしれませんが、初心者だった頃を思い出してください。「反復処理を同じように書けないのは何故」や「終端エラー処理を写経のように毎回書くのが面倒」などと、一度くらいは脳裏を過ったことがあるはずです。
さて、イテレータがなければどのような不都合があるか、を認識していただけましたでしょうか。次のセクションでは、この機能が導入されたことで何が変わったのかを解説します。

## 何が変更されたのか

Go では、イテレータを導入するために、反復処理に Range over function 機能を実装しました。これによって、ライブラリやモジュールで固有となるデータ操作処理をイテレータの内部に分離でき、それらの利用者はイテレーションの本処理に注力できる状態になりました。

### Range over function

Range over function とは、最大二つまでの引数を持ち `bool` 型の戻り値を返す「yield 関数（イテレータ）」を、for-range のループ処理の対象として指定できる機能です。次の三種類の関数が、Range over function に利用できる yield 関数とみなされます。

1. `func(yield func() bool)`
2. `func(yield func(V) bool)`
3. `func(yield func(K, V) bool)`

そして、これらの中で引数を一つ以上持つイテレータには、それぞれ固有の型が定義されました。具体的には、`func(yield func(V) bool)` 関数に `iter.Seq[V any]` 型が、`func(yield func(K, V) bool)` 関数に `iter.Seq2[K, V any]` 型が割り当てられています。
では、以降のサブセクションで、現状で使いどころがなさそうな `func(yield func() bool)` を除いた、他二つのイテレータの実例をみていきましょう。

#### (1) func(yield func(V) bool)

不都合な問題が分かる例のサンプルコードを、イテレータを用いて書き換えたものが下記となります。

{% message color:info %}
サンプルコードの完全版は、「[The Go Playground](https://go.dev/play/p/WF1mY-EqnXA)」にあります。
{% endmessage %}

```go
// -- main.go --
func main() {
	titles := []string{
		"天色＊アイルノーツ",
		"サノバウィッチ",
		"千恋＊万花",
		"RIDDLE JOKER",
	}
	buf := bytes.NewBufferString(strings.Join(titles, "\n"))
	for line := range buf.ReadLines() {
		fmt.Printf("%v\n", line)
	}
}

// -- bytes/buffer.go --
func (b *Buffer) ReadLines() iter.Seq[string] {
	return func(yield func(string) bool) {
		for {
			line, err := b.ReadString('\n')
			if err != nil {
				if !errors.Is(err, io.EOF) {
					panic(err)
				}
				if len(line) == 0 {
					return
				}
			}
			yield(strings.TrimSuffix(line, "\n"))
		}
	}
}
```

`bytes.Buffer.ReadString` 関数に関する処理が `bytes/buffer.go` に分離され、利用者側の `main.go` からは隠蔽できていることが分かりますでしょうか。bytes パッケージは、標準ライブラリなのでイテレータ対応の関数が将来的に用意されるでしょう。けれども、`bytes.Buffer.ReadString` 関数については、ユースケースによって不都合が生じるため、自前でイテレータを用意する方が便利かもしれません。

#### (2) func(yield func(K, V) bool)

イテレータ対応版に書き換えた「(1) `func(yield func(V) bool)`」のコードを、`func(yield func(K, V) bool)` バージョンへさらに書き換えると、次のようになります。

{% message color:info %}
サンプルコードの完全版は、「[The Go Playground](https://go.dev/play/p/Z6KTtwXjQJ7)」にあります。
{% endmessage %}

```go
-- main.go --
func main() {
	titles := []string{
		"天色＊アイルノーツ",
		"サノバウィッチ",
		"千恋＊万花",
		"RIDDLE JOKER",
	}
	buf := bytes.NewBufferString(strings.Join(titles, "\n"))
	for line, err := range buf.ReadLines() {
		if err != nil {
			fmt.Printf("%v\n", err)
			break
		}
		fmt.Printf("%v\n", line)
	}
}

-- bytes/buffer.go --
func (b *Buffer) ReadLines() iter.Seq2[string, error] {
	return func(yield func(string, error) bool) {
		for {
			line, err := b.ReadString('\n')
			switch {
			case err != nil && !errors.Is(err, io.EOF) && !yield("", err):
				return
			case len(line) == 0:
				return
			case !yield(strings.TrimSuffix(line, "\n"), nil):
				return
			}
		}
	}
}
```

「(1) `func(yield func(V) bool)`」と比較して、イテレータ側の処理でエラーが発生した時に panic を起こさず、利用者側でエラーの詳細を取得できるようになっていますので、より実用的になっています。また、for-range において順序非保証である map と同様の構造をとりつつも、こちらは順序保証の slice になっていることも強みでしょう。
ちなみに、利用者側のループ処理中で `break` した場合は、yield 関数は `false` を返します。その場合は、イテレータが処理を続行できなくなる仕様となっています。したがって、サンプルコードのように、イテレータ側で yield 関数の戻り値をチェックし、`false` であれば制御を戻すようにコーディングする必要がありますので、忘れないようにしてください。

## おわりに

イテレータが、Go 1.23 で正式に導入されました。今後は、ライブラリやモジュールのプロバイダが、イテレータに順次準拠した関数等を提供するようになることが想定されます。この状況は、我々利用者側としては、データ反復処理が今よりも簡単に書けるようになるので、嬉しい限りです。

### まとめ

#### イテレータとは何か？

Go では、最大二つまでの引数を持ち、`bool` 型の戻り値を返す3種類の yield 関数を指す。

#### イテレータが導入された理由は？

データ反復処理の標準的な方法が存在せず、ライブラリやモジュールの提供者が好き勝手に実装した結果、利用者の習得コストが大きく跳ね上がった不都合を解消するため。

#### イテレータで解決したことは何か？

Range over function によってデータ反復処理が標準化され、ライブラリやモジュール固有の処理を隠蔽できるようになり、利用者が本処理に注力できるようになった。

### 参考文献

#### Go 言語公式サイト

- [Go 1.23 Release Notes - The Go Programming Language](https://tip.golang.org/doc/go1.23)
- [Range Over Function Types - The Go Programming Language](https://go.dev/blog/range-functions)

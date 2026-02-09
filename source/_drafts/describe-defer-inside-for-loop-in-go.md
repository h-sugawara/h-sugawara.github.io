---
title: Goのdeferの仕様を理解して適切に使いこなそう
date: 2026-07-20 09:00:00
updated: 2026-07-20 09:00:00
tags:
  - 解説
  - 技術解説
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

Go の特徴であり、強みでもある defer の基本的な仕様と、それを適切に取り扱う上で問題とされる処理や、その課題の本質について解説します。

<!-- more -->

## はじめに

まずは、本題に必要な前提知識として、Go における `defer` の基本的な仕様（仕組み・メリット・実行と評価の順序）を解説します。次に、`defer` を適切に取り扱う上で問題とされる処理に焦点を当てて、筆者がその是非をどのように考えているのかについて説明します。

### defer の基本的な仕様

{% message color:info %}
このセクションで解説している `defer` の仕組みと強みについては、[Effective Go](https://go.dev/doc/effective_go#defer) の内容を意訳したものです。正しく理解したい方は、原文をご覧ください。
{% endmessage %}

#### 仕組みと強み

Go の `defer` は、実行される関数のスコープから抜けるタイミングで呼び出しするように、スケジューリングします。これは、関数内で行われる処理の内容に関わらず、解放する必要があるリソースに対処するための、珍しいながらも効果的な方法になります。`defer` を用いる典型的な例としては、mutex のロックを解除したり、開いたファイルを閉じたりする処理などが挙げられます。
次のサンプルコードは、ファイルの内容を取得する関数 `ReadContents` で、いかなるタイミングでスコープを抜けたとしても、`defer` によってファイルを必ず閉じる処理になります。

```go
func ReadContents(filename string) (string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return "", err
	}
	defer f.Close()

	result, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}
	return string(result), nil
}
```

前例における `Close` 関数のように、遅延呼び出しさせることには、メリットが２つあります。１つは、分岐して return する処理を後から追加したとしても、ファイルを閉じ忘れないことです。もう１つは、ファイルの開閉に関する処理が近接するため、関数の最後に置くよりも認知負荷が低くなることです。

#### 実行と評価の順序

`defer` の対象となる関数（以降、「遅延関数」と略）の引数の評価は、呼び出された時ではなく、その関数が実行される時に行われます。また、遅延関数はスタックで保持されているため、後入れ先出し（LIFO: Last In, First Out）順で実行されます。現実的な例として、プログラム内で関数の実行をトレースする簡単な方法があります。次のように簡単なトレースルーチンをいくつか記述できます。

```go
func trace(s string) {
	fmt.Println("entering:", s)
}

func untrace(s string) {
	fmt.Println("leaving:", s)
}

func a() {
	trace("a")
	defer untrace("a")
}
```

また、即時評価される通常関数の結果を遅延関数の引数に渡すと、評価順の仕様を上手に活用でき、より効果的な実装にできます。前述のトレースルーチンを、解除するルーチンへの引数にしてみましょう。

```go
func trace(s string) string {
	fmt.Println("entering:", s)
	return s
}

func un(s string) {
	fmt.Println("leaving:", s)
}

func a() {
	defer un(trace("a"))
	fmt.Println("in a")
}

func b() {
	defer un(trace("b"))
	fmt.Println("in b")
	a()
}

func main() {
	b()
}
```

これを実行すると、以下の結果になります。どちらの関数も、トレース、通常処理、トレース解除の順番でメッセージが出力されているのが分かるかと思います。

```text
entering: b
in b
entering: a
in a
leaving: a
leaving: b
```

## 問題とされる処理

さて、`defer` の仕組みや強みは、理解してもらえましたでしょうか。それでは、問題とされるコードを例示します。次のサンプルコードは、`main` 関数にある For ループのイテレータごとに、メッセージを出力した後に `delay` 関数を `defer` で宣言する、を繰り返すシンプルな処理です。

```go
func main() {
	fmt.Println("start main")
	for i := range 5 {
		fmt.Printf("main #%d\n", i)
		defer delay(i)
	}
	fmt.Println("end main")
}

func delay(i int) {
	fmt.Printf("delay #%d\n", i)
}
```

これを実行すると、以下の結果になります。`main` 関数のスコープを抜けた後に、For ループ処理の順逆で `delay` 関数が呼び出されて、メッセージが出力されていることが確認できます。

```text
start main
main #0
main #1
main #2
main #3
main #4
end main
delay #4
delay #3
delay #2
delay #1
delay #0
```

### 問題点は何か？

サンプルコードと同じような構造のプログラムを実行することで起こりうる問題は何でしょうか。
それは、関数スコープを抜けるまでの時間が長く、リソースリークが発生しやすくなる問題を抱えていることです。
リソースリークとは、使用済みのリソースをプログラムが適切に解放しないことで、システムリソースが消費された状態のままとなり、他のプログラムから再利用できなくなる現象のことを言います。代表的なものを挙げると、データベースに対する処理だった場合は、データベースコネクションの枯渇、ファイルに対する処理だった場合は、ファイルディスクリプタ（Windows の場合は、ファイルハンドラ）の枯渇、メモリを消費する処理だった場合は、メモリの枯渇です。
しかし、これらの問題は、実際に発生するのでしょうか。現代の実行環境のスペックは、ひと昔前と比べると、最低クラスでもかなり高めです。したがって、悪意を持って書いたか、超低品質の処理を書いてしまったか、のどちらかでなければ、通常発生しないと筆者は考えています。

### 実際に起こりうるか？

まずは、通常であればリソースリークの問題は発生しない、という論拠を明示するために、別の視点や切り口で考えてみましょう。そのために、前述したサンプルコードを同じ出力結果になるように、For ループから別の処理に置き換えてみましょう。

```go
func main() {
	fmt.Println("start main")
	fmt.Printf("main #%d\n", 1)
	defer delay(1)
	fmt.Printf("main #%d\n", 2)
	defer delay(2)
	fmt.Printf("main #%d\n", 3)
	defer delay(3)
	fmt.Printf("main #%d\n", 4)
	defer delay(4)
	fmt.Printf("main #%d\n", 5)
	defer delay(5)
	fmt.Println("start end")
}

func delay(i int) {
	fmt.Printf("delay #%d\n", i)
}
```

似たような処理をどこかで見たことはありませんか。全く同じ処理を５回も繰り返すことはほぼありえませんが、様々なリソースを使う処理だと似たような構造になることは、Go の経験者であれば心当たりはあるのではないでしょうか。そういう時は、皆さんも違和感なく、同じようなコードを書いていることでしょう。このことを前提にして考えてみると、有限回数で終わる For ループで `defer` を使うことがリソースリーク発生の直接的な原因とはならない、と分かるかと思います。

### 問題の本質は

では、この問題の本質は何でしょうか。それは、関数スコープを抜けるまでにかかる処理に時間がかかるほど、`defer` でのリソース解放までの待ち時間が発生するため、リーク発生のリスクを抱えることです。したがって、この問題は、For ループ内に限った話ではなく、一般的な関数内でも書き方次第では起こりうるのです。逆に言い換えれば、関数スコープを抜けるまでの時間が短いほど、リーク発生のリスクを抑えられるということです。ゆえに、For ループ内で `defer` を使う場合は、次のようにループスコープ内に関数を作り、その場で実行すればリスクを最小限まで抑えられます。なお、最小限のリスクしかないことが分かっている時は、関数化せずにそのままでもよいです。

```go
func main() {
	fmt.Println("start main")
	for i := range 5 {
		func() {
			fmt.Printf("main #%d\n", i)
			defer delay(i)
		}()
	}
	fmt.Println("end main")
}

func delay(i int) {
	fmt.Printf("delay #%d\n", i)
}
```

結果は次の通りで、ループのイテレータごとに `defer` までの処理を完了できていることが分かります。

```text
start main
main #0
delay #0
main #1
delay #1
main #2
delay #2
main #3
delay #3
main #4
delay #4
end main
```

コードとしては例示しませんが、一般的な関数でリソースを取り扱う時も、同じようにスコープを短くするように意識して書くと、より質の高いコードを生み出せるようになります。

## おわりに

`defer` について検索すると、For ループスコープ内でそれを直接使った処理を書いてはいけない、といった記事を見かけますが、筆者としては、本質的な問題はそういうことではない、と考えていたので、今回はそれを記事として形にさせていただきました。表面的な事象の一つに囚われると、正しく認識出来なくなりますから、視野を広く持って、本質を見られるようにしたいところです。

### 参考文献

- [Effective Go](https://go.dev/doc/effective_go)
- [Tour of Go - Defer](https://go-tour-jp.appspot.com/flowcontrol/12)
- [Resource leak](https://en.wikipedia.org/wiki/Resource_leak)

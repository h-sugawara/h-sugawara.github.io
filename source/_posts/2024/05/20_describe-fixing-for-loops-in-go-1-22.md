---
title: Go 1.22でForループスコープ変数の問題が正式に修正へ
date: 2024-05-20 09:00:00
updated: 2025-01-15 20:00:00
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
thumbnail: /images/thumbnails/golang_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

Go 1.21 までは For ループのスコープ変数に問題がありましたが、Go 1.22 でようやく正式修正となったため、その問題の内容と原因を解説します。

<!-- more -->

## どのような問題か

For ループ内で、別スコープで実行する処理（無名関数や Goroutine）中に、ループスコープ変数を直接取り扱う処理を行うと、意図しない実行結果になる問題です。
意図しない実行結果は、どの無名関数や Goroutine でも、ループスコープ変数の値がすべて同じ値になる、という仕様によって引き起こされます。この仕様がどうして問題かというと、**書いた通りに動かない**からです。同じ処理がループの外と内で異なる実行結果になるのは、プログラマにとって仕様ではなく不具合と言って差支えないでしょう。

### 身近な実例

チャネルや WaitGroup を使う機会は意外と少ないため、書く頻度が高そうなコードで説明します。
以下のサンプルは、ゆずソフトのいくつかのゲームリストから、2016年5月20 日以前に発売されたタイトルを、別のリストに抽出する処理です。このコードを実行すると、1.22 では期待する結果になりますが、1.21 ではそうなりません。

{% message color:info %}
サンプルコードの完全版は、「[The Go Playground](https://go.dev/play/p/JZQxIs3hdzF)」にあります。
{% endmessage %}

```go
func main() {
	type GameTitle struct {
		name         string
		brand        string
		published_at string
	}
	titles := []GameTitle{
		{name: "天色＊アイルノーツ", brand: "ゆずソフト", published_at: "2013-07-26"},
		{name: "サノバウィッチ", brand: "ゆずソフト", published_at: "2015-02-24"},
		{name: "千恋＊万花", brand: "ゆずソフト", published_at: "2016-07-29"},
		{name: "RIDDLE JOKER", brand: "ゆずソフト", published_at: "2018-03-30"},
	}
	invokers := make([]func(time.Time) *GameTitle, 0)
	for _, v := range titles {
		invokers = append(
			invokers,
			func(compare time.Time) *GameTitle {
			  fmt.Printf("Game title is '%s'.\n", v.name)
				if published, _ := time.Parse("2006-01-02", v.published_at); published.Before(compare) {
					return &v
				}
				return nil
			},
		)
	}
	results := make([]GameTitle, 0)
	for _, v := range invokers {
		if ret := v(time.Date(2024, 5, 20, 0, 0, 0, 0, time.Local).AddDate(-8, 0, 0)); ret != nil {
			results = append(results, *ret)
		}
	}
	fmt.Printf("Results is %+v.", results)
}
```

#### Go 1.21 以前の実行結果

ループスコープと匿名関数スコープで、下記のように変数の値が異なる結果になります。
「RIDDLE JOKER」のデータだけが出力されていることから分かるように、ループの最終イテレーションでバインドされた値が、全ての匿名関数スコープで参照されます。よって、「RIDDLE JOKER」は2016年5月20日以降に発売されているため、対象データはなしとなり、抽出結果が空の配列になります。

```text
LoopScope: {name:天色＊アイルノーツ brand:ゆずソフト published_at:2013-07-26}.
LoopScope: {name:サノバウィッチ brand:ゆずソフト published_at:2015-02-24}.
LoopScope: {name:千恋＊万花 brand:ゆずソフト published_at:2016-07-29}.
LoopScope: {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
FuncionScope: {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
FuncionScope: {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
FuncionScope: {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
FuncionScope: {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
Results is [].
```

#### Go 1.22 の実行結果

ループスコープと匿名関数スコープの結果が一致します。
これにより、匿名関数の処理が正しく行われ、2016年5月20日以前に発売された「天色＊アイルノーツ」と「サノバウィッチ」が、抽出結果のリストに含まれます。

```text
LoopScope: {name:天色＊アイルノーツ brand:ゆずソフト published_at:2013-07-26}.
LoopScope: {name:サノバウィッチ brand:ゆずソフト published_at:2015-02-24}.
LoopScope: {name:千恋＊万花 brand:ゆずソフト published_at:2016-07-29}.
LoopScope: {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
FuncionScope: {name:天色＊アイルノーツ brand:ゆずソフト published_at:2013-07-26}.
FuncionScope: {name:サノバウィッチ brand:ゆずソフト published_at:2015-02-24}.
FuncionScope: {name:千恋＊万花 brand:ゆずソフト published_at:2016-07-29}.
FuncionScope: {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
Results is [{name:天色＊アイルノーツ brand:ゆずソフト published_at:2013-07-26} {name:サノバウィッチ brand:ゆずソフト published_at:2015-02-24}].
```

## なぜ発生するのか

この問題が発生する理由は、**イテレーションごとにループスコープ変数を新しく割り当てない**ためです。Go 1.22 では、イテレーションごとにループスコープ変数を新しく割り当てるようになりました。

### 原因の確認

それでは、Go 1.21 で変数が新しく割り当てられていないことを確認してみましょう。
サンプルコードを簡単にした派生コードをベースに、ループスコープと匿名関数スコープのそれぞれの変数アドレスを出力するように書き換えます。

```go
func main() {
	type GameTitle struct {
		name         string
		brand        string
		published_at string
	}
	titles := []GameTitle{
		{name: "天色＊アイルノーツ", brand: "ゆずソフト", published_at: "2013-07-26"},
		{name: "サノバウィッチ", brand: "ゆずソフト", published_at: "2015-02-24"},
		{name: "千恋＊万花", brand: "ゆずソフト", published_at: "2016-07-29"},
		{name: "RIDDLE JOKER", brand: "ゆずソフト", published_at: "2018-03-30"},
	}
	results := make([]func(), 0)
	for _, v := range titles {
		fmt.Printf("[loop] address = %p, value = %+v.\n", &v, v)
		results = append(results, func() { fmt.Printf("[func] address = %p, value = %+v.\n", &v, v) })
	}
	for _, v := range results {
		v()
	}
}
```

これを実行した結果は、次のようになります。

```text
[loop] address = 0xc0000160f0, value = {name:天色＊アイルノーツ brand:ゆずソフト published_at:2013-07-26}.
[loop] address = 0xc0000160f0, value = {name:サノバウィッチ brand:ゆずソフト published_at:2015-02-24}.
[loop] address = 0xc0000160f0, value = {name:千恋＊万花 brand:ゆずソフト published_at:2016-07-29}.
[loop] address = 0xc0000160f0, value = {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc0000160f0, value = {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc0000160f0, value = {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc0000160f0, value = {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc0000160f0, value = {name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
```

ループスコープ変数は同じアドレスを使い、イテレーションごとに値が上書きされています。
また、ループスコープと匿名関数スコープのそれぞれの変数アドレスが同一であるため、使いまわされていることも分かります。

### 別の視点でも確認

さて、聡い方は、原因を確認するためのコードを見て気付いたのではないでしょうか。ループスコープ変数が値ではなくポインタの場合は、違う挙動になるのではないか、と。では、その気付きが正しいかを、派生コードの GameTitle 構造体のポインタを要素に持つスライスに置き換えて確認してみましょう。

```go
func main() {
	type GameTitle struct {
		name         string
		brand        string
		published_at string
	}
	titles := []*GameTitle{
		{name: "天色＊アイルノーツ", brand: "ゆずソフト", published_at: "2013-07-26"},
		{name: "サノバウィッチ", brand: "ゆずソフト", published_at: "2015-02-24"},
		{name: "千恋＊万花", brand: "ゆずソフト", published_at: "2016-07-29"},
		{name: "RIDDLE JOKER", brand: "ゆずソフト", published_at: "2018-03-30"},
	}
	results := make([]func(), 0)
	for _, v := range titles {
		fmt.Printf("[loop] address = %p, value = %+v.\n", v, v)
		results = append(results, func() { fmt.Printf("[func] address = %p, value = %+v.\n", v, v) })
	}
	for _, v := range results {
		v()
	}
}
```

実行した結果は、以下のようになります。

```text
[loop] address = 0xc0001060c0, value = &{name:天色＊アイルノーツ brand:ゆずソフト published_at:2013-07-26}.
[loop] address = 0xc0001060f0, value = &{name:サノバウィッチ brand:ゆずソフト published_at:2015-02-24}.
[loop] address = 0xc000106120, value = &{name:千恋＊万花 brand:ゆずソフト published_at:2016-07-29}.
[loop] address = 0xc000106150, value = &{name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc000106150, value = &{name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc000106150, value = &{name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc000106150, value = &{name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
[func] address = 0xc000106150, value = &{name:RIDDLE JOKER brand:ゆずソフト published_at:2018-03-30}.
```

イテレーションごとにループスコープ変数のアドレスが変わっています。しかし、これは新しい変数を割り当てているのではなく、オリジナルの GameTitle 構造体の各要素に割り当てられたポインタのアドレスです。以上より、ポインタの場合は、イテレーションごとに値ではなく参照するポインタを書き換えていることが分かります。

## おわりに

Go 1.21 以前を使っている場合は、なるべく早めに Go 1.22 に更新しましょう。

### まとめ

#### どのような問題か？

For ループ内で、別スコープで実行する処理（無名関数やGoroutine）中に、ループスコープ変数を直接取り扱う処理を行うと、意図しない実行結果になる問題。

#### なぜ発生するのか？

For ループのイテレーションごとにスコープ変数を新しく割り当てないことで、最後に更新した値・ポインタが残存するため。

- 値の場合は、一つのループに対して一つだけ割り当てられた変数の値を更新する仕様
- ポインタの場合は、一つのループに対して一つだけ参照しているポインタのアドレスを更新する仕様

#### どのように解決したのか？

For ループのイテレーションごとにスコープ変数を新しく割り当てるように処理を変更した。

- 値の場合は、イテレーションごとに変数の値を保持する仕様
- ポインタの場合は、イテレーションごとに参照するポインタを保持する仕様

### 参考文献

#### Go 言語公式サイト

- [Go 1.22 Release Notes - The Go Programming Language](https://tip.golang.org/doc/go1.22)
- [Fixing For Loops in Go 1.22 - The Go Programming Language](https://go.dev/blog/loopvar-preview)

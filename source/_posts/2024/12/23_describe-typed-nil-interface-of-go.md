---
title: Goのinterfaceをnilとして取り扱う時に注意すべきこと
date: 2024-12-23 09:00:00
updated: 2025-01-24 09:00:00
tags:
  - 解説
  - 技術解説
  - Advent Calendar
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

Go の interface は取り扱い方によって、nil 判定の結果が想定通りになりません。その問題についての解説と対処方法をご紹介します。

<!-- more -->

{% message color:info %}
この記事は、[mediba Advent Calendar 2024](https://qiita.com/advent-calendar/2024/mediba) と [Go Advent Calendar 2024](https://qiita.com/advent-calendar/2024/go) の24日目にエントリーしています。
{% endmessage %}

## はじめに

### interface の理解度確認

さて、本題に入る前に、Go の interface と nil の仕様をどの程度理解しているか、画面の前で読んでいるみなさんに3つ質問です。

#### 問1「interface の戻り値」

以下のコードでは、`error` インターフェイス型の戻り値を持つ関数 `Action1` で、`MyError` 構造体ポインタ型の nil を値として返却しています。

```go
type MyError struct {
	error
}

func main() {
	if err := Action1(false); err != nil {
		fmt.Printf("err is %#v.\n", err)
	} else {
		fmt.Println("err is nil.")
	}
}

func Action1(hasError bool) error {
	var err *MyError
	if hasError {
		err = new(MyError)
	}
	return err
}
```

このとき、`main` 関数を実行して表示出力される内容は、以下のうちどれでしょうか？（複数選択不可）

1. 「err is &main.MyError{error:error(nil)}.」
2. 「err is (*main.MyError)(nil).」
3. 「err is nil.」

#### 問2「interface への代入」

以下のコードでは、関数 `Action2` で `MyError` 構造体ポインタ型の nil を返し、それを `main` 関数で宣言した `error` インターフェイス型の変数 `err` に代入します。

```go
type MyError struct {
	error
}

func main() {
	var err error
	if err = Action2(false); err != nil {
		fmt.Printf("err is %#v.\n", err)
	} else {
		fmt.Println("err is nil.")
	}
}

func Action2(hasError bool) *MyError {
	if hasError {
		return new(MyError)
	}
	return nil
}
```

このとき、`main` 関数を実行して表示出力される内容は、以下のうちどれでしょうか？（複数選択不可）

1. 「err is &main.MyError{error:error(nil)}.」
2. 「err is (*main.MyError)(nil).」
3. 「err is nil.」

#### 問3「interface の引数」

以下のコードでは、問1と問2で登場した関数 `Action1` 及び `Action2` と、`error` インターフェイス型の引数を持つ `Action3` 関数があります。

```go
type MyError struct {
	error
}

func main() {
	Action3(Action1(false))
	Action3(Action2(false))
}

func Action1(hasError bool) error {
	var err *MyError
	if hasError {
		err = new(MyError)
	}
	return err
}

func Action2(hasError bool) *MyError {
	if hasError {
		return new(MyError)
	}
	return nil
}

func Action3(err error) {
	if err != nil {
		fmt.Printf("err is %#v.\n", err)
	} else {
		fmt.Println("err is nil.")
	}
}
```

この `Action3` 関数を実行して表示出力される内容は、次のうちどれかになります。

A. 「err is &main.MyError{error:error(nil)}.」
B. 「err is (*main.MyError)(nil).」
C. 「err is nil.」

以上より、関数 `Action1` 及び `Action2` の戻り値を、関数 `Action3` の引数にそれぞれ渡した時、表示出力される内容の組み合わせとして正しいものはどれでしょうか？（組み合わせの順番は前後可）

1. AとA
2. AとB
3. AとC
4. BとB
5. BとC
6. CとC

#### 問題の答え

正解は、問1が「2」、問2が「2」、問3が「4」です。みなさんは、全問正解できましたか？
Go は、このようなインターフェイスの取り扱い方をすると、「nil」として扱いません。次のセクションでは、このような不都合な問題が発生する理由について解説します。

## 直感に反する Typed-nil

言語利用者の直感に反する不都合なこの問題は、「Typed-nil」と呼ばれます。これは、Go のインターフェイスの実装と比較処理によって発生します。
このセクションでは、それぞれの仕様を、ざっくりと要約した内容で説明します。

### interface の実装

まずは、interface 実装です。Go 1.23.3 では、以下の通り、`iface` という名前の構造体になります。

```go
type iface struct {
	tab  *itab
	data unsafe.Pointer
}
```

この構造体は、`tab` フィールドに型情報を、`data` フィールドに実際の値を、それぞれ代入させるという使い方がされています。したがって、インターフェイスは、「型情報と値のペアでデータを保持する」仕様であることが読み取れます。よって、インターフェイスへ構造体ポインタのゼロ値を代入すれば、型情報を持ち値が「nil」の状態を作り出せる、ということも分かりますでしょうか。

### interface の比較処理

次に、実装を前提として、Go 1.23.3 における interface の比較処理を見ていきます。

```go
func interequal(p, q unsafe.Pointer) bool {
	x := *(*iface)(p)
	y := *(*iface)(q)
	return x.tab == y.tab && ifaceeq(x.tab, x.data, y.data)
}
func ifaceeq(tab *itab, x, y unsafe.Pointer) bool {
	if tab == nil {
		return true
	}
	t := tab.Type
	eq := t.Equal
	if eq == nil {
		panic(errorString("comparing uncomparable type " + toRType(t).string()))
	}
	if isDirectIface(t) {
		// See comment in efaceeq.
		return x == y
	}
	return eq(x, y)
}
```

比較処理は、二段階で行われます。まずは、`interequal` 関数で型情報の一致を確認します。次に、`ifaceeq` 関数で値の一致を確認します。
ではここで、構造体ポインタのゼロ値を代入した `error` インターフェイスと、「nil」の比較について考えてみましょう。「nil」は、見方を変えると、型情報と値のどちらも「nil」であるインターフェイスです。一方で、 `error` インターフェイスは、型情報を持ち値が「nil」の状態です。
ゆえに、一段階目にこれらの型情報を比較した時点で、「不一致（false）」が確定します。そのため、理解度確認の全ての問における `err != nil` の判定は、必ず「true」です。したがって、実装と比較処理の仕様によって、不都合な問題が発生しています。

## 問題回避のための処方箋

インターフェイスで「Typed-nil」問題が発生する要因が分かりました。このセクションでは、それを解決または回避するための方法を提示します。

### 関数の戻り値の場合

問1 のようにインターフェイスを関数の戻り値にする時は、「nil」とそうではない場合のそれぞれに分岐させてから、値を返す必要があります。

```go
func Action1(hasError bool) error {
	if hasError {
		return new(MyError)
	}
	// nil として明示的に return することで、型情報と値の両方を nil にする
	return nil
}
```

### 変数代入の場合

問2 のように変数に代入している場合、代入元と代入先の型は、同じにしましょう。そう覚えておくとミスを減らせます。

```go
func main() {
	// 変数 err の型を、error インターフェイスではなく、MyError 構造体ポインタに変える
	var err *MyError
	if err = Action2(false); err != nil {
		fmt.Printf("err is %#v.\n", err)
	} else {
		fmt.Println("err is nil.")
	}
}
```

なお、`if` ステートメントのスコープ変数を限定的に使えるのであれば、変数 `err` 宣言を削除して、`if err := Action2(false); err != nil {` に書き換えることでも正しく動作します。

### 関数の引数の場合

問3 のように関数の引数でインターフェイスを使う場合、「型アサーション」「リフレクション」「Typed-nil 判定」のうちいずれか一つと nil 判定を組み合わせて、問題の発生を回避します。

#### (1) 型アサーション

A Tour of Go にも載っている「型アサーション」と組み合わせる正統派な方法です。ただし、引数になりうる全ての構造体を知っている必要があります。また、場合によっては別パッケージとの依存関係を作るデメリットもあります。

```go
func Action3(err error) {
	// err を MyError 構造体ポインタであるとアサーションしてから nil 判定する
	myErr, isMyError := err.(*MyError)
	if isMyError && myErr != nil {
		fmt.Printf("err is %#v.\n", myErr)
	} else {
		fmt.Println("err is nil.")
	}
}
```

ちなみに、型アサーションの一種である「Type switches」を使いたい場合は、次のようにします。ただし、これは型判定のみのため、`case` ステートメント毎に、値の nil 判定処理をしなければいけません。コーディングコストを考えると、前述の `if` ステートメントで判定する方法を用いるべきでしょう。

```go
func Action3(err error) {
	switch myErr := err.(type) {
	case *MyError:
		// 型は MyError 構造体ポインタと断定できるが、値については nil 判定処理が必要
		if myErr != nil {
			fmt.Printf("err is %#v.\n", myErr)
			return
		}
	}
	fmt.Println("err is nil.")
}
```

#### (2) リフレクション

リフレクションと組み合わせる万能な方法です。シンプルで、reflect パッケージ以外の依存関係も増やしません。しかし、リフレクションを使いたくない人には、デメリットでしょう。

```go
func Action3(err error) {
	// err が、完全な nil ではない、かつ、Typed-nil ではないことを条件にする
	if err != nil && !reflect.ValueOf(err).IsNil() {
		fmt.Printf("err is %#v.\n", err)
	} else {
		fmt.Println("err is nil.")
	}
}
```

#### (3) Typed-nil 判定

インターフェイスの比較処理を逆手に取った非推奨な方法です。これは、型アサーションの完全下位互換となるアプローチになります。前述の方法と比較して、未知の構造体で正しく判定できないデメリットがあるため、利用は控えた方がよいでしょう。

```go
func Action3(err error) {
	// err が、完全な nil ではない、かつ、MyError 構造体ポインタの nil と一致しないことを条件とする
	if err != nil && err != (*MyError)(nil) {
		fmt.Printf("err is %#v.\n", err)
	} else {
		fmt.Println("err is nil.")
	}
}
```

## おわりに

インターフェイスの nil 判定に関する仕様は、デベロッパーフレンドリーとは言えません。これを知った方の中には、型や値の詳細確認はリフレクションの役割で、nil 判定は型を無視して値が nil であれば true で良いのでは？と、考えた人も少なからずいるかと思います。
とはいえ、言語の根本仕様の変更は今更しないでしょうから（Go が v2 になる時は一縷の望みに縋っても良さそうですが）、そういうものだと覚えるしかなさそうです。

### 参考文献

#### Tour of Go

- [Type assertions](https://go-tour-jp.appspot.com/methods/15)
- [Type switches](https://go-tour-jp.appspot.com/methods/16)

#### interface の実装と判定処理

- [go/src/runtime/runtime2.go](https://github.com/golang/go/blob/go1.23.3/src/runtime/runtime2.go)
- [go/src/runtime/alg.go](https://github.com/golang/go/blob/go1.23.3/src/runtime/alg.go)

#### interface の仕様説明

- [Chapter II: Interfaces](https://github.com/teh-cmc/go-internals/blob/master/chapter2_interfaces/README.md)
- [GoのInterfaceについて](https://qiita.com/Akatsuki_py/items/e53a4c15513711570469)

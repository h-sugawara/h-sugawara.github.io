---
title: Go 1.26 組み込みnew関数改良等のアップデート解説
date: 2026-03-23 09:00:00
updated: 2026-03-23 09:00:00
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

Go 1.26 のアップデートから、組み込み new 関数の改良を始め、いくつかトピックをピックアップしてサンプルコード付きで解説します。

<!-- more -->

## はじめに

冬のメジャーリリースである Go 1.26 が、2026年2月10日（現地時間）にリリースされました。
この記事では、Go のリリースノートからピックアップしたアップデートを、「言語に対する変更」「ツール」「ランタイム・コンパイラ」「標準ライブラリ」のセクションにカテゴライズして解説します。

## ピックアップ解説

### 言語に対する変更

#### 組み込み new 関数の改良

組み込み関数である new の引数に、変数の初期化式を指定できるようになりました。これは、任意の値をポインタで表現するようなパッケージ（`encoding/json` 等）を利用する場合、便利になる機能です。
どのように便利になったかと言うと、Go 1.25 までは、以下のサンプルコードのように、ジェネリクスを活用したヘルパー関数を用意（ジェネリクスのない Go 1.17 以前や、それを引き継いでいるコードでは、一時的な変数に割り当てる方法を使っているかと思います）して、苦心してポインタ化していました。

```go
type Person struct {
	Name string `json:"name"`
	Age  *int   `json:"age"`
}

func main() {
	ret, _ := MakeJson("喫茶ステラと死神の蝶", "2019-12-20T00:00:00+09:00")
	// 「{"name":"喫茶ステラと死神の蝶","age":6}」と表示される
	fmt.Printf("%s\n", ret)
}

func MakeJson(name string, born string) ([]byte, error) {
	t, err := time.Parse(time.RFC3339, born)
	if err != nil {
		return nil, err
	}
	return json.Marshal(&Person{
		Name: name,
		Age:  ToPointer(int(TimeNow().Sub(t).Hours() / (365.25 * 24))),
	})
}

// 注：Go Playgorundでは、time.Now 関数の戻り値が固定のため、疑似関数を定義
func TimeNow() time.Time {
	t, _ := time.Parse(time.RFC3339, "2026-03-23T09:00:00+09:00")
	return t
}

// ポインタ化ヘルパー関数
func ToPointer[T any](v T) *T {
  return &v
}
```

これが Go 1.26 以降になると、次のように組み込みの new 関数の引数に変数の初期化式を渡すだけで完結するようになります。

```go
// 注：前述のコードの中で書き換え対象となる MakeJson 関数のみ抜粋
func MakeJson(name string, born string) ([]byte, error) {
	t, err := time.Parse(time.RFC3339, born)
	if err != nil {
		return nil, err
	}
	return json.Marshal(&Person{
		Name: name,
		// new 関数自体が、前述のポインタ化ヘルパー関数と似た役割をしてくれる
		Age:  new(int(TimeNow().Sub(t).Hours() / (365.25 * 24))),
	})
}
```

ポインタを生成する役割を持っていながら、型に対応しているにも関わらず、値や式には非対応であるという、組み込み new 関数が抱えていた不便さを解消する優れたアップデートです。

### ツール

#### go mod init が採用する go バージョンの変更

`go mod init` コマンドは、go.mod ファイルを作成する時に設定する go バージョンを、一つ前に正式リリースされたマイナーバージョンをデフォルトで採用するようになりました。
すなわち、バージョンが 1.N.X のツールチェインを使用した `go mod init` コマンドが生成する go.mod ファイルの go バージョンは、1.(N-1).0 となるルールです。ただし、プレリリースバージョンに限り、1.(N-2).0 となります。以上を踏まえて、採用される go バージョンを具体的に述べると、Go 1.26 RC であれば 1.24.0 となり、Go 1.26.0 であれば 1.25.0 となります。

#### go fix の改修

`go fix` コマンドは、`golang.org/x/tools/go/analysis` の解析フレームワークを採用するようになり、`go vet` コマンドと同じアナライザを修正の提案や適用に使えるようになりました。
コマンドが従来持っていた修正機能は全て廃止され、言語やライブラリの古い構文を、新しい構文に自動で置き換える機能に生まれ変わりました。

### ランタイム・コンパイラ

#### 新しいガベージコレクタの正式導入

Go 1.25 で試験導入されていた新しいガベージコレクタ「Green Tea garbage collector」が、Go 1.26 で正式導入され、デフォルトで有効になりました。これは、従来のガベージコレクタと比べて、その処理のオーバーヘッドが 10% から 40% 程度削減される見込みです。また、AMD64 ベースの新しい CPU（Intel Ice Lake または AMD Zen 4 以降）で実行すると、ベクター命令を活用するようになったため、オーバーヘッドがさらに 10% 程度改善することが期待されます。
なお、ビルド時に `GOEXPERIMENT=nogreenteagc` を指定すると、無効化できます（このオプトアウト機能は、Go 1.27 で削除される予定）。

#### メモリ割り当ての高速化

コンパイラは、サイズ特化型メモリ割り当てルーチンの呼び出しを生成するようになりました。512バイト未満の一部のメモリ割り当てのコストが、最大で 30% 削減されます。メモリ割り当てを多用する実際のプログラムでは、全体的に見ると、およそ 1% 程度の改善が見込まれます。
ビルド時に `GOEXPERIMENT=nosizespecializedmalloc` を指定すると、無効化できます（Green Tea GC と同様に、この無効化機能は、Go 1.27 で削除予定）。

#### Goroutine リーク検知の試験導入

リークした Goroutine を報告する新しいプロファイルタイプが、試験的に利用可能になりました。
ビルド時に、`GOEXPERIMENT=goroutineleakprofile` を設定すると、`runtime/pprof` パッケージ内の `goroutineleak` という新しいプロファイルタイプを有効にできます。また、プロファイルを有効にした場合、`net/http/pprof` パッケージの `/debug/pprof/goroutineleak` エンドポイントにて利用できます。
以下の正しく受信しない channel を用いたコードは、リーク報告プロファイルの検知対象です。

```go
//GOEXPERIMENT=goroutineleakprofile

package main

import (
	"fmt"
	"runtime/pprof"
	"slices"
	"strings"
	"time"
)

func main() {
	GetLeakProfile(Receiver, make(chan int))
}

func Receiver(c chan int) {
	go func() {
		// 誰も channel に値を送信しないため、受信を待つ Goroutine が生き続ける
		fmt.Println(<-c)
	}()
}

func GetLeakProfile(receiver func(c chan int), c chan int) {
	prof := pprof.Lookup("goroutineleak")
	defer func() {
		time.Sleep(2 * time.Second)
		var content strings.Builder
		prof.WriteTo(&content, 2)
		for leak := range slices.Values(strings.Split(content.String(), "\n\n")) {
			if strings.Contains(leak, "(leaked)") {
				fmt.Println(leak + "\n")
			}
		}
	}()

	receiver(c)
}
```

これを実行すると、次のように Goroutine がリークしていることを示す結果が出力されます。

```text
goroutine 7 [chan receive (leaked)]:
main.Receiver.func1()
	/tmp/sandbox2767478256/prog.go:20 +0x25
created by main.Receiver in goroutine 1
	/tmp/sandbox2767478256/prog.go:18 +0x59
```

しかし、どのような場合でも検知できるのではなく、グローバル変数や実行可能な Goroutine 内ローカル変数を通じて、到達可能な同時実行プリミティブ（`channel`、`sync.WaitGroup` 等）上での操作がブロックされることで発生するリークは、漏れてしまう可能性があることに注意が必要です。

### 標準ライブラリ

#### RFC 9180 対応パッケージ追加

RFC 9180 で定義された「Hybrid Public Key Encryption (HPKE)」が、`crypto/hpke` パッケージとして実装されました。以下のように、公開鍵と対称鍵を組み合わせて暗号化したデータをやりとりするためのパッケージです（注：分かりやすくするために、同じコード内で処理しています）。

```go
func main() {
	// 受信者：両者間で共通のKEM、KDF、AEAD、infoを生成
	kem, kdf, aead := hpke.MLKEM768X25519(), hpke.HKDFSHA256(), hpke.AES256GCM()
	info := []byte("YUZUSOFT")

	// 受信者：自身の対称鍵と公開鍵を生成
	privateKey, _ := kem.GenerateKey()
	publicKey := privateKey.PublicKey().Bytes()

	// 送信者：受信者の公開鍵を使って暗号化
	ciphertext := Sender(publicKey, kem, kdf, aead, info)

	// 受信者：自身の対称鍵を使って復号
	// 「Decrypted message: 天使☆騒々 RE-BOOT!」と表示される
	plaintext, _ := hpke.Open(privateKey, kdf, aead, info, ciphertext)
	fmt.Printf("Decrypted message: %s\n", plaintext)
}

func Sender(publicKeyBytes []byte, kem hpke.KEM, kdf hpke.KDF, aead hpke.AEAD, info []byte) (ciphertext []byte) {
	publicKey, _ := kem.NewPublicKey(publicKeyBytes)
	message := []byte("天使☆騒々 RE-BOOT!")
	ciphertext, _ = hpke.Seal(publicKey, kdf, aead, info, message)
	return
}
```

#### io.ReadAll のパフォーマンス改善

`io.ReadAll` は、中間メモリ割り当て削減と、戻り値スライスのサイズ最小化が実施されました。このアップデートにより、メモリ割り当て総量がおよそ半分になり、処理速度が約２倍に向上します。

#### errors.AsType 追加

`errors.As` 関数のジェネリクス版である `errors.AsType` 関数が追加され、今までは一時的な変数を用意する必要がありましたが、戻り値に含まれるようになったため、シンプルに書けるようになりました。

```go
func main() {
	if _, err := os.Open("nonExistentFile"); err != nil {
		// Go 1.25 まで
		if pathError := new(fs.PathError); errors.As(err, &pathError) {
			fmt.Println(pathError.Error())
		}

		// Go 1.26 以降
		if pathError, ok := errors.AsType[*fs.PathError](err); ok {
			fmt.Println(pathError.Error())
		}
	}
}
```

## おわりに

Go 1.26 では、目新しい機能の追加はありませんでしたが、新しいガベージコレクタの正式導入やメモリ割り当て高速化等のパフォーマンス改善や、`go fix` コマンドのリプレイスや Goroutine リーク検知等の利便性向上のアップデートが目白押しとなりました。
より一層使いやすく、軽く、そして、速くなった Go を使って、プロジェクトやプロダクトにおける保守性や生産性を向上させていきましょう。

### 参考文献

#### Documents

- [Go 1.26 Release Notes](https://tip.golang.org/doc/go1.26)
- [The Green Tea Garbage Collector](https://go.dev/blog/greenteagc)

#### GitHub Issues

- [spec: expression to create pointer to simple types](https://github.com/golang/go/issues/45624)
- [runtime: green tea garbage collector](https://github.com/golang/go/issues/73581)
- [proposal: runtime/pprof,runtime: new goroutine leak profile](https://github.com/golang/go/issues/74609)
- [cmd/go: fix: apply fixes from modernizers, inline, and other analyzers](https://github.com/golang/go/issues/71859)

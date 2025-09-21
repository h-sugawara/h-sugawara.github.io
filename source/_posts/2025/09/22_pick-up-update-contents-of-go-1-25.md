---
title: Go 1.25 testing/synctest追加等のアップデート解説
date: 2025-09-22 09:00:00
updated: 2025-09-22 09:00:00
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

Go 1.25 のアップデートから、testing/synctest パッケージ追加を始め、いくつかトピックをピックアップしてサンプルコード付きで解説します。

<!-- more -->

## はじめに

夏のメジャーリリースである Go 1.25 が、2025年8月13日（現地時間）にリリースされました。
この記事では、Go のリリースノートからピックアップしたアップデートを、「ツール」「ランタイム・コンパイラ」「標準ライブラリ」の三つの大きなセクションにカテゴライズして解説します。

## ピックアップ解説

### ツール

#### Build コマンドのメモリリーク検出

Build コマンドの asan オプションは、プログラム終了時にメモリリークを検出し、エラーとして報告するようになりました。報告対象は、C 言語で割り当てられたメモリが未解放の場合と、C 言語や Go で割り当てられたメモリが他からも参照されていない場合の２つです。
この挙動は、環境変数に `ASAN_OPTIONS=detect_leaks=0` を設定することで無効にできます。 

#### ビルド済みツールバイナリの削減

Go の配布物に含まれるビルド済みツールバイナリから、コンパイラやリンカなどのコアツールチェイン以外が削減されました。削減されたツールは、必要な時にビルドされ、実行できるようになります。

#### go.mod に ignore ディレクティブ追加

go.mod に、go コマンドで除外対象となるディレクトリを指定する `ignore` ディレクティブが追加されました。このディレクティブを指定すると、除外したいディレクトリが、all や `./...` のようなパッケージパターンに含まれる場合でも、go コマンドの対象から取り除けます。ただし、モジュールの zip ファイルには引き続き含まれます。

#### Vet コマンドでの解析対象追加

Vet コマンドに、`sync.WaitGroup.Add` の呼び出し処理と `net.Dial` のアドレス生成処理の解析が追加され、誤った使用方法を検知できるようになりました。

### ランタイム・コンパイラ

#### nil ポインタの処理に対する挙動修正

Go 1.21 から Go 1.24 までのバージョンでは、ポインタとエラーを返す関数や、値がポインタとなるマップで、エラーチェックをする前にポインタに対する処理が失敗する場合でも、正常に動作していました（注：ただし、ポインタに対する処理の結果を、別の関数等に渡して実行すると Panic します）。
この挙動は、コンパイラの不具合であったため、Go 1.25 では、nil ポインタに対する処理をした時点で Panic するように修正されました。

```go
func main() {
	fp, err := os.Open("nonExistentFile")
	// Go 1.21 から Go 1.24 までのバージョンだと Panic しないが、Go 1.25 ではここで Panic する。
	name := fp.Name()
	// Go 1.25 以前でも、下行のように別の関数に取得した値を渡すと Panic する
	// fmt.Println(name)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(name)
}
```

不具合のあるバージョンを採用したプロジェクトでは、対象となる関数やマップの直後にエラーチェックをしているかを、念のため確認して、該当箇所があれば修正しておくと良いでしょう。

#### 多重同一 Panic 発生時の文言形式変更

Panic を回復し、そのまま再び Panic させてプログラムを終了した場合に、出力される文言が重複して表示されないように変更されました。発生条件が分かりにくいかと思いますので、疑似的に同じ状態を作り出すコードを書くと、次のようになります。

```go
func main() {
	defer func() {
		if err := recover(); err != nil {
			panic(err)
		}
	}()
	Panicked()
}

func Panicked() {
	panic("panicked")
}
```

このコードを実行すると、Go 1.24 までは次のような形式で文言を出力します。

```text
panic: panicked [recovered]
	panic: panicked
```

Go 1.25 で実行した場合は、次のように１行にまとめて出力されるようになります。

```text
panic: panicked [recovered, repanicked]
```

なお、元の Panic の内容を Recover から取得して引き継がなくても、その内容の型及び値と完全一致するのであれば、２つ目の Panic に改めて指定することで、同じ出力結果を得られます。

#### GOMAXPROCS 初期値設定の動作変更

`GOMAXPROCS` の初期値設定の動作が変更されました。
Go 1.24 までは、利用可能な論理 CPU 数 `runtime.NumCPU` を、起動時にのみ設定していました。Go 1.25 では、利用可能な論理 CPU 数と、cgroup の CPU 帯域幅制限の両方を考慮して設定され、それらが変更されると定期的に更新します。また、Linux に限り、cgroup の CPU 帯域幅制限が、利用可能な論理 CPU 数よりも低ければ、そちらを優先して設定します。
なお、これらの動作は、環境変数 `GOMAXPROCS`、または、`runtime.GOMAXPROCS` の呼び出しによって手動で設定するか、`containermaxprocs=0` と `updatemaxprocs=0` を `GODEBUG` 設定に指定するか、いずれかを行うと無効化されます。
また、cgroup の CPU 帯域幅制限の更新内容を読み取れるようにするために、プロセスが生きている期間中は、cgroup ファイルのファイルディスクリプタをキャッシュするようになりました。

#### コンパイラのパフォーマンス改善

より多くの状況で、スタック上にあるスライスのために、バッキングストアを割り当てられるようになり、コンパイラのパフォーマンスが改善しました。しかし、`unsafe.Pointer` の不適切な使い方をしている場合は、この変更が大きな影響を及ぼす可能性があります。
問題がある場合は、`bisect` ツールで `-compile=variablemake` フラグを使用すると、原因を特定できます。また、`-gcflags=all=-d=variablemakehash=n` を使用すれば、この挙動を無効にできます。

#### 新しいガベージコレクタの試験導入

マークアルゴリズムの局所性及び CPU スケーラビリティの効率改善を目的に、新しく設計されたガベージコレクタが、試験的に導入されました。ガベージコレクタを多用するプログラムでは、その処理にかかるオーバーヘッドが、10% から 40% 程度削減される見込みです。
新しいガベージコレクタは、ビルド時に `GOEXPERIMENT=greenteagc` を設定することで有効にできます。

### 標準ライブラリ

#### 並行処理テスト向けパッケージ追加

Go 1.24 で実験的に導入されていた、並行処理テスト向けの `testing/synctest` パッケージが、Go 1.25 で正式に追加されました。
`synctest.Test` 関数が、隔離された「バブル」内に疑似的な時間を作り出すことで、`time.Sleep` 関数や Goroutine 等の実際に時間を要する処理を、即座に、確実に、そして簡単に実行できます。このパッケージの登場で、関数を変数定義しておき、単体テスト時にテスト用に振る舞う関数に偽装する、といったトリッキーな方法を使う必要がなくなりました。

```go
func RetryableHttpGet(url string, maxRetries int) (*http.Response, error) {
	rand.Seed(time.Now().UnixNano())
	for retries := 1; ; retries++ {
		res, err := http.Get(url)
		if err == nil {
			return res, nil
		}
		if retries >= maxRetries {
			return nil, fmt.Errorf("Retryable %d count is used up.", maxRetries)
		}
		// 指数バックオフ時間分、次の処理を待機する
		waitTime := time.Duration(math.Pow(2.0, float64(retries-1))) * time.Second
		time.Sleep(waitTime)
	}
}

func TestRetryableHttpGet(t *testing.T) {
	maxRetries := 10
	synctest.Test(t, func(t *testing.T) {
		// リクエスト成功、または、最大リトライ回数分まで、HTTP リクエストを試行する
		_, err := RetryableHttpGet("http://localhost:8080/", maxRetries)
		synctest.Wait()
		if err != nil {
			t.Errorf("RetryableHttpGet: %v\n", err)
		}
	})
}
```

何も準備をしていない状態で、上記のサンプルコードを実行すると、maxRetries 回数分のリトライ処理は、指数バックオフによる待機時間を待たずに、即座に終了します。

```shell
=== RUN   TestRetryableHttpGet
    prog_test.go:36: RetryableHttpGet: Retryable 10 count is used up.
--- FAIL: TestRetryableHttpGet (0.00s)
FAIL
```

#### sync.WaitGroup 型に Go 関数追加

並行処理のグループ化が簡単にできるように、`sync.WaitGroup` 型に `Go` 関数が追加されました。
Go 1.24 までは、WaitGroup のカウンターを意識して、次のようにコーディングしなければいけませんでした。そのため、並行処理を制御できる `sync.WaitGroup` 型は、とても優秀であったにも関わらず、初心者には理解が難しく、お断りな機能の一つでした。

```go
func main() {
	var wg sync.WaitGroup
	var titles = []string{
		"天色＊アイルノーツ",
		"サノバウィッチ",
		"千恋＊万花",
		"RIDDLE JOKER",
	}
	for _, title := range titles {
		// WaitGroup のカウンターをインクリメント
		wg.Add(1)
		go func() {
			// WaitGroup のカウンターをデクリメント
			defer wg.Done()
			fmt.Println(title)
		}()
	}
	wg.Wait()
}
```

Go 1.25 からは、`sync.WaitGroup` 型に `Go` 関数を使うと、WaitGroup のカウンターを意識せずに、シンプルにコーディングできるようになります。

```go
func main() {
	var wg sync.WaitGroup
	var titles = []string{
		"天色＊アイルノーツ",
		"サノバウィッチ",
		"千恋＊万花",
		"RIDDLE JOKER",
	}
	for _, title := range titles {
		// WaitGroup のカウンター操作は、Go 関数が責任を持つ
		wg.Go(func() {
			fmt.Println(title)
		})
	}
	wg.Wait()
}
```

#### os.Root 型の関数追加

制限付きファイルシステム操作（`os.Root` 型）に、os パッケージでも使用できる８つの関数（`Chmod`、`Chown`、`Chtimes`、`Lchown`、`Link`、`Readlink`、`Rename`、`Symlink`）が追加されました。

## おわりに

Go 1.25 では、`testing/synctest` パッケージの正式導入を始め、`sync.WaitGroup` 型への `Go` 関数追加や `GOMAXPROCS` の初期値設定動作の変更など、並行処理に関わるアップデートが多く実施され、コンパイラやガベージコレクタもパフォーマンス改善が施されました。これらによって洗練された Go を使って、プロジェクトやプロダクトで、小さいコストで大きいリターンを得られるようにしていきましょう。

### 参考文献

#### Documents

- [Go 1.25 Release Notes](https://tip.golang.org/doc/go1.25)
- [synctest package - testing/synctest](https://tip.golang.org/pkg/testing/synctest)
- [sync package - sync](https://tip.golang.org/pkg/sync#WaitGroup.Go)

#### GitHub Issues

- [runtime: green tea garbage collector](https://github.com/golang/go/issues/73581)
- [cmd/compile: nilcheck is tightened in a branch allowing the other one to execute when it should have panicked](https://github.com/golang/go/issues/72860)
- [x/sys/windows: some syscalls are creating dangling pointers](https://github.com/golang/go/issues/73199)

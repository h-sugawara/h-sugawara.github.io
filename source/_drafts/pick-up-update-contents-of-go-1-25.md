---
title: Go 1.25 sync.WaitGroup.Go追加等のアップデート解説
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
thumbnail: /images/thumbnails/golang_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

Go 1.25 のアップデートから、sync.WaitGroup 型への Go 関数の追加を始め、いくつかトピックをピックアップしてサンプルコード付きで解説します。

<!-- more -->

## はじめに

夏のメジャーリリースである Go 1.25 が、2025年8月XX日（現地時間）にリリースされました。
この記事では、Go のリリースノートからピックアップしたアップデートを、「言語に対する変更」「ツール」「ランタイム・コンパイラ」「標準ライブラリ」の四つの大きなセクションにカテゴライズして、一部サンプルコード付きで解説します。

## ピックアップ解説

### 言語に対する変更



### ツール



### ランタイム・コンパイラ

#### エラーとなるファイルを開いた時の挙動修正

Go 1.21 から Go 1.24 までのバージョンでは、以下のサンプルコードのように、エラーとなるファイルに対して `os.Open` を実行し、エラーチェックをせずにファイルポインタを使用する処理が、正常に動作するようになっていました。この挙動は、Go の言語仕様に違反した状態であり、コンパイラの不具合であるため、Go 1.25 で Panic するように修正されました。
Go 初心者プログラマが参画中で、不具合のあるバージョンを採用したファイル操作処理を持つプロジェクトでは、`os.Open` の直後にエラーチェックをしているかを、念のため確認しておくと良いでしょう。

```go
import "os"

func main() {
	f, err := os.Open("nonExistentFile")
	// Go 1.21 から Go 1.24 までのバージョンだと、Panic しない
	name := f.Name()
	if err != nil {
		return
	}
	println(name)
}
```

ちなみに、Go 1.24 にて追加された、制限付きファイルシステム操作（`os.Root` 型）で、該当の不具合が発生するかどうかを試したところ、こちらは問題なさそうでした。

#### 多重同一 Panic 発生時の文言形式変更

Panic が発生した後に回復し、その内容のままで再び Panic させて、プログラムを終了した場合に、出力される文言が重複して表示されないように変更されました。この文章を読んでも、発生条件が分かりにくいかと思いますので、疑似的に同じ状態を作り出すコードを書くと、次のようになります。

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

Go 1.24 までは、プログラム終了時に、次のような形式で文言を出力していました。

```text
panic: panicked [recovered]
	panic: panicked
```

Go 1.25 では、次のように１行にまとめて出力されるようになります。

```text
panic: panicked [recovered, repanicked]
```

なお、元の Panic の内容を Recover から取得して引き継がなくても、その内容の型及び値と完全一致するのであれば、２つ目の Panic に改めて指定することで、同じ出力結果を得られます。

```go
func main() {
	defer func() {
		if err := recover(); err != nil {
			// 型と値が完全一致であれば、同じ出力結果が得られる
			panic("panicked")
		}
	}()
	Panicked()
}

func Panicked() {
	panic("panicked")
}
```

### 標準ライブラリ

#### sync.WaitGroup 型に Go 関数追加

簡単に平行処理のグループ化ができるように、`sync.WaitGroup` 型に `Go` 関数が追加されました。
Go 1.24 までは、WaitGroup のカウンターを意識して、次のようにコーディングする必要がありました。そのため、並行処理を制御できる `sync.WaitGroup` 型は、とても優秀であったにも関わらず、初心者にはお断りな機能の一つでした。

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

os パッケージで使用できる以下の関数が、制限付きファイルシステム操作（`os.Root` 型）でもサポートされました。

- `Chmod`
- `Chown`
- `Chtimes`
- `Lchown`
- `Link`
- `Readlink`
- `Rename`
- `Symlink`

## おわりに



### 参考文献



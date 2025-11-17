---
title: 洗練された高品質なHTTPクライアントをGoで実装しよう
date: 2025-12-22 09:00:00
updated: 2025-12-22 09:00:00
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
thumbnail: /images/thumbnails/technology/golang_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

HTTP リクエストとレスポンスを行うクライアントを、ワンランク上の高品質な実装にするための注意点や方法を、サンプルコード付きでご紹介します。

<!-- more -->

{% message color:info %}
この記事は、[mediba Advent Calendar 2025](https://qiita.com/advent-calendar/2025/mediba) と [Go Advent Calendar 2025](https://qiita.com/advent-calendar/2025/go) の23日目にエントリーしています。
{% endmessage %}

## はじめに

### 目的・ゴール

この記事を読み終わった後に、Go でワンランク上の HTTP リクエストとレスポンスの処理を行うクライアントの実装ができるようになっていること。

### 読者ターゲット

HTTP のリクエストやレスポンスのハンドリングを行う、より実戦的でハイグレードなクライアントを、Go を使って実装したい人。

## ワンランク上を目指すために

HTTP クライアントでワンランク上の実装を目指すためには、次の３点について注意が必要です。

1. ファイルディスクリプタの枯渇
2. コネクションのキープアライブ
3. エラー受信時の再送待ち時間

以降のセクションでは、これら３つの項目について詳しく説明していきます。

### ファイルディスクリプタの枯渇

長期間に渡って実行される中で沢山の HTTP リクエストを送信する（例えば、API 等）、または、一度の実行で HTTP リクエストを大規模に送信する（例えば、バッチ等）場合は、アプリケーションを起動している OS のファイルディスクリプタが枯渇しないように、実装しなければなりません。

#### ファイルディスクリプタ

ファイルディスクリプタ（file descriptor）とは、プログラムと OS カーネルの間でファイルに対する処理をやり取りするために用いられる、通常は整数値の識別子です。プログラムからは、ファイルシステムを OS が管理している都合上、ファイルの読み書きを直接行えず、OS カーネルへ処理を依頼するために使われます。この値には上限が存在し、それを超える数のファイルを同時に開けません。

#### 枯渇の発生メカニズム

http package 内部では、`Transport` 構造体の `dialConn` 関数で、`persistConn` 構造体の初期化処理で TCP コネクションを作成（ファイルディスクリプタを１つ使用）し、この構造体の `readLoop` 関数及び `writeLoop` 関数を非同期で実行することで、レスポンスを受信します。これらのうち `readLoop` 関数が曲者で、レスポンスボディを、読み終えるか、キャンセル・終了するか、いずれかをするまで待ち続けて、それらのイベントをトリガーに、コネクションとファイルディスクリプタを解放する仕組みです。
よって、クライアントがレスポンスボディに対して何もしなかった場合は、コネクションがそのまま維持されます。すなわち、コネクションに割り当てられたファイルディスクリプタは、消費されたままということです。この状況が継続されると、利用可能なファイルディスクリプタが徐々に減っていき、最後には枯渇します。そうなると、TCP コネクションを新しく作成できなくなります。

#### 正しく取り扱う方法

ファイルディスクリプタを正しく取り扱う方法は、とても簡単です。正常時に受け取ったレスポンスボディの `Close` 関数を、`defer` によって必ず呼び出されるようにします。これは、レスポンスボディの中身を、実際に他の箇所で使っているかどうかは、全く関係がありません。なお、リクエスト時にエラーが発生した場合には、レスポンスボディが自動で閉じられるため、クライアント側で何かする必要はありません。この２点を考慮して、対策したコードを書くと、次のようになります。

```go
func Get(url string) ([]byte, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	// エラーではない限り、レスポンスボディを使うかどうかに関わらず、「必ず」閉じる
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	return body, nil
}
```

ちなみに、Go 公式サイトにある http package ドキュメントの概要には、ファイルディスクリプタの枯渇については具体的な内容に言及していませんが、下記の一文でしっかり記載されています。

> The caller must close the response body when finished with it:
> （呼び出し元は、使い終わったときにレスポンスボディを閉じる必要があります。※注）
>
> 出典：[http package - net/http - Go Packages](https://pkg.go.dev/net/http#pkg-overview)（※注：記事筆者による翻訳）

### コネクションのキープアライブ

HTTP/1.0 及び HTTP/1.1 のプロトコルを利用している場合に限り、TCP コネクションをキープアライブするために、やらなければいけないことがあります。

#### キープアライブの条件

コネクションのキープアライブは、http package で実装されている `persistConn` 構造体の `readLoop` 関数にて、条件その１または条件その２のいずれかを満たすかどうかで決めています。

##### 条件その１

HEAD メソッドでリクエストを送信した場合、または、受信したレスポンスの ContentLength が 0 と等しい場合。

##### 条件その２

条件その１に該当しない場合。すなわち、HEAD メソッド以外でリクエストを送信し、受信したレスポンスの ContentLength が 0 より大きい時。この場合は、下記の**全ての要件を満たす**必要があります。

1. 受信レスポンスが、Close **されていない**こと
2. 受信レスポンスのステータスコードが、100 番台**ではない**こと
3. 受信レスポンスが、書き込み**できない**状態であること
4. 受信レスポンスのボディが、全て読み取られた状態で Close されていること

#### レスポンスボディが不要な場合

おそらく、HEAD メソッド以外でリクエストして、返ってきたレスポンスの ContentLength が 0 より大きいことが一般的でしょう。そのため、前述した「ファイルディスクリプタの枯渇」セクションの「正しく取り扱う方法」と同様の実装を行えば、キープアライブも一括で対応できます。
しかしながら、返ってきたレスポンスボディが、不要なことも少なからずあります。そのような場合は、次のようにレスポンスボディを、`io.Discard` に書き込んで破棄します。ただし、残念なことに、レスポンスボディは `WriterTo` 関数を、`io.Discard` は `ReadFrom` 関数を実装していないため、場合によって低いパフォーマンスとなりうることを留意しなければなりません。

```go
func Post(url string, body io.Reader) error {
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return err
	}
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	// io.Discard に書き込んで、レスポンスボディを全て読み取る
	if _, err := io.Copy(io.Discard, res.Body); err != nil {
	  return err
	}
	return nil
}
```

### エラー受信時の再送待ち時間

クライアントが、サーバーからエラーレスポンスが返却された時に、一定間隔でリクエストを再送するような実装にしていた場合、サーバー障害発生時に無駄なリクエストが発生して更に負荷をかけることになり、障害の深刻化や長期化の一因となる可能性があります。

#### Exponential Backoff

サーバーへのリクエストに失敗する度に、次回再送までの待機時間を指数関数的に増やしていくアプローチを、「Exponential Backoff」と呼びます。これは、サーバーに対して過負荷をかけることを避け、連続して失敗する確率を最小化する効果を得るために採用する、エラー処理戦略です。

#### 実装する方法

リクエスト失敗が、初回であれば１秒、２回目であれば２秒、３回目であれば４秒と、２のｎ乗（ｎは、リトライ回数から１を引いた値）秒数の間スリープさせることで、次のリクエストまでの待機時間を作り出します。`moth.Pow` 関数を用いて実装すると次のようになります。なお、２を左ビットシフト演算することでも同じような実装にできますが、ｎ＝０となる時の秒数を別途計算する必要があります。

```go
func Post(url string, body io.Reader, maxRetries int) (*http.Response, error) {
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return err
	}
	client := &http.Client{}
	for retries := 1; ; retries++ {
		res, err := client.Do(req)
		if err == nil {
			return res, nil
		}
		if retries >= maxRetries {
			return nil, err
		}
		// 2 の retries-1 乗秒の間、スリープして待機する
		waitTime := time.Duration(math.Pow(2.0, float64(retries-1))) * time.Second
		time.Sleep(waitTime)
	}
	return nil, nil
}
```

## HTTP クライアントの実装例

サーバーに負荷をかけないようにリクエストを再送する機能を持ち、ファイルディスクリプタが枯渇しないように対策しつつ、TCP コネクションをキープアライブできるように実装した HTTP クライアントは、次のようになります。

{% message color:warning %}
このセクションの実装例は、そのまま本番環境に利用せず、プロダクトに適したソースコードにリファクタすることをオススメします。
{% endmessage %}

```go
type MyClient struct {
	client     *http.Client
	maxRetries int
}

func NewMyClient(maxRetries, timeout int) *MyClient {
	return &MyClient{
		client: &http.Client{
			Transport: http.DefaultTransport.Clone(),
			timeout: timeout * time.Second,
		},
		maxRetries: maxRetries,
	}
}

func (c *MyClient) SendRequest(ctx context.Context, method, url string, body io.Reader) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return err
	}
	// サーバーに負荷をかけないリクエスト再送機能
	res, err := c.retryDo(req)
	if err != nil {
		return nil, err
	}
	// ファイルディスクリプタが枯渇しないようにする
	defer res.Body.Close()
	// コネクションがキープアライブできるようにする
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return body, nil
}

func (c *MyClient) retryDo(req *http.NewRequest) (res *http.Response, err error) {
	for retries := 1; ; retries++ {
		res, err = c.client.Do(req)
		if err == nil {
			break
		}
		if retries >= c.maxRetries {
			return nil, err
		}
		time.Sleep(calculateWaitTime(retries))
	}
	return res, nil
}

func (c *MyClient) calculateWaitTime(retryCount int) time.Duration {
	if retryCount == 1 {
		return 1 * time.Second
	}
	return time.Duration(2 << (retryCount - 1) * time.Second)
}
```

## おわりに

Go では HTTP クライアントが簡単に作れてしまう反面、注意や対策が必要なことがいくつかあります。公式ドキュメントでは、それらを明示していますが、理由に言及していないことがほとんどです。そういった背景もあって、対応を忘れることもあるでしょう。この記事が、それらについて意識付けに繋がり、結果としてハイグレードな HTTP クライアントの実装へ貢献できれば幸いです。

### 参考文献

#### 用語解説

- [ファイルディスクリプタ（ファイル記述子）とは](https://e-words.jp/w/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%82%BF.html)

#### Documents

- [http package - net/http](https://pkg.go.dev/net/http)

#### GitHub Issues

- [net/http file descriptor leak when a PUT request fails](https://github.com/golang/go/issues/46267)
- [net/http: too many open files](https://github.com/golang/go/issues/28272)

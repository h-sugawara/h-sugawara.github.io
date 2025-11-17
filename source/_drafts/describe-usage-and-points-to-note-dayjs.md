---
title: Day.jsでタイムゾーン付き日時を操作する方法と注意点
date: 2026-05-18 09:00:00
updated: 2026-05-18 09:00:00
tags:
  - 解説
  - 技術解説
  - npm
  - プログラミング
  - TypeScript
categories:
  - Technology
  - Frontend
toc: true
has_gallery: false
has_code: true
has_icon: false
og_image: /images/technology/programming/title.webp
thumbnail: /images/thumbnails/technology/npm_thumbnail.webp
cover:
  image: /images/technology/programming/cover.webp
  sources:
    small: /images/technology/programming/cover_small.webp
    medium: /images/technology/programming/cover_medium.webp
    large: /images/technology/programming/cover_large.webp
---

日時を操作するライブラリ Day.js の導入方法と基本的な使用方法に加え、タイムゾーンを取り扱う方法とその際に注意すべき事項をご紹介します。

<!-- more -->

## はじめに

### 目的・ゴール

この記事を読み終わった後に、Day.js ライブラリを使った基本操作とタイムゾーンを扱えるようになっていること。

### 読者ターゲット

moment.js の代替ライブラリを探している人や、TypeScript や JavaScript で、タイムゾーンも含めて日時を操作したい人。

## 導入手順と基本的な使い方

### 導入手順

次のコマンドで、dayjs パッケージの最新版を package.json に追加します。

#### npm の場合

```shell
npm install dayjs
```

#### yarn の場合

```shell
yarn add dayjs
```

#### pnpm の場合

```shell
pnpm install dayjs
```

### 基本的な利用方法

{% message color:warning %}
`format` 関数の結果は、環境により書式が異なる可能性があります。このセクション内の全サンプルコードは、UTC がローカルタイムゾーンの前提でご覧ください。
{% endmessage %}

#### 現在日時を取得して表示する

現在日時を取得する時は、`dayjs` 関数を実行します。返り値の `Dayjs` オブジェクトが持っている `format` 関数を実行すると、ISO8601 形式で表示できます。

```typescript
import dayjs from "dayjs";

const now = dayjs();
// 「2026-05-18T00:00:00Z」の形式になる（※現在日時によって内容は変わります）
console.log(now.format());
```

#### 表示形式を変更する

`format` 関数の引数に特定の書式を与えると、任意の形式で日時を表示できます。

```typescript
// 「2026-05-18」の形式になる（※現在日時によって内容は変わります）
console.log(dayjs().format('YYYY-MM-DD'));
```

#### 日時の一部を置き換える

`set` 関数に対し、第１引数に単位（例えば、月を置き換えるなら month、日を置き換えるなら date）、第２引数に変更後の数値を指定すると、日時の一部を置き換えられます。

```typescript
// 日付を「15」に置き換える（「2026-05-15T00:00:00Z」になる）
console.log(dayjs('2026-05-18').set('date', 15).format());
```

#### 日時を加算・減算する

`add` 関数の第１引数に加算する値、第２引数に単位を指定すると、単位に対して数値を加算した日時を取得できます。また、`subtract` 関数を使った場合は、単位に対して数値を減算した日時を取得できます。なお、`add` 関数の第１引数に負数を指定すると、`subtract` 関数と同じ結果を得られます。

```typescript
const now = dayjs('2026-05-18T12:00:00');
// 30日後にする（「2026-06-17T12:00:00Z」になる）
console.log(now.add(30, 'days').format());
// 30日前にする（「2026-04-18T12:00:00Z」になる）
console.log(now.subtract(30, 'days').format());
console.log(now.add(-30, 'days').format());
```

#### 日時を比較する

`isBefore`、`isSame`、`isAfter` の各関数を使うと、`Dayjs` オブジェクトと各関数の引数で時系列比較ができます。それぞれ、`Dayjs` オブジェクトが過去か判定する時は、`isBefore` 関数、同じかどうか判定する時は `isSame` 関数、未来か判定する時は `isAfter` を使用します。

```typescript
const now = dayjs('2026-05-18T09:00:00');
// true
console.log(now.isBefore(dayjs('2026-05-18T12:00:00')));
console.log(now.isSame(dayjs('2026-05-18T09:00:00')));
console.log(now.isAfter(dayjs('2026-05-18T06:00:00')));
// false
console.log(now.isBefore(dayjs('2026-05-18T06:00:00')));
console.log(now.isAfter(dayjs('2026-05-18T12:00:00')));
```

#### 月末や月初の日付を取得する

`endOf` 関数で引数に指定した単位の最大値、`startOf` 関数で引数に指定した単位の最小値を取得できます。例えば、`endOf` 関数の引数に「months」を指定した場合、その月末日の23時59分59秒999が結果として返ってきます。これらの関数の特性を利用すると、月末や月初の日付を簡単に計算できます。

```typescript
const now = dayjs('2026-05-18T09:00:00');
// 当月末日を取得する（「2026-05-31」になる）
console.log(now.endOf('months').format('YYYY-MM-DD'));
// 翌月初日を取得する（「2026-06-01」になる）
console.log(now.startOf('months').add(1, 'months').format('YYYY-MM-DD'));
console.log(now.endOf('months').add(1).format('YYYY-MM-DD'));
```

#### シリアライズする

`Dayjs` オブジェクトに対して、`Date` オブジェクト変換や JSON シリアライズ、タイムスタンプ変換などを行えます。

```typescript
const now = dayjs('2026-05-18T12:23:35.567');
// Date オブジェクトに変換
console.log(now.toDate());
// JSON 用にシリアライズ（「2026-05-18T03:23:35.567Z」になる）
console.log(now.toJSON());
// タイムスタンプに変換（「1779074615」になる）
console.log(now.unix());
// タイムスタンプ（ミリ秒）に変換（「1779074615567」になる）
console.log(now.valueOf());
```

## タイムゾーンの取扱と注意点

### 取り扱い方法

タイムゾーンを取り扱うには、プラグインを有効にした状態で、タイムゾーン付きの日時に対して操作や表示を行う必要があります。

#### プラグインを有効にする

Day.js は、デフォルト状態ではローカルタイムゾーンに影響され、環境に依存しない形でのタイムゾーンの操作ができません。そのため、ライブラリ内蔵のプラグイン `timezone` と `utc` を有効にします。以下は、プラグインを有効にしつつ、`Asia/Tokyo` にタイムゾーンを設定するサンプルコードです。

```typescript
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.tz.setDefault("Asia/Tokyo");
```

#### タイムゾーン付きの日時を操作する

`Asia/Tokyo` にタイムゾーンを設定した場合、`dayjs().tz()` の実行結果は、日本標準時での現在日時になります。実行結果に対しては、次のように基本的な使い方で紹介した様々な関数を使えます。

```typescript
// コメントの結果は、現在日時が '2026-05-18T00:00:00Z'の場合になります
const now = dayjs().tz();
// 10月に置き換える（「2026-10-18T09:00:00+09:00」になる）
console.log(now.set('month', 9).format());
// 30日後にする（「2026-06-17T12:00:00+09:00」になる）
console.log(now.add(30, 'days').format());
// 現在日時と「2026-05-18T12:00:00+09:00」の比較（「true」になる）
console.log(now.isBefore(dayjs('2026-05-18T03:00:00Z').tz()));
// 当月末日を取得する（「2026-05-31」になる）
console.log(now.endOf('months').format('YYYY-MM-DD'));
// JSON 用シリアライズ（「2026-05-18T00:00:00.000Z」になる）
console.log(now.toJSON());
```

### 注意する点

#### 問題が発生する使い方

次の二つの使い方は同じ結果を返すように見えますが、どちらか一方は問題のある使い方をしています。それはどちらでしょうか？

```typescript
// 使用法A: dayjs 関数にタイムゾーン付き日時を渡す
console.log("使用法A:", dayjs('2026-05-18T00:00:00+09:00').tz().format());
// 使用法B: tz 関数にタイムゾーン付き日時を渡す 
console.log("使用法B:", dayjs.tz('2026-05-18T00:00:00+09:00').format());
```

正解は、「使用法B」です。二つの処理を実際に実行した結果は、次のようになります。

```text
使用法A: 2026-05-18T00:00:00+09:00
使用法B: 2026-05-17T15:00:00+09:00
```

`tz` 関数にタイムゾーン付き日時を渡すと、タイムゾーンがプラスであれば過去に遡り、マイナスであれば未来に飛ぶ不具合が発生します。つまり、「使用法B」では「+09:00」のタイムゾーンを付与しているので、9時間前の日時に遡るという事象が発生しているのです。

#### 問題の回避方法

この問題を回避するには、２つの方法があります。一つは、前述の問題が発生しない「使用法A」を採用することです。もう一方は、次のように、`tz` 関数に渡す値を Date オブジェクトに変換する方法です。

```typescript
// 「使用法B': 2026-05-18T00:00:00+09:00」になる
console.log("使用法B':", dayjs.tz(dayjs('2026-05-18T00:00:00+09:00').toDate()).format());
```

なお、サンプルコードだと冗長に見えますが、プログラム内部で Date オブジェクトを頻繁に取り扱っている場合は、こちらに使いやすさの軍配が上がる可能性もあります。

## おわりに

Day.js はとても使い勝手が良くて便利な日時操作ライブラリですが、タイムゾーンを取り扱う時には注意が必要なことがあったので、ご紹介させていただきました。この記事が皆様の役に立てれば幸いです。

### 参考文献

- [Day.js npm](https://www.npmjs.com/package/dayjs)
- [Day.js GitHub](https://github.com/iamkun/dayjs)
- [Day.js Document](https://day.js.org/docs/en/plugin/timezone)

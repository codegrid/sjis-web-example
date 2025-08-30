# Shift-JIS Web Example

## 概要

現代のフロントエンド開発ワークフローとShift-JISを共存させるための実装サンプルです。

UTF-8で書かれたソースコードから、Shift-JISの静的HTMLをビルドし、Shift-JISとUTF-8の両方を返すAPIサーバーと連携させる、複雑なエンコーディング混在環境を再現しています。

## このサンプルが示すこと

- **ビルド時のエンコーディング変換**:
  - UTF-8で書かれたEJSテンプレートからShift-JIS（CP932）のHTMLファイルを生成する方法。
  - iconv-liteライブラリを使った、文字列からバイナリデータへのエンコード変換。
- **サーバーサイドでのShift-JIS対応**:
  - Shift-JISのデータファイルを読み込んでWebAPIとして提供する実装方法。
  - 円マーク問題の実装レベルでの対処（`\` → `&yen;` 変換）。
  - Shift-JISでJSONレスポンスを返すための適切なヘッダー設定とエンコード処理。
- **クライアントサイドでのShift-JISの扱い**:
  - Shift-JISのHTMLページ上で、UTF-8のJavaScriptを実行する方法（`<script charset="utf-8">`）。
  - Shift-JISでエンコードされたAPIレスポンスを、文字化けさせずに扱うための3つの異なる実装方法の比較。

## 技術スタック

- **ビルド**: Node.js, EJS, iconv-lite, fs-extra
- **APIサーバー**: Python 3 (http.server)
- **クライアントサイド**: Vanilla JavaScript, axios

## ディレクトリ構成

```
sjis-web-example/
├── build/         # ビルドスクリプト (`build.js`)
├── public/        # Webサーバーの公開ディレクトリ（ビルド後の成果物）
├── server/        # APIサーバーのスクリプト (`api_server.py`)
├── src/           # 開発用のソースファイル（すべてUTF-8）
├── data/          # DBの代わりとなるデータソース（Shift-JIS）
└── package.json   # ビルドスクリプトの依存関係
```

## 実行手順

### 1. 前提条件
- Node.js と npm がインストールされていること。
- Python 3 がインストールされていること。

### 2. 依存パッケージのインストール
プロジェクトのルートディレクトリで、以下のコマンドを実行します。

```bash
npm install
```

### 3. サーバーの起動
以下のコマンドで、ビルドとPython製Webサーバーの起動を同時に実行します。
このサーバーは`public/`ディレクトリのファイルを配信し、`/api`へのリクエストを処理します。

```bash
npm start
```

ビルドのみ実行したい場合：

```bash
npm run build
```

### 4. ブラウザで確認
サーバーが起動したら、Webブラウザで以下のURLにアクセスしてください。

[http://localhost:8000](http://localhost:8000)

3つのShift-JIS API呼び出しパターンと、比較用のUTF-8 API呼び出しの結果が、すべて文字化けせずに表示されるはずです。

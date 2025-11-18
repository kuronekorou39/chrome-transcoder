# Multi Encoder/Decoder

Chrome拡張機能として動作する多機能なエンコード/デコードツールです。

## 機能

サイドパネルで様々なエンコード/デコード処理を実行できます：

- **Unicode** - Unicode エスケープシーケンス (`\uXXXX`) の変換
- **URL** - URLエンコード/デコード（UTF-8, Shift-JIS, EUC-JP対応）
- **Base64** - Base64エンコード/デコード
- **HTML Entities** - HTML特殊文字のエンコード/デコード
- **JSON** - JSONのフォーマット/圧縮/エスケープ
- **JWT** - JWTトークンのデコード
- **Hash** - SHA-256/SHA-1/MD5ハッシュ生成
- **Hex** - 16進数変換

## インストール

1. このリポジトリをクローンまたはダウンロード
2. Chrome拡張機能管理画面を開く（`chrome://extensions/`）
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. プロジェクトフォルダを選択

## 使い方

1. Chromeツールバーの拡張機能アイコンをクリック
2. サイドパネルが開きます
3. 使いたい機能のタブを選択
4. テキストを入力してエンコード/デコードボタンをクリック
5. 結果をコピーまたは入力欄に反映できます

## 技術スタック

- Manifest V3
- Vanilla JavaScript
- encoding.js（文字コード変換用）

## ファイル構成

```
├── manifest.json      # 拡張機能の設定
├── background.js      # サービスワーカー
├── panel.html         # サイドパネルUI
├── panel.js           # エンコード/デコード処理
└── encoding.min.js    # 文字コード変換ライブラリ
```

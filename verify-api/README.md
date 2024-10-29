# Certificate Verification API

このプロジェクトは、Azure Functions を使用して実装された証明書検証 API です。
Symbol ブロックチェーンの署名検証機能を利用して、デジタル証明書の真正性を確認します。

## 機能概要

- デジタル証明書の署名検証
- Symbol SDK を使用した暗号化検証
- RESTful API インターフェース

## 前提条件

- Node.js 18.x 以上
- npm 9.x 以上
- Azure Functions Core Tools v4.x
- Azure CLI (デプロイメント用)

## セットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd [project-directory]
```

2. 依存関係のインストール
```bash
npm install
```

3. ローカル開発環境の起動
```bash
npm start
```

## API 仕様

### 証明書検証エンドポイント

**エンドポイント**: `/api/VerifyCertificate`  
**メソッド**: POST  
**認証**: 不要（anonymous）

#### リクエスト形式

```json
{
    "pub_key": "string",
    "signature": "string",
    "payload": {
        "mosaic_id": "string",
        "verifier": "string",
        "create_timestamp": number
    }
}
```

#### レスポンス形式

**成功時 (200 OK)**
```json
{
    "result": "ok",
    "mosaic_id": "string",
    "create_timestamp": number
}
```

**検証失敗時 (400 Bad Request)**
```json
{
    "result": "ng",
    "mosaic_id": "string",
    "create_timestamp": number
}
```

**バリデーションエラー時 (400 Bad Request)**
```json
{
    "message": "エラーメッセージ"
}
```

## 開発

### プロジェクト構造

```
├── src/
│   └── functions/
│       └── VerifyCertificate.ts
├── local.settings.json
├── package.json
├── host.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## デプロイメント

### Azure へのデプロイ

1. Azure へのログイン
```bash
az login
```

2. Function App のデプロイ
```bash
npm run deploy
```

または、GitHub Actions を使用した自動デプロイを設定することもできます。

## 環境変数

必要な環境変数は `local.settings.json` に定義します：

```json
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "",
        "FUNCTIONS_WORKER_RUNTIME": "node"
    }
}
```

## トラブルシューティング

よくある問題と解決方法：

1. ローカル実行時のエラー
   - Azure Functions Core Tools が正しくインストールされているか確認
   - Node.js バージョンの互換性を確認

2. デプロイメントエラー
   - Azure サブスクリプションの権限を確認
   - リソースグループとリージョンの設定を確認

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Opening Line

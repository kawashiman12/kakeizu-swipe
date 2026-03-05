# 家系図スワイプ (kakeizu-swipe)

Tinder風スワイプ操作で直感的に家系図を入力できるモバイルファーストWebアプリ。

## セットアップ

```bash
git clone https://github.com/kawashiman12/kakeizu-swipe.git
cd kakeizu-swipe
npm install
npm run dev
```

`http://localhost:3000` にアクセス。

## 画面構成

| パス | 画面 | 説明 |
|------|------|------|
| `/` | ランディング | 新規作成 / 続き / デモ開始 |
| `/editor` | エディター | スワイプ入力 + ミニツリー表示 |
| `/export` | データ管理 | JSON エクスポート / インポート |

## スワイプ操作

| 方向 | 動作 |
|------|------|
| → 右スワイプ | 人物を保存して次へ |
| ← 左スワイプ | スキップ（後で入力キューに戻す） |
| ↑ 上スワイプ | 関係追加モーダルを表示 |

- **Undo**: 画面右上の「↩ 戻す」ボタンで直近の操作を取り消し
- **ミニツリー**: 画面下部に常時表示（折りたたみ可能）。人物タップでジャンプ

## データの保存場所

- `localStorage` キー: `kakeizu_tree_v1`
- すべてのデータはブラウザ内にのみ保存
- クラウドへのデータ送信は一切なし

## エクスポート / インポート

1. `/export` ページへ移動
2. 「ファイル保存」で `.json` ファイルとしてダウンロード
3. 「JSONコピー」でクリップボードにコピー
4. インポートはファイル選択 or JSON貼り付けで実行

## データモデル

```typescript
Person:       { id, name, birthYear?, memo? }
Relationship: { id, type: 'parent' | 'spouse', fromId, toId }
Tree:         { persons, relationships, updatedAt }
```

## 技術スタック

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **framer-motion** (スワイプジェスチャー)
- **localStorage** (データ永続化)

## スクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint実行
npm run typecheck    # TypeScript型チェック
npm run format       # Prettier フォーマット
npm run format:check # Prettier チェック
```

## ライセンス

MIT

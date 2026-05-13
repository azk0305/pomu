# Pomu

> POMU: Perfectly Operational Multipurpose Unit

Pomuはターミナル（TUI）型のチャットアプリケーションです。ReactとOpenTUIを使用し、複数のLLMプロバイダへ対応するためVercel AI SDKを使用しています。

※LLMアプリケーションの動作原理やハーネスエンジニアリングなど、個人的な学習のために制作しているものであり、実用性は考慮できていませんので、ご了承ください。

## Features

- 複数AIプロバイダ：
  - デフォルトで利用可能：Google（Gemini）、OpenAI互換API
  - Vercel AI SDKのモジュールを追加することで多くのLLMを利用可能
- TUIでのチャット：OpenTUIを使って、モダンで対話的なターミナルUXを構築
- ツール呼び出し：
  - ファイル処理：`read_file`, `write_file`, `edit_file`, `list_files`, `grep_files`（要ripgrep）, `make_dir`
  - システム処理：`run_command`, `get_current_time`
- スラッシュコマンド：
  - Gemini CLIへの委譲（`/gemini`）
  - Claudeへの委譲（`/claude`）
  - Codexへの委譲（`/codex`）
  - ヘルプの表示（`/help`）
  - アプリケーションの終了（`/exit`）
- セキュリティ：特定のツールの呼び出しにはユーザへ確認を求める、カレントディレクトリの外部の操作は禁止にする

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [ripgrep](https://github.com/BurntSushi/ripgrep)

### Installation

1. リポジトリをクローン：
   ```bash
   git clone <repository-url>
   cd pomu
   ```

2. Dependenciesのインストール：
   ```bash
   bun install
   ```

### Configuration

1. `.env` のコピー
   ```bash
   cp .env.example .env
   ```

2. `.env` を編集してAPIキーなどを追加：
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Google AI Studioで取得
   - `OPENAI_BASE_URL` および `OPENAI_API_KEY` (OpenAI互換プロバイダの場合：必要に応じて)

### Running

```bash
bun run src/index.ts
```

## Usage

起動後、画面下部のテキストエリアからプロンプトを送信する。

## Others

本アプリケーション開発の経緯、学んだ内容などを後日ブログにて記事執筆予定。

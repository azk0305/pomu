# Pomu

> POMU: Perfectly Operational Multipurpose Unit

Pomuはターミナル（TUI）型のチャットアプリケーションです。ReactとOpenTUIを使用し、複数のLLMプロバイダへ対応するためVercel AI SDKを使用しています。

※LLMアプリケーションの動作原理やハーネスエンジニアリングなど、個人的な学習のために制作しているものであり、実用性は考慮できていませんので、ご了承ください。

## Features

- 複数AIプロバイダ：
  - デフォルトで利用可能：Google（Gemini）、OpenAI互換API
  - Vercel AI SDKのモジュールを追加することで多くのLLMを利用可能
- TUIでのチャット：OpenTUIを使って、モダンで対話的なターミナルUXを構築
- オーケストレーション（Sub-Agents）：
  - AIが自律的に判断し、複雑なタスクを他の専門エージェント（gemini, claude, codex, あるいはpomu自身）へ委譲可能
  - `invoke_agent` ツールによる安全なバックグラウンド実行
- ツール呼び出し：
  - ファイル処理：`read_file`, `write_file`, `edit_file`, `list_files`, `grep_files`（要ripgrep）, `make_dir`
  - システム処理：`run_command`, `get_current_time`, `invoke_agent`, `activate_skill`
- スラッシュコマンド：
  - Gemini CLIへの委譲（`/gemini`）
  - Claudeへの委譲（`/claude`）
  - Codexへの委譲（`/codex`）
  - ヘルプの表示（`/help`）
  - アプリケーションの終了（`/exit`）
  - スキル一覧の表示（`/skills`）
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

## Agent Skills (エージェント・スキル)

セッション中に、特定のドメインやプロジェクトに合わせた指示・ルール（スキル）を動的にLLMに読み込ませることができます。

### スキルの定義

以下のようにYAMLフロントマター（`name` と `description`）を含むMarkdownファイルを配置します。プロジェクトレベルとグローバル（ユーザレベル）の2箇所に配置可能で、同じ名前のスキルが存在する場合はプロジェクトレベルが優先されます。

- **グローバル（ユーザレベル）:** `~/.pomu/skills/<skill-name>/SKILL.md`
- **プロジェクトレベル:** `./.pomu/skills/<skill-name>/SKILL.md`

**SKILL.mdの記述例:**
```markdown
---
name: git-helper
description: Gitコミットメッセージやブランチ管理のベストプラクティス
---
# Git Helper Skill
常にConventional Commitsに従ってクリーンなコミットメッセージを作成してください。
...
```

### スキルの動作

1. **検出:** 起動時に配置されたスキルを自動的にスキャンします（scanSkills）。
2. **提示:** 利用可能なスキル一覧（名前と説明）がシステムプロンプトの「Available Skills」としてLLMに提示されます。
3. **有効化:** LLMが必要だと判断したタイミングで activate_skill ツールを実行し、そのスキルの内容を「Active Skills」としてセッション内のシステムプロンプトへ動的に挿入します。
4. **コマンド:** `/skills` スラッシュコマンド（src/commands/skills.ts）を実行することで、現在ロードされているスキルのステータス（Active / Inactive）やパスの一覧を確認できます。

## Others

本アプリケーション開発の経緯、学んだ内容などを後日ブログにて記事執筆予定。

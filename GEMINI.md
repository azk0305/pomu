# pomu

A Terminal User Interface (TUI) chat application built with React and OpenTUI, leveraging the Vercel AI SDK for multi-provider LLM support.

## Project Overview

- **Core Framework:** React 19 with OpenTUI for terminal rendering.
- **Runtime & Package Manager:** [Bun](https://bun.sh/).
- **AI Integration:** Uses `ai` (Vercel AI SDK) with `@ai-sdk/google` (Google Gemini), `@ai-sdk/anthropic` (Claude), and `@ai-sdk/openai-compatible` (e.g., LM Studio).
- **Architecture:**
  - `src/index.ts`: Entry point, CLI flag handling, and main layout.
  - `src/app.tsx`: Main application component for TUI mode.
  - `src/messages.tsx`: Chat history display component.
  - `src/footer.tsx`: Input area component using OpenTUI's `textarea`.
  - `src/actions/`:
    - `sendMessage.ts`: Logic for streaming AI responses in TUI mode.
    - `runHeadless.ts`: Logic for headless mode (CLI-only interaction).
  - `src/commands/`: Implementation of slash commands (e.g., `/gemini`, `/claude`).
  - `src/tools/`: Definitions for AI-invocable tools.
  - `src/components/`: Reusable UI components (e.g., `ConfirmDialog`).
  - `src/providers/`: Factory for AI model instances and provider configurations.
  - `src/types/`: TypeScript definitions for messages, model options, and command types.
  - `src/utils/`:
    - `confirmStore.ts`: Global state for tool execution confirmations and mode flags.
    - `pathUtils.ts`: Security utilities for file path validation.

## Building and Running

### Prerequisites

- [Bun](https://bun.sh/) installed on your system.
- [ripgrep](https://github.com/BurntSushi/ripgrep) for `grep_files` tool.
- A `.env` file based on `.env.example` with necessary API keys.

### Commands

- **Install Dependencies:**
  ```bash
  bun install
  ```

- **Run in TUI Mode:**
  ```bash
  bun run src/index.ts
  ```

- **Run in Headless Mode:**
  ```bash
  bun run src/index.ts -p "Your prompt here"
  ```

- **Run in YOLO Mode (Auto-approve tools):**
  ```bash
  bun run src/index.ts --yolo
  ```

## Development Conventions

- **AI SDK Version:** This project uses **Vercel AI SDK v6**. Always ensure implementations are compatible with v6 and avoid deprecated APIs.
- **TypeScript:** The project is strictly typed. Always define interfaces/types in `src/types/`.
- **Slash Commands:**
  - Commands are defined in `src/commands/`.
  - Register new commands in `src/commands/index.ts`.
- **Operating Modes:**
  - **TUI Mode (Default):** Interactive terminal UI.
  - **Headless Mode (`-p`):** One-shot prompt execution via CLI. Tool confirmations use `readline`.
  - **YOLO Mode (`--yolo`):** Automatically approves all tool execution requests.
- **Tool Implementation & Security:**
  - AI tools are defined in `src/tools/` and registered in `src/tools/index.ts`.
  - **Security Mandate:** Any tool performing destructive actions (e.g., `write_file`, `edit_file`) or executing shell commands (`run_command`) **MUST** require explicit user confirmation unless YOLO mode is active.
  - Use `confirmStore.ask(message)` within the tool's `execute` function in `src/tools/index.ts`.
  - File operations must use `isSafePath` from `src/utils/pathUtils.ts` to prevent directory traversal.
- **Component Structure:** Use functional components. Prefer organizing UI components in `src/components/` or the root of `src/` for main layout elements.
- **State Management:** Uses React's `useState`, `useRef`, and `confirmStore` for managing chat and application state.
- **TUI Elements:** Uses OpenTUI-specific components like `<box>`, `<scrollbox>`, and `<textarea>`.


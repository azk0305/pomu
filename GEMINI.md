# pomu

A Terminal User Interface (TUI) chat application built with React and OpenTUI, leveraging the Vercel AI SDK for multi-provider LLM support.

## Project Overview

- **Core Framework:** React 19 with OpenTUI for terminal rendering.
- **Runtime & Package Manager:** [Bun](https://bun.sh/).
- **AI Integration:** Uses `ai` (Vercel AI SDK) with `@ai-sdk/google` (Google Gemini), `@ai-sdk/anthropic` (Claude), and `@ai-sdk/openai-compatible` (e.g., LM Studio).
- **Architecture:**
  - `src/index.tsx`: Entry point and main layout.
  - `src/messages.tsx`: Chat history display component.
  - `src/footer.tsx`: Input area component using OpenTUI's `textarea`.
  - `src/actions/`: Logic for interacting with AI models (streaming, state management).
  - `src/commands/`: Implementation of slash commands and routing logic.
  - `src/tools/`: Definitions for AI-invocable tools (file operations, shell commands).
  - `src/components/`: Reusable UI components (e.g., `ConfirmDialog`).
  - `src/providers/`: Factory for AI model instances and provider configurations.
  - `src/types/`: TypeScript definitions for messages, model options, and command types.
  - `src/utils/`: Shared utility functions and state stores (e.g., `confirmStore`).

## Building and Running

### Prerequisites

- [Bun](https://bun.sh/) installed on your system.
- A `.env` file based on `.env.example` with necessary API keys (e.g., `GOOGLE_GENERATIVE_AI_API_KEY`, `ANTHROPIC_API_KEY`).

### Commands

- **Install Dependencies:**
  ```bash
  bun install
  ```

- **Start Development Mode (Watch):**
  ```bash
  bun dev
  ```

## Development Conventions

- **AI SDK Version:** This project uses **Vercel AI SDK v6**. Always ensure implementations are compatible with v6 and avoid deprecated APIs.
- **Documentation First:** Before implementing AI features, check the latest [Vercel AI SDK v6 documentation](https://sdk.vercel.ai/docs) to ensure the use of current patterns and types.
- **TypeScript:** The project is strictly typed. Always define interfaces/types in `src/types/`.
- **Slash Commands:**
  - Commands are defined in `src/commands/`.
  - Each command should implement the `Command` interface.
  - Register new commands in `src/commands/index.ts`.
- **Tool Implementation & Security:**
  - AI tools are defined in `src/tools/`.
  - **Security Mandate:** Any tool performing destructive actions (e.g., `writeFile`, `editFile`, `makeDir`) or executing shell commands (`runCommand`) **MUST** require explicit user confirmation.
  - Use `confirmStore.requestConfirmation()` within the tool's `execute` function to trigger the `ConfirmDialog`.
- **Component Structure:** Use functional components. Prefer organizing UI components in `src/components/` or the root of `src/` for main layout elements.
- **State Management:** Uses React's `useState`, `useRef`, and custom stores (via `valtio` or similar simple patterns) for managing chat and application state.
- **AI Streaming:** Leverages `streamText` from the Vercel AI SDK to provide real-time responses in the terminal.
- **TUI Elements:** Uses OpenTUI-specific components like `<box>`, `<scrollbox>`, and `<textarea>`. Refer to `@opentui/core` for attributes and event handling.

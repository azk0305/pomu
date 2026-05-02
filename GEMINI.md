# pomu

A Terminal User Interface (TUI) chat application built with React and OpenTUI, leveraging the Vercel AI SDK for multi-provider LLM support.

## Project Overview

- **Core Framework:** React 19 with OpenTUI for terminal rendering.
- **Runtime & Package Manager:** [Bun](https://bun.sh/).
- **AI Integration:** Uses `ai` (Vercel AI SDK) with `@ai-sdk/google` (Google Gemini) and `@ai-sdk/openai-compatible` (e.g., LM Studio).
- **Architecture:**
  - `src/index.tsx`: Entry point and main layout.
  - `src/messages.tsx`: Chat history display component.
  - `src/footer.tsx`: Input area component using OpenTUI's `textarea`.
  - `src/actions/`: Logic for interacting with AI models (streaming, state management).
  - `src/providers/`: Factory for AI model instances.
  - `src/types/`: TypeScript definitions for messages and model options.

## Building and Running

### Prerequisites

- [Bun](https://bun.sh/) installed on your system.
- A `.env` file based on `.env.example` with necessary API keys (e.g., `GOOGLE_GENERATIVE_AI_API_KEY`).

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

- **TypeScript:** The project is strictly typed. Always define interfaces/types in `src/types/`.
- **Component Structure:** Use functional components. Prefer organizing UI components in the root of `src/` and logic in subdirectories like `actions/` or `providers/`.
- **State Management:** Uses React's `useState` and `useRef` for managing chat state and history.
- **AI Streaming:** Leverages `streamText` from the Vercel AI SDK to provide real-time responses in the terminal.
- **TUI Elements:** Uses OpenTUI-specific components like `<box>`, `<scrollbox>`, and `<textarea>`. Refer to `@opentui/core` for attributes and event handling.

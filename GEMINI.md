# pomu

A Terminal User Interface (TUI) chat application built with React and OpenTUI, leveraging the Vercel AI SDK for multi-provider LLM support.

## Project Overview

- **Core Framework:** React 19 with OpenTUI for terminal rendering.
- **Runtime & Package Manager:** [Bun](https://bun.sh/).
- **AI Integration:** Uses `ai` (Vercel AI SDK) with `@ai-sdk/google` (Google Gemini) and `@ai-sdk/openai-compatible` (e.g., LM Studio).
- **Architecture:**
  - `src/index.ts`: Entry point, CLI flag handling, and main layout.
  - `src/app.tsx`: Main application component for TUI mode.
  - `src/messages.tsx`: Chat history display component.
  - `src/footer.tsx`: Input area component using OpenTUI's `textarea`.
  - `src/actions/`:
    - `sendMessage.ts`: Logic for streaming AI responses in TUI mode.
    - `runHeadless.ts`: Logic for headless mode (CLI-only interaction).
  - `src/commands/`: Implementation of slash commands (e.g., `/gemini`, `/claude`, `/skills`).
  - `src/tools/`: Definitions for AI-invocable tools.
  - `src/components/`: Reusable UI components (e.g., `ConfirmDialog`).
  - `src/providers/`: Factory for AI model instances and provider configurations.
  - `src/types/`: TypeScript definitions for messages, model options, and command types.
  - `src/utils/`:
    - `confirmStore.ts`: Global state for tool execution confirmations and mode flags.
    - `pathUtils.ts`: Security utilities for file path validation.
    - `skillManager.ts`: Utility for scanning, loading, and building system prompts for Agent Skills.

## Orchestration & Sub-Agents

Pomu is designed as an **Orchestrator**. It can delegate tasks to specialized sub-agents using the `invoke_agent` tool.

- **Supported Sub-Agents:**
  - `gemini`: Google Gemini CLI.
  - `claude`: Claude Code.
  - `codex`: Codex CLI.
  - `pomu`: Self-delegation via headless mode.
- **Execution Mechanism:** Sub-agents are spawned in separate processes with their respective non-interactive/auto-approve flags (e.g., `--yolo`, `--permission-mode bypassPermissions`).
- **Safety:** Parent `pomu` instance will ask for user confirmation before invoking a sub-agent unless the parent is also in YOLO mode.

## Agent Skills

Pomu supports **Agent Skills**, allowing the assistant to dynamically load domain-specific or project-specific instructions and rules into the session.

- **Storage Locations:**
  - **User-level (Global) Skills:** `~/.pomu/skills/<skill-name>/SKILL.md`
  - **Project-level Skills:** `./.pomu/skills/<skill-name>/SKILL.md`
  - *Note:* If a project-level skill has the same name as a user-level skill, the project-level skill takes precedence.

- **Defining a Skill (`SKILL.md`):**
  A skill must be a markdown file with YAML frontmatter containing `name` and `description`:
  ```markdown
  ---
  name: git-helper
  description: Best practices for git commits and branch management
  ---
  # Git Helper Skill
  Always write clean, conventional commit messages.
  ...
  ```

- **How it Works:**
  1. **Scans Available Skills:** During startup, Pomu scans the user-level and project-level directories using scanSkills.
  2. **Catalog Injection:** The available skill catalog (names and descriptions) is dynamically appended to the base system prompt.
  3. **Activation Tool (`activate_skill`):** When the assistant encounters a task where an available skill is relevant, it invokes the `activate_skill` tool (defined in src/tools/index.ts) with the skill name.
  4. **Active Prompt Injection:** Once activated, the full instructions from the skill are injected into the dynamic system prompt for all subsequent turns in that session.

- **Slash Command:**
  - `/skills`: Lists all scanned skills, showing their activation status (Active/Inactive), description, and location. Implemented in src/commands/skills.ts.

## LLM Tracing & Evaluation (W&B Weave)

Pomu supports integration with **Weights & Biases Weave** for LLM application tracking, evaluation, and observability.

- **Telemetry Architecture:**
  - Integrates with the Vercel AI SDK's `experimental_telemetry` option.
  - Registers a global platform-agnostic `BasicTracerProvider` and `SimpleSpanProcessor` from `@opentelemetry/sdk-trace-base` to prevent runtime conflicts with Bun's interactive terminal raw mode event loop (avoiding `AsyncHooksContextManager` monkey-patching).
  - Traces are exported using `@opentelemetry/exporter-trace-otlp-proto` to W&B's OTLP endpoint (`https://trace.wandb.ai/otel/v1/traces`).
  - Exports `shutdownTelemetry` from `src/providers/index.ts`, which is awaited before process exit (in headless mode) or renderer destruction (in TUI mode) to guarantee that all queued spans are fully flushed and sent to Weave.
- **Configuration (`.env`):**
  - `USE_WEAVE`: Enables/disables tracing when set to `"true"`.
  - `WANDB_API_KEY`: API key for Weights & Biases authorization.
  - `WANDB_PROJECT_NAME`: Target W&B project.
  - `WANDB_TEAM_NAME`: Target W&B team/entity.
- **Development Constraints:**
  - For tool-call tracking compatibility across both Weave and Vercel AI SDK v6, the message formatting mapper in `src/actions/sendMessage.ts` maps tool result parts using **both** `result` (required by Weave) and `output` structured value (required by AI SDK v6 zod validation):
    ```typescript
    {
      type: "tool-result",
      toolCallId: c.toolCallId,
      toolName: c.toolName,
      result: c.output,
      output: { type: "text", value: String(c.output) }
    }
    ```
  - **Tool-Result Consistency Mandate (Weave Error Prevention):**
    To prevent Weave from throwing `Exception: Tool result is missing for tool call` errors when tool execution fails or is interrupted:
    - All tool execution functions in `src/tools/index.ts` are wrapped with a `safeExecute` helper. This helper catches any runtime exceptions and returns a structured error result (`{ type: "error", value: "..." }`) rather than letting the exception bubble up, which would skip the `tool-result` generation.
    - In `src/actions/sendMessage.ts`, prior to compiling prompt history for the LLM, the messages array is normalized. Any `tool-call` in the assistant messages that lacks a matching `tool-result` in the tool messages is automatically patched with a dummy error result, ensuring strict alignment between tool calls and their results.

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


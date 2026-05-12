# Pomu

> POMU:

Pomu is a Terminal User Interface (TUI) chat application built with React and OpenTUI, leveraging the Vercel AI SDK for multi-provider LLM support.

## Features

- **Multi-provider AI Support:** Seamlessly switch between different AI models:
  - **Google Gemini** (`/gemini`)
  - **Anthropic Claude** (`/claude`)
  - **OpenAI-Compatible** (e.g., LM Studio, Codex) (`/codex`)
- **Slash Command System:** Quickly change models or perform actions using `/` commands.
- **Interactive AI Tools:** The AI can perform various tasks on your system (with your permission):
  - **File Operations:** Read, write, edit, list, and grep files, as well as create directories.
  - **System Interaction:** Run shell commands and get the current time.
- **Secure Execution:** Any destructive actions or shell commands require explicit user confirmation through an interactive TUI dialog.
- **Responsive TUI:** Built with OpenTUI for a modern, interactive terminal experience.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pomu
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API keys:
   - `GOOGLE_GENERATIVE_AI_API_KEY`: For Google Gemini models.
   - `ANTHROPIC_API_KEY`: For Anthropic Claude models.
   - For OpenAI-compatible providers, configure the `OPENAI_BASE_URL` and `OPENAI_API_KEY` (if needed).

### Running

Start the application in development mode:

```bash
bun dev
```

## Usage

Once the application is running, you can type your messages in the input area at the bottom.

### Slash Commands

- `/gemini`: Switch to the Google Gemini model.
- `/claude`: Switch to the Anthropic Claude model.
- `/codex`: Switch to the OpenAI-compatible model.
- `/help`: Display available commands and information.
- `/exit`: Close the application.

### AI Tools

The AI can suggest performing actions like reading a file or running a command. If an action requires confirmation, a dialog will appear. Use the `Arrow Keys` to select and `Enter` to confirm or cancel.

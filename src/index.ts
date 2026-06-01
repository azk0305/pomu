import { Command } from "commander";
import { App } from "./app";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { createElement } from "react";
import os from "node:os";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { runHeadless } from "./actions/runHeadless";
import { confirmStore } from "./utils/confirmStore";

// 起動処理
function main() {
  const program = new Command();
  program
    .name("pomu")
    .description(
      "pomu - Perfectly Operational Multipurpose Unit, my personal AI assistant",
    )
    .version("1.0.2")
    .option(
      "-p, --prompt <string>",
      "Run in headless mode with the given prompt",
    )
    .option(
      "--yolo",
      "Run in YOLO mode, automatically approving all tool executions",
    )
    .action(async (options) => {
      // ~/.pomu を作成
      mkdir(path.resolve(os.homedir(), ".pomu"), { recursive: true });

      // YOLOモードを実行
      if (options.yolo) {
        confirmStore.setYoloMode(true);
      }

      // Headlessモードを実行
      if (options.prompt) {
        confirmStore.setHeadlessMode(true);
        await runHeadless(options.prompt);
        process.stdin.pause();
        process.exit(0);
      }

      // レンダラーを初期化
      const renderer = await createCliRenderer({
        exitOnCtrlC: true,
        consoleOptions: {
          position: ConsolePosition.TOP,
          sizePercent: 30,
          colorInfo: "cyan",
          colorWarn: "yellow",
          colorError: "red",
        },
      });

      // レンダリングを実施
      //renderer.console.toggle();
      createRoot(renderer).render(
        createElement(App, { onExit: () => renderer.destroy() }),
      );
    });
  program.parse();
}

main();

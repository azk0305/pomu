import { Command } from "commander";
import { App } from "./app";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { createElement } from "react";
import { mkdir } from "node:fs/promises";

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

const program = new Command();

program
  .name("pomu")
  .description("pomu - Perfectly Operational Multipurpose Unit, my personal AI assistant")
  .version("0.0.1")
  // .option("")
  .action(async () => {
    mkdir("~/.pomu", { recursive: true });
    //renderer.console.toggle();
    createRoot(renderer).render(createElement(App, { onExit: () => renderer.destroy() }));
  });

program.parse();

#!/usr/bin/env node

import { Command } from "commander";
import { init_client } from "./commands/client";
import { init_server } from "./commands/server";

const program = new Command();

program
  .name("@axiom/logger")
  .description("Intelligent logging for agentic processes.")
  .version("0.0.1");

program
  .command('add')
  .description("Add an instance of Axiom to your project.")
  .argument("<type>", "Type of integration (client | server)")
  .action(async (t: string) => {
    switch (t) {
      case 'client':
        await init_client();
        break;
      case 'server':
        await init_server();
        break;
      default:
        console.error("Invalid type. Use: 'client' or 'server'.")
    }
  });

program.parse();
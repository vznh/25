import { copyFile } from "fs/promises";
import { confirm } from "@clack/prompts";

async function init_client() {
  const router = await confirm({
    message: "Are you using Pages Router?",
    initialValue: false
  });

  await copyFile("templates/client/logger.ts", "src/lib/logger.ts");
  await copyFile("templates/types/client.ts", "src/types/logger.ts");

  // pages router
  if (router) {
    await copyFile("templates/client/api.ts", "src/pages/api/logger.ts");
  } else {
    await copyFile("templates/client/api.ts", "src/app/api/logger.ts");
  }

  // add to package.json

  // note set-up complete
}

export { init_client };

import { copyFile } from "fs/promises";
import { confirm } from "@clack/prompts";
import { join } from "path";

async function init_client() {
  const router = await confirm({
    message: "Are you using Pages Router?",
    initialValue: false
  });

  // Templates are at src/templates in the package
  await copyFile(join(__dirname, "../../../axiomarc/src/templates/client/logger.ts"), "src/lib/logger.ts");

  // pages router
  if (router) {
    await copyFile(join(__dirname, "../../../axiomarc/src/templates/client/api.ts"), "src/pages/api/logger.ts");
  } else {
    await copyFile(join(__dirname, "../../../axiomarc/src/templates/client/api.ts"), "src/app/api/logger.ts");
  }

  // add to package.json

  // note set-up complete
}

export { init_client };

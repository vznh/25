import { copyFile } from "fs/promises";
import { join } from "path";

async function init_server() {
  await copyFile(join(__dirname, "../../src/templates/server/logger.ts"), "src/logger.ts");

  // add to package.json
  // create env config

  // note set-up complete
}

export { init_server };

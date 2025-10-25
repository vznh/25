import { copyFile } from "fs/promises";

async function init_server() {
  await copyFile("templates/server/logger.ts", "src/logger.ts");
  await copyFile("templates/types/server.ts", "src/types/logger.ts");
  // add to package.json
  // create env config

  // note set-up complete
}

export { init_server };

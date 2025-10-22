import { startBootLoaders } from "./boot";
import { getLogger } from "./util/logger";

// startup locations
import "./server/index";

// lifecycle
const logger = getLogger("ROOT");

function main() {
    logger.info("Starting user management server...");
    startBootLoaders();
}

main();
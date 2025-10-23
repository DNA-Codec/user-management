import { startBootLoaders } from "./boot";
import { getLogger } from "./util/logger";

// startup locations
import "./server";
import "./mongo";

// lifecycle
const logger = getLogger("ROOT");

function main() {
    logger.info("Starting user management server...");
    startBootLoaders();
}

main();
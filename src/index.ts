import { registerCommand, runCommand, handlerLogin } from "./command";
import type { CommandHandler } from "./command";

function main(): void {
    const registry: Record<string, CommandHandler> = {};
    registerCommand(registry, "login", handlerLogin);
    const args: string[] = process.argv.slice(2);
    // case where npm run start is given no arguments
    if (args.length === 0) {
        console.log("Error: Expected at least 1 argument, 0 provided");
        process.exit(1);
    }
    const cmdName: string = args[0];
    const cmdArgs: string[] = args.slice(1); 
    runCommand(registry, cmdName, ...cmdArgs);
}

main();
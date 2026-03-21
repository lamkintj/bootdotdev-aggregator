import { CommandHandler, runCommand } from "./command";
import { initRegistry } from "./registry";

async function main(): Promise<void> {
    const registry: Record<string, CommandHandler> = await initRegistry();
    const args: string[] = process.argv.slice(2);
    // case where npm run start is given no arguments
    if (args.length === 0) {
        console.log("Error: Expected at least 1 argument, 0 provided");
        process.exit(1);
    }

    const cmdName: string = args[0];
    const cmdArgs: string[] = args.slice(1);
    await runCommand(registry, cmdName, ...cmdArgs);
    process.exit(0);
}

main();
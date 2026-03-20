import { setUser } from "./config";

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => void;

export type CommandRegistry = {
    commandName: string,
    value: CommandHandler
};

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        console.log("Error: Missing required username argument");
        process.exit(1);
    }
    const username: string = args[0];
    setUser(username)
    console.log(`Username ${username} has been set!`);
};

export function registerCommand(registry: Record<string, CommandHandler>, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
};

export function runCommand(registry: Record<string, CommandHandler>, cmdName: string, ...args: string[]): void {
    if (!registry[cmdName]) {
        throw new Error(`${cmdName} is not a valid command`);
    }
    const command: CommandHandler = registry[cmdName];
    command(cmdName, ...args)
}


export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;

export type CommandRegistry = {
    commandName: string,
    value: CommandHandler
};

export async function registerCommand(registry: Record<string, CommandHandler>, cmdName: string, handler: CommandHandler): Promise<void> {
    registry[cmdName] = handler;
};

export async function runCommand(registry: Record<string, CommandHandler>, cmdName: string, ...args: string[]): Promise<void> {
    if (!registry[cmdName]) {
        throw new Error(`${cmdName} is not a valid command`);
    }
    const command: CommandHandler = registry[cmdName];
    await command(cmdName, ...args);
}


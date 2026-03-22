import { registerCommand } from "./command";
import type { CommandHandler } from "./command";
import type { User } from "./handler";
import { handlerGetUsers, 
    handlerLogin, 
    handlerRegister, 
    handlerReset,
    handlerAgg,
    handlerAddFeed,
    handlerListFeeds,
    handlerAddFollow,
    handlerFollowing,
    handlerUnfollow,
    handlerBrowse
} from "./handler";
import { Config, readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";

// HELPER FUNCTION
type UserCommanderHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>

type middlewareLoggedIn = (handler: UserCommanderHandler) => CommandHandler;

async function middlewareLoggedIn(handler: UserCommanderHandler): Promise<CommandHandler> {
    return async function (cmdName: string, ...args: string[]) {
        const config: Config = readConfig();
        // For handlers with a username argument, use that, otherwise
        // get current logged in username from the .gatorconfig.json file
        const user: string = config.currentUserName;
        const userExists = await getUser(user);
        if (!userExists) {
            console.log(`User ${user} does not exist in database, please register with "npm run start register <username>" first`);
            process.exit(1)
        }
        await handler(cmdName, userExists, ...args);
    };
}
// END HELPER FUNCTION

export async function initRegistry(): Promise<Record<string, CommandHandler>> {
    const registry: Record<string, CommandHandler> = {};
    await registerCommand(registry, "login", handlerLogin);
    await registerCommand(registry, "register", handlerRegister);
    await registerCommand(registry, "reset", handlerReset);
    await registerCommand(registry, "users", handlerGetUsers);
    await registerCommand(registry, "agg", handlerAgg);
    await registerCommand(registry, "addfeed", await middlewareLoggedIn(handlerAddFeed));
    await registerCommand(registry, "feeds", handlerListFeeds);
    await registerCommand(registry, "follow", await middlewareLoggedIn(handlerAddFollow));
    await registerCommand(registry, "following", await middlewareLoggedIn(handlerFollowing));
    await registerCommand(registry, "unfollow", await middlewareLoggedIn(handlerUnfollow));
    await registerCommand(registry, "browse", await middlewareLoggedIn(handlerBrowse));

    return registry;
}

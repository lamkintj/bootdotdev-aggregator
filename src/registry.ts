import { registerCommand } from "./command";
import type { CommandHandler } from "./command";
import { handlerGetUsers, 
    handlerLogin, 
    handlerRegister, 
    handlerReset,
    handlerAgg,
    handlerAddFeed,
    handlerListFeeds,
    handlerAddFollow,
    handlerFollowing,
} from "./handler";

export async function initRegistry(): Promise<Record<string, CommandHandler>> {
    const registry: Record<string, CommandHandler> = {};
    await registerCommand(registry, "login", handlerLogin);
    await registerCommand(registry, "register", handlerRegister);
    await registerCommand(registry, "reset", handlerReset);
    await registerCommand(registry, "users", handlerGetUsers);
    await registerCommand(registry, "agg", handlerAgg);
    await registerCommand(registry, "addfeed", handlerAddFeed);
    await registerCommand(registry, "feeds", handlerListFeeds);
    await registerCommand(registry, "follow", handlerAddFollow);
    await registerCommand(registry, "following", handlerFollowing);

    return registry;
}

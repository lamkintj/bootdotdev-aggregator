import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type Config = {
    dbUrl: string,
    currentUserName: string,
};

export function setUser(username: string): void {
    const config: Config = readConfig(); 
    config.currentUserName = username;
    writeConfig(config);
}

export function readConfig() : Config {
    const fullPath = getConfigFilePAth();
    const data: string = fs.readFileSync(fullPath, "utf-8");
    const rawConfig = JSON.parse(data);
    return validateConfig(rawConfig);
}

// helper functions
function getConfigFilePAth(): string {
    const configFileName: string = ".gatorconfig.json"
    const homeDir: string = os.homedir();
    return path.join(homeDir, configFileName);
};

function writeConfig(config: Config): void {
    const fullPath = getConfigFilePAth();
    const rawConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName,
    };
    const data = JSON.stringify(rawConfig)
    fs.writeFileSync(fullPath, JSON.stringify(rawConfig, null, 2), {
        encoding: "utf-8"
    });
};

function validateConfig(rawConfig: any) {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("db_url is required in config file");
    }
    if (!rawConfig.current_user_name) {rawConfig.current_user_name = "nobody"};
    if (
        !rawConfig.current_user_name ||
        typeof rawConfig.current_user_name !== "string"
    ) {
        throw new Error("current_user_name is required in config file");
    }

    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };

    return config;
}
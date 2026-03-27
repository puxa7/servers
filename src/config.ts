process.loadEnvFile() 

export type APIConfig = {
    fileserverHits: number;
    dbURL: string;
};

envOrThrow("DB_URL");

export const configObject: APIConfig = {
    fileserverHits: 0,
    dbURL: process.env.DB_URL || ""
}

export function envOrThrow(key: string) {
    if (!process.env[key]) {
        throw new Error(`${key} environment variable is required`);
    }
}


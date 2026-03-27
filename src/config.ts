import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

export type APIConfig = {
    fileserverHits: number;
    platform: string;
};

export type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
};

export type Config = APIConfig & { db: DBConfig };

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/generated_files",
};

envOrThrow("DB_URL");
envOrThrow("PLATFORM");

export const config: Config = {
    fileserverHits: 0,
    platform: process.env.PLATFORM || "dev",
    db: {
        url: process.env.DB_URL || "",
        migrationConfig: migrationConfig,
    }
};

export function envOrThrow(key: string) {
    if (!process.env[key]) {
        throw new Error(`${key} environment variable is required`);
    }
}
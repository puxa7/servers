import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { configObject } from "../config.js";

const conn = postgres(configObject.dbURL);
export const db = drizzle(conn, { schema });
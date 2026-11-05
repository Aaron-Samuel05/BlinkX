import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  return drizzle(neon(url), { schema });
}

type Db = ReturnType<typeof connect>;
let instance: Db | undefined;

// Connects on first use, so `next build` works without database credentials.
export const db = new Proxy({} as Db, {
  get(_, prop) {
    instance ??= connect();
    const value = Reflect.get(instance, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };

// Usage: npm run create-admin -- <email> <name>   (password is prompted, not echoed)
import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";

function promptHidden(question: string) {
  return new Promise<string>((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    (rl as any)._writeToOutput = (s: string) => { if (s.includes(question)) process.stdout.write(s); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write("\n"); resolve(answer); });
  });
}

async function main() {
  const [email, ...nameParts] = process.argv.slice(2);
  if (!email || !email.includes("@")) throw new Error("Usage: npm run create-admin -- <email> <name>");
  const name = nameParts.join(" ") || email.split("@")[0];
  const password = process.env.ADMIN_PASSWORD || (await promptHidden("Password (min 10 chars): "));
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");

  const { db, schema } = await import("../lib/db");
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(schema.admins)
    .values({ email: email.toLowerCase(), name, passwordHash })
    .onConflictDoUpdate({ target: schema.admins.email, set: { name, passwordHash } });
  console.log(`Admin ready: ${email.toLowerCase()}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });

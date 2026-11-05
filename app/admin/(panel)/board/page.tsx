import { boardCards } from "@/lib/admin-data";
import Board from "./Board";

export const metadata = { title: "Board" };

export default async function BoardPage() {
  return <Board initial={await boardCards()} />;
}

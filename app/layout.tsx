import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:"Blink X — 12 Reels. 24 Hours.",
  description:"Blink X shoots and delivers 12 social-ready reels in 24 hours.",
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
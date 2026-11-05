import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./admin.css";

const font = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Blink X Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:"BlinkX",
  description:"Blink X shoots and delivers 18 social-ready reels in 24 hours.",
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; if (location.hash) return; const nav = performance.getEntriesByType("navigation")[0]; if (!nav || nav.type !== "reload") return; const reset = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" }); let tries = 0; const timer = setInterval(() => { reset(); if (++tries >= 20) clearInterval(timer); }, 50); reset(); })();`,
          }}
        />
        {children}
      </body></html>;
}

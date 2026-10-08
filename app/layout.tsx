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
            __html: `if ("scrollRestoration" in history) history.scrollRestoration = "manual"; if (!location.hash) window.scrollTo(0, 0);`,
          }}
        />
        {children}
      </body></html>;
}

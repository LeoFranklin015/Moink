import "./globals.css";
import { AirkitProvider } from "@/components/AirkitProvider";

export const metadata = { title: "AIRKit App" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AirkitProvider>{children}</AirkitProvider>
      </body>
    </html>
  );
}

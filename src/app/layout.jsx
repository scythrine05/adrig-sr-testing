import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
import { Providers } from "./provider";
import { Toaster } from "../components/ui/toaster";

export const metadata = {
  title: "Next App",
  description: "Created By Adrig Ai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} `}>
        <Toaster />
        <Providers>{children}</Providers>
        {/* <h1>duiwd</h1> */}
      </body>
    </html>
  );
}

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/lib/auth-context.js";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Civic Issue Reporter",
  description: "Report and track civic issues in your community",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
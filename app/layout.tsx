import "./styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Report Management System",
  description: "Nursery and Primary report management"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}

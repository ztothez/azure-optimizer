import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azure Optimizer",
  description: "Multi-agent infrastructure analysis for Terraform and operational metrics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

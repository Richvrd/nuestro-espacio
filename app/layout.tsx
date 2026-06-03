import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { ToastProvider } from "@/contexts/ToastContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export const metadata: Metadata = {
  title: "Nuestro Espacio ✦",
  description: "Un espacio especial para nostros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lora:ital,wght@0,300;0,400;1,300;1,400&family=IBM+Plex+Mono:wght@200;300;400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NextTopLoader
          color="var(--gold, #c9a96e)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px rgba(201,169,110,0.4), 0 0 5px rgba(201,169,110,0.2)"
        />
        <ToastProvider>
          <LoadingProvider>
            {children}
            <ToastContainer />
            <LoadingOverlay />
          </LoadingProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

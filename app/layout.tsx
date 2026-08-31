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
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Great+Vibes&family=JetBrains+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NextTopLoader
          color="var(--coral, #f2765f)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px rgba(242,118,95,0.4), 0 0 5px rgba(242,118,95,0.2)"
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

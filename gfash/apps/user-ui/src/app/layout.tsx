import Header from "@/shared/widgets/header";
import "./global.css";
import Providers from "./providers";

export const metadata = {
  title: "Gfash user-ui",
  description: "Gfash",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}

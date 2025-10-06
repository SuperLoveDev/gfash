import Header from "@/shared/widgets/header";
import "./global.css";

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
        <Header />
        {children}
      </body>
    </html>
  );
}

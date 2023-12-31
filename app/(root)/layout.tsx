import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Bottombar from "@/components/shared/BottomSideBar";
import LeftSidebar from "@/components/shared/LeftSideBar";
import Topbar from "@/components/shared/Topbar";
import RightSideBar from "@/components/shared/RightSidebar";
import Footer from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toaster";
const inter = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Team UP",
  description: "A platform to collaborate and do magical stuff!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-slate-100  `}>
          <Topbar />
          <main className="flex flex-row justify-between scroll-smooth w-full ">
            <LeftSidebar />
            <div className="w-full">
              <section className="main-container w-full  ">
                <div className="  overflow-hidden w-full mx-w-4xl ">
                  {children}
                  <Toaster  />
                </div>
              </section>
              <div className="footer -z-10">
                <Footer />
              </div>
            </div>

            <div className=" hidden lg:block">
              <RightSideBar />
            </div>
          </main>

          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  );
}

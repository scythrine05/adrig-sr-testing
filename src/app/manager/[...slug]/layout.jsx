import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import { SidebarManagerMenu } from "../../../components/custom/SidebarManagerMenu";
import Footer from "../../../components/ui/footer";

export default async function RootLayout({ children }) {
  return (
    <>
      <main
        className={`${inter.className} w-full h-screen grid grid-cols-10 gap-6 mt-4 px-6 overflow-hidden`}
      >
        <div className="absolute right-20 top-12">
          {/* <SignedIn>
          <UserButton />
        </SignedIn> */}
        </div>

        <SidebarManagerMenu />

        {/* <div className="w-[20%]"></div> */}
        <main className="col-span-10 h-full overflow-y-scroll hide-scrollbar">
          {/* <NavBar></NavBar> */}
          {children}
          <Footer />
        </main>
      </main>
    </>
  );
}

import { Inter } from "next/font/google";
import { SidebarMenu } from "../../components/custom/SidebarMenu";
import NavBar from "../../components/custom/NavBar";
const inter = Inter({ subsets: ["latin"] });
import { getUser } from "../../lib/auth";

export default async function RootLayout({ children }) {
  const session = await getUser();

  return (
    <main
      className={`${inter.className} w-full h-screen grid grid-cols-10 gap-6 mt-4 px-6 overflow-hidden`}
    >
      <div className="absolute right-20 top-12">
        {/* <SignedIn>
          <UserButton />
        </SignedIn> */}
      </div>

      {session.user.role != "admin" && <SidebarMenu />}

      {/* <div className="w-[20%]"></div> */}
      <main className="col-span-8 h-full overflow-y-scroll hide-scrollbar">
        <NavBar></NavBar>
        {children}
      </main>
    </main>
  );
}

export default function AuthLayout({ children }) {
  return (
    <main
      className={` w-full h-screen bg-[url('/assests/irctc.png')] bg-no-repeat bg-cover bg-right-top scale flex justify-center items-center`}
    >
      {children}
    </main>
  );
}

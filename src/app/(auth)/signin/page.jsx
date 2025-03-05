import { Signin } from "../../../components/custom/Signin";
import { redirect } from "next/navigation";
import { getUser } from "../../../lib/auth";

export default async function SignInPage() {
  const session = await getUser();
  if (session != null) {
    redirect("/");
  }
  return <Signin />;
}

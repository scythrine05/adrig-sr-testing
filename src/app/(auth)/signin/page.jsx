import { Signin } from "../../../components/custom/Signin";
import { redirect } from "next/navigation";
import { getUser } from "../../../lib/auth";
export default async function Login() {
  const session = await getUser();
  if (session != null) {
    redirect("/form");
  }
  return <Signin></Signin>;
}

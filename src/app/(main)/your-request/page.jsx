import { WelcomeScreenContainerUser } from "@/components/custom/home-admin";
import { YourRequest } from "@/components/custom/your-request";

export default async function Home() {
  // const data = await getData();

  return (
    <>
      {/* <p>{data[0]?.winery}</p> */}
      <YourRequest />
    </>
  );
}

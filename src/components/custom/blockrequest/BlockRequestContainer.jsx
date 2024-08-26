import currentUser from "../../../app/actions/user";
import RequestForm from "./RequestForm";

export default async function FormTop() {
  const user = await currentUser();

  return (
    <div className="m-14">
      <RequestForm user={user}></RequestForm>
    </div>
  );
}

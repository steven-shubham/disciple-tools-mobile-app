import useRequest from "hooks/use-request";
import { MyUserDataURL } from "constants/urls";

const useMyUser = () => {
  return useRequest({ request: { url: MyUserDataURL, method: "GET" } });
};
export default useMyUser;

import useSettings from "hooks/use-settings";
import useMyUser from "hooks/use-my-user";

import { TypeConstants } from "constants";
import { REGISTERED } from "constants";

// TODO: merge into use-types?
const useCustomPostTypes = () => {
  const { settings } = useSettings();
  const { data: userData } = useMyUser();

  if (!settings?.post_types) return null;

  let role = Object.values(userData?.profile?.roles ?? {})?.[0] ?? "";
  if (role === REGISTERED) {
    return null;
  }

  const mapPostTypes = (postTypes) => {
    if (Array.isArray(postTypes)) return postTypes;
    if (typeof postTypes === "object") return Object.keys(postTypes);
    return [];
  };

  const availablePostTypes = mapPostTypes(settings.post_types);
  const ignorePostTypes = [TypeConstants.PEOPLE_GROUP];
  const corePostTypes = [TypeConstants.CONTACT, TypeConstants.GROUP];
  const filteredCustomPostTypes = availablePostTypes?.filter(
    (postType) =>
      !corePostTypes.includes(postType) && !ignorePostTypes.includes(postType)
  );
  return {
    customPostTypes: filteredCustomPostTypes,
  };
};
export default useCustomPostTypes;

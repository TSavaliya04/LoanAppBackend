import guardedInstance from "../instances/guardedInstance";
import { ProfileFormPayloadData } from "../models/ProfileFormTypes";

export const profileApi = {
  profile: async (payload: ProfileFormPayloadData) => {
    const url = `/user/UpdateProfile`;

    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "Profile" && value instanceof File) {
          formData.append("Profile", value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const { data } = await guardedInstance.put(url, formData);
    return data;
  },

  getProfile: async () => {
    const url = `/user/GetUserProfile`;
    const { data } = await guardedInstance.get(url);
    return data;
  },
};

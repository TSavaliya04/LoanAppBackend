import { useMutation, useQuery } from "@tanstack/react-query";
import { profileApi } from "../network/getProfile";

export const useCreateProfile = () => {
  return useMutation({
    mutationFn: profileApi.profile,
  });
};

export const useGetProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    enabled,
  });
};

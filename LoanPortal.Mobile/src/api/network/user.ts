import guardedInstance from "../instances/guardedInstance";

export function getOfficeUser(token: string) {
  return guardedInstance.post(`/user/validateUserToken?token=${token}`);
}
export interface User {
  token: string;
  displayName: string;
  firstName: string;
  lastName: string;
  userId: string;
  phone: string;
  email: string;
}

export interface AddRegisterUserPayload {
  // id1: string;
  firstname: string;
  lastname: string;
  // username: string;
  email: string;
  phone: string;
  password: string;
}
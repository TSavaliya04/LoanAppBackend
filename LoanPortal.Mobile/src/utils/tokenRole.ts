import { jwtDecode, JwtPayload } from "jwt-decode";

export const BORROWER_ROLE = 3;

type RoleJwtPayload = JwtPayload & {
  isAdmin?: boolean;
  Role?: number | string;
};

// Single source of truth for the role claims in the ID token
export const getTokenRoles = (token: string) => {
  const decoded = jwtDecode<RoleJwtPayload>(token);
  return {
    isAdmin: decoded.isAdmin ?? false,
    isBorrower: Number(decoded.Role) === BORROWER_ROLE,
  };
};

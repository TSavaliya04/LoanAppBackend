export interface User {
  token: string;
  refreshToken: string;
  displayName: string;
  firstName: string;
  lastName: string;
  userId: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  isBorrower?: boolean;
}

export interface UserList {
  agentName: string;
  company: string;
  email: string;
  lastLogin: string;
  quotesThisWeek: number;
  status: string;
}

export interface UserManagementPageGridCustom {
  users: UserList[];
  totalCount: number;
  totalPages: number;
}

export interface userManagementListResponse {
  data: userManagementList;
}
export interface userManagementList {
  users: UserList[];
  totalCount: number;
  totalPages: number;
}

export interface AddRegisterUserPayload {
  // id1: string;
  firstname: string;
  lastname: string;
  // username: string;
  email: string;
  phone: string;
  password: string;
  companyId: string;
}

export interface CompanyOption {
  id: string;
  name: string;
  address?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive?: boolean;
  createdAt?: string;
}
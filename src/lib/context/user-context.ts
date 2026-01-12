import { createContext } from 'react';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  userType: 'business_owner' | 'agency';
  industry?: string;
}

export interface OrgContext {
  id: string;
  name: string;
  userId: string;
}

export interface UserContextType {
  user: CurrentUser | null;
  currentOrg: OrgContext | null;
  accessibleOrgs: OrgContext[];
  isLoading: boolean;
  switchOrg: (orgId: string) => Promise<void>;
  setCurrentOrg: (org: OrgContext) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

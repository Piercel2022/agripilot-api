export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

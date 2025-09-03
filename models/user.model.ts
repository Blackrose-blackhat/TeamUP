export interface User {
  _id: string; // ObjectId string
  email: string , ;
  username?: string;
  profilePhoto?: string;
  skills?: string[];
  year?: number;
  gender?: string;
  college?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  preferredRoles?: string[];
  interests?: string[];
  location?: string;
  availability?: string;
  onboarded: boolean; // true if completed onboarding
}

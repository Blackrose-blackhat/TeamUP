// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:string;
      _id: string;
      isNewUser?: boolean;
      username?: string;
      profilePhoto?: string;
      skills?: string[];
      year?: string;
      gender?: string;
      college?: string;
      bio?: string;
      linkedin?: string;
      github?: string;
      preferredRoles?: string[];
      interests?: string[];
      location?: string;
      availability?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    onboarded?: boolean;
    username?: string;
    profilePhoto?: string;
    skills?: string[];
    year?: string;
    gender?: string;
    college?: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    preferredRoles?: string[];
    interests?: string[];
    location?: string;
    availability?: string;
  }
}

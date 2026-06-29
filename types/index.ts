export type UserRole = "student" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  lastSeen: Date;
  progress: Record<string, boolean>;
  ratings: Record<string, number>;
}

export type CourseType = "bracu" | "external";

export interface Course {
  id: string;
  type: CourseType;
  title: string;
  department: string;
  description: string;
  thumbnail?: string;
  accentColor: string;
  published: boolean;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
  code?: string;
  credits?: number;
  semester?: string;
  category?: string;
  provider?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
}

export interface Faculty {
  id: string;
  courseId: string;
  name: string;
  section?: string;
  playlistUrl: string;
  videoCount: number;
  addedAt: Date;
}

export interface Video {
  id: string;
  facultyId: string;
  courseId: string;
  youtubeId: string;
  title: string;
  duration: string;
  order: number;
  week?: number;
  addedAt: Date;
}

export type MaterialType = "slide" | "note" | "paper" | "resource";

export interface Material {
  id: string;
  courseId: string;
  type: MaterialType;
  name: string;
  storageUrl: string;
  sizeKb: number;
  facultyId?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Supervisor {
  id: string;
  name: string;
  department: string;
  designation: string;
  researchAreas: string[];
  email?: string;
  image?: string;
}

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
    };
  }
  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: UserRole;
  }
}
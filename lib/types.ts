// Type definitions for the application's data structures

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubFolder {
  id: string;
  name: string;
  icon?: string; // Icon identifier/name
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string; // Icon identifier/name
  subFolders: SubFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface Space {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}


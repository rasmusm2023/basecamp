// Type definitions for the application's data structures

export interface Bookmark {
  id: string;
  url: string;
  name: string; // Required, initially from page title
  description?: string; // Optional, initially from website
  image?: string; // Required, initially from website snapshot, can be user-uploaded
  tags?: string[]; // Optional, array of tags
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string; // Icon identifier/name
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  icon?: string; // Icon identifier/name
  folders: Folder[];
  createdAt: string;
  updatedAt: string;
}

export interface Space {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Buddy {
  name: string;
  personality: string;
  greeting: string;
  avatar: string;
  voice?: string;
}

export interface SpaceApp {
  id: string;
  name: string;
  component: string;
  icon: string;
}

export interface Space {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  buddy: Buddy;
  apps: SpaceApp[];
  createdAt: string;
}

export interface SpaceData {
  [key: string]: unknown;
}

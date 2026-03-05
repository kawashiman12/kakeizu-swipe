export interface Person {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthYear?: number;
  birthDate?: string;
  deathYear?: number;
  deathDate?: string;
  isDeceased: boolean;
  memo?: string;
  birthPlace?: string;
}

export interface Relationship {
  id: string;
  type: "parent" | "spouse";
  fromId: string;
  toId: string;
  divorced?: boolean;
}

export interface Tree {
  familyName?: string;
  persons: Person[];
  relationships: Relationship[];
  updatedAt: string;
}

export type SwipeDirection = "right" | "left" | "up";

export type UndoAction =
  | { type: "add-person"; personId: string }
  | { type: "add-relationship"; relationshipId: string }
  | { type: "remove-person"; person: Person; relationships: Relationship[] }
  | { type: "remove-relationship"; relationship: Relationship }
  | { type: "update-person"; before: Person };

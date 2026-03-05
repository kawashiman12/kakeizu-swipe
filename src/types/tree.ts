export interface Person {
  id: string;
  name: string;
  birthYear?: number;
  memo?: string;
}

export interface Relationship {
  id: string;
  type: "parent" | "spouse";
  fromId: string; // parent or spouse A
  toId: string; // child or spouse B
}

export interface Tree {
  persons: Person[];
  relationships: Relationship[];
  updatedAt: string; // ISO string
}

export type SwipeDirection = "right" | "left" | "up";

export interface EditorState {
  /** Queue of person IDs yet to be confirmed */
  queue: string[];
  /** Index into the queue */
  currentIndex: number;
}

export type UndoAction =
  | { type: "add-person"; personId: string }
  | { type: "skip-person"; personId: string }
  | { type: "add-relationship"; relationshipId: string }
  | { type: "remove-person"; person: Person }
  | { type: "remove-relationship"; relationship: Relationship };

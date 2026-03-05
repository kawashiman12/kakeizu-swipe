import { Tree } from "@/types/tree";

const STORAGE_KEY = "kakeizu_tree_v1";

export function loadTree(): Tree | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Tree;
  } catch {
    return null;
  }
}

export function saveTree(tree: Tree): void {
  if (typeof window === "undefined") return;
  const updated: Tree = { ...tree, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearTree(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportTreeJSON(tree: Tree): string {
  return JSON.stringify(tree, null, 2);
}

export function importTreeJSON(json: string): Tree {
  const parsed = JSON.parse(json);
  if (!parsed.persons || !parsed.relationships) {
    throw new Error("Invalid tree format");
  }
  return parsed as Tree;
}

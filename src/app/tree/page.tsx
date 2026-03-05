"use client";

import Link from "next/link";
import { useTree } from "@/hooks/useTree";
import { FamilyTreeFullscreen } from "@/components/FamilyTree";

export default function TreePage() {
  const { tree, loaded } = useTree();

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-[var(--color-text-dim)]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <Link
          href="/editor"
          className="text-sm text-[var(--color-text-dim)] active:opacity-70"
        >
          ← エディター
        </Link>
        <h1 className="font-bold">
          🌳 {tree.familyName ? `${tree.familyName}家` : "家系図"}
        </h1>
        <span className="text-sm text-[var(--color-text-dim)]">
          {tree.persons.length}人
        </span>
      </header>

      <div className="flex-1 overflow-auto">
        <FamilyTreeFullscreen
          persons={tree.persons}
          relationships={tree.relationships}
          familyName={tree.familyName}
        />
      </div>
    </div>
  );
}

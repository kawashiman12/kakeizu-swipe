"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Person, Relationship } from "@/types/tree";

interface MiniTreeProps {
  persons: Person[];
  relationships: Relationship[];
  highlightId?: string;
  onPersonTap?: (personId: string) => void;
}

interface TreeNode {
  person: Person;
  children: TreeNode[];
  spouse?: Person;
}

function buildTreeNodes(
  persons: Person[],
  relationships: Relationship[],
): TreeNode[] {
  const childIds = new Set(
    relationships.filter((r) => r.type === "parent").map((r) => r.toId),
  );
  const roots = persons.filter((p) => !childIds.has(p.id));

  function buildNode(person: Person): TreeNode {
    const spouseRel = relationships.find(
      (r) =>
        r.type === "spouse" &&
        (r.fromId === person.id || r.toId === person.id),
    );
    const spouse = spouseRel
      ? persons.find(
          (p) =>
            p.id ===
            (spouseRel.fromId === person.id
              ? spouseRel.toId
              : spouseRel.fromId),
        )
      : undefined;

    const childRels = relationships.filter(
      (r) => r.type === "parent" && r.fromId === person.id,
    );
    const children = childRels
      .map((r) => persons.find((p) => p.id === r.toId))
      .filter((p): p is Person => !!p)
      .map((child) => buildNode(child));

    return { person, children, spouse };
  }

  if (roots.length === 0 && persons.length > 0) {
    return persons.map((p) => buildNode(p));
  }
  return roots.map((r) => buildNode(r));
}

function TreeNodeView({
  node,
  highlightId,
  onTap,
  depth = 0,
}: {
  node: TreeNode;
  highlightId?: string;
  onTap?: (id: string) => void;
  depth?: number;
}) {
  const isHighlighted = node.person.id === highlightId;
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        onClick={() => onTap?.(node.person.id)}
        className={`my-0.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-left text-sm transition-colors ${
          isHighlighted
            ? "bg-[var(--color-primary)] font-bold"
            : "hover:bg-[var(--color-text-dim)]/10"
        }`}
      >
        <span className="text-xs opacity-60">
          {depth === 0 ? "👤" : "└"}
        </span>
        <span className="truncate">{node.person.name}</span>
        {node.spouse && (
          <span className="text-xs text-[var(--color-accent)]">
            💑 {node.spouse.name}
          </span>
        )}
      </button>
      {node.children.map((child) => (
        <TreeNodeView
          key={child.person.id}
          node={child}
          highlightId={highlightId}
          onTap={onTap}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function MiniTree({
  persons,
  relationships,
  highlightId,
  onPersonTap,
}: MiniTreeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const nodes = buildTreeNodes(persons, relationships);

  return (
    <div className="rounded-2xl bg-[var(--color-card)] shadow-lg">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
      >
        <span>🌳 家系図 ({persons.length}人)</span>
        <span className="text-xs text-[var(--color-text-dim)]">
          {collapsed ? "▶ 展開" : "▼ 折りたたみ"}
        </span>
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto px-3 pb-3">
              {nodes.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--color-text-dim)]">
                  まだ人物が登録されていません
                </p>
              ) : (
                nodes.map((node) => (
                  <TreeNodeView
                    key={node.person.id}
                    node={node}
                    highlightId={highlightId}
                    onTap={onPersonTap}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Person, Relationship } from "@/types/tree";

interface RelationshipModalProps {
  open: boolean;
  currentPerson: Person | null;
  allPersons: Person[];
  existingRelationships: Relationship[];
  onAdd: (type: "parent" | "spouse", targetId: string) => void;
  onClose: () => void;
}

export function RelationshipModal({
  open,
  currentPerson,
  allPersons,
  existingRelationships,
  onAdd,
  onClose,
}: RelationshipModalProps) {
  if (!currentPerson) return null;

  const alreadyRelated = new Set(
    existingRelationships
      .filter(
        (r) => r.fromId === currentPerson.id || r.toId === currentPerson.id,
      )
      .flatMap((r) => [r.fromId, r.toId]),
  );

  const candidates = allPersons.filter(
    (p) => p.id !== currentPerson.id && !alreadyRelated.has(p.id),
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-lg rounded-t-3xl bg-[var(--color-card)] px-6 pb-8 pt-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--color-text-dim)]/50" />
            <h3 className="mb-1 text-lg font-bold">
              関係を追加
            </h3>
            <p className="mb-4 text-sm text-[var(--color-text-dim)]">
              {currentPerson.name} との関係を選択してください
            </p>

            {candidates.length === 0 ? (
              <p className="py-8 text-center text-[var(--color-text-dim)]">
                関係を追加できる人物がいません。
                <br />
                先に人物を登録してください。
              </p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {candidates.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between rounded-xl bg-[var(--color-bg)] p-3"
                  >
                    <div>
                      <div className="font-medium">{person.name}</div>
                      {person.birthYear && (
                        <div className="text-xs text-[var(--color-text-dim)]">
                          {person.birthYear}年生
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAdd("parent", person.id)}
                        className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium transition-transform active:scale-95"
                      >
                        親子
                      </button>
                      <button
                        onClick={() => onAdd("spouse", person.id)}
                        className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium transition-transform active:scale-95"
                      >
                        配偶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl border-2 border-[var(--color-text-dim)]/30 py-3 font-medium transition-transform active:scale-95"
            >
              閉じる
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

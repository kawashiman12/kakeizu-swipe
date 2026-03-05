"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useTree } from "@/hooks/useTree";
import { SwipeCard } from "@/components/SwipeCard";
import { PersonForm } from "@/components/PersonForm";
import { RelationshipModal } from "@/components/RelationshipModal";
import { MiniTree } from "@/components/MiniTree";
import { DEMO_TREE } from "@/lib/demo";
import type { Person } from "@/types/tree";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    tree,
    loaded,
    addPerson,
    addRelationship,
    undo,
    canUndo,
    resetTree,
    replaceTree,
  } = useTree();

  const [mode, setMode] = useState<"input" | "review">("input");
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [currentEditPerson, setCurrentEditPerson] = useState<Person | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const formData = useRef<{ name: string; birthYear?: number; memo?: string }>({
    name: "",
  });

  useEffect(() => {
    if (!loaded) return;
    const isNew = searchParams.get("new") === "1";
    const isDemo = searchParams.get("demo") === "1";
    if (isNew) {
      resetTree();
      router.replace("/editor");
    } else if (isDemo) {
      replaceTree(DEMO_TREE);
      setMode("review");
      router.replace("/editor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  }, []);

  function handleSwipe(direction: "right" | "left" | "up") {
    if (mode === "input") {
      handleInputSwipe(direction);
    } else {
      handleReviewSwipe(direction);
    }
  }

  function handleInputSwipe(direction: "right" | "left" | "up") {
    const { name, birthYear, memo } = formData.current;

    if (direction === "right") {
      if (!name.trim()) {
        showToast("名前を入力してください");
        return;
      }
      const person = addPerson({
        name: name.trim(),
        birthYear,
        memo,
      });
      formData.current = { name: "" };
      showToast(`${person.name} を追加しました`);
      setCurrentEditPerson(person);
    } else if (direction === "left") {
      formData.current = { name: "" };
      showToast("スキップしました");
    } else if (direction === "up") {
      if (!name.trim()) {
        showToast("先に名前を入力してください");
        return;
      }
      const person = addPerson({
        name: name.trim(),
        birthYear,
        memo,
      });
      formData.current = { name: "" };
      setCurrentEditPerson(person);
      setRelationModalOpen(true);
    }
  }

  function handleReviewSwipe(direction: "right" | "left" | "up") {
    const reviewPersons = getReviewPersons();
    const person = reviewPersons[reviewIndex];
    if (!person) return;

    if (direction === "right") {
      showToast(`${person.name} を確認しました`);
      setReviewIndex((i) => Math.min(i + 1, reviewPersons.length));
    } else if (direction === "left") {
      setSkippedIds((prev) => [...prev, person.id]);
      showToast("後で確認します");
      setReviewIndex((i) => Math.min(i + 1, reviewPersons.length));
    } else if (direction === "up") {
      setCurrentEditPerson(person);
      setRelationModalOpen(true);
    }
  }

  function getReviewPersons() {
    return tree.persons.filter((p) => !skippedIds.includes(p.id));
  }

  function handleAddRelation(type: "parent" | "spouse", targetId: string) {
    if (!currentEditPerson) return;
    addRelationship(type, currentEditPerson.id, targetId);
    showToast(
      `${type === "parent" ? "親子" : "配偶"}関係を追加しました`,
    );
    setRelationModalOpen(false);
  }

  function handleTreePersonTap(personId: string) {
    if (mode === "review") {
      const reviewPersons = getReviewPersons();
      const idx = reviewPersons.findIndex((p) => p.id === personId);
      if (idx !== -1) setReviewIndex(idx);
    }
    const person = tree.persons.find((p) => p.id === personId);
    if (person) setCurrentEditPerson(person);
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-[var(--color-text-dim)]">読み込み中...</div>
      </div>
    );
  }

  const reviewPersons = getReviewPersons();
  const currentReviewPerson = reviewPersons[reviewIndex] ?? null;
  const isFinished = mode === "review" && reviewIndex >= reviewPersons.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <Link
          href="/"
          className="text-sm text-[var(--color-text-dim)] active:opacity-70"
        >
          ← 戻る
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode(mode === "input" ? "review" : "input");
              setReviewIndex(0);
            }}
            className="rounded-lg bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium"
          >
            {mode === "input" ? "一覧" : "追加"}
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="rounded-lg bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium disabled:opacity-30"
          >
            ↩ 戻す
          </button>
        </div>
      </header>

      {/* Swipe hints */}
      <div className="flex justify-center gap-4 px-4 pb-2 text-xs text-[var(--color-text-dim)]">
        <span>← スキップ</span>
        <span>↑ 関係追加</span>
        <span>保存 →</span>
      </div>

      {/* Card area */}
      <div className="relative flex-1 px-4">
        {mode === "input" ? (
          <SwipeCard key={`input-${tree.persons.length}`} onSwipe={handleSwipe}>
            <h2 className="mb-4 text-center text-lg font-bold">
              新しい人物を追加
            </h2>
            <PersonForm
              onChange={(data) => {
                formData.current = data;
              }}
            />
            <p className="mt-4 text-center text-xs text-[var(--color-text-dim)]">
              {tree.persons.length}人登録済み
            </p>
          </SwipeCard>
        ) : isFinished ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="text-4xl">🎉</div>
            <p className="text-lg font-bold">全員確認しました！</p>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("input")}
                className="rounded-xl bg-[var(--color-primary)] px-6 py-3 font-medium"
              >
                人物を追加
              </button>
              {skippedIds.length > 0 && (
                <button
                  onClick={() => {
                    setSkippedIds([]);
                    setReviewIndex(0);
                  }}
                  className="rounded-xl border-2 border-[var(--color-text-dim)] px-6 py-3 font-medium"
                >
                  スキップした人を確認
                </button>
              )}
            </div>
          </div>
        ) : currentReviewPerson ? (
          <SwipeCard
            key={`review-${currentReviewPerson.id}-${reviewIndex}`}
            onSwipe={handleSwipe}
          >
            <div className="text-center">
              <div className="mb-2 text-4xl">👤</div>
              <h2 className="text-xl font-bold">{currentReviewPerson.name}</h2>
              {currentReviewPerson.birthYear && (
                <p className="text-[var(--color-text-dim)]">
                  {currentReviewPerson.birthYear}年生まれ
                </p>
              )}
              {currentReviewPerson.memo && (
                <p className="mt-2 rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm">
                  {currentReviewPerson.memo}
                </p>
              )}
              <div className="mt-4 space-y-1 text-sm text-[var(--color-text-dim)]">
                {tree.relationships
                  .filter(
                    (r) =>
                      r.fromId === currentReviewPerson.id ||
                      r.toId === currentReviewPerson.id,
                  )
                  .map((r) => {
                    const otherId =
                      r.fromId === currentReviewPerson.id ? r.toId : r.fromId;
                    const other = tree.persons.find((p) => p.id === otherId);
                    const label =
                      r.type === "spouse"
                        ? "💑 配偶者"
                        : r.fromId === currentReviewPerson.id
                          ? "👶 子"
                          : "👨 親";
                    return (
                      <div key={r.id}>
                        {label}: {other?.name ?? "不明"}
                      </div>
                    );
                  })}
              </div>
              <p className="mt-4 text-xs text-[var(--color-text-dim)]">
                {reviewIndex + 1} / {reviewPersons.length}
              </p>
            </div>
          </SwipeCard>
        ) : null}
      </div>

      {/* Mini tree */}
      <div className="px-4 pb-4 pt-2">
        <MiniTree
          persons={tree.persons}
          relationships={tree.relationships}
          highlightId={
            mode === "review" ? currentReviewPerson?.id : currentEditPerson?.id
          }
          onPersonTap={handleTreePersonTap}
        />
      </div>

      {/* Relationship modal */}
      <RelationshipModal
        open={relationModalOpen}
        currentPerson={currentEditPerson}
        allPersons={tree.persons}
        existingRelationships={tree.relationships}
        onAdd={handleAddRelation}
        onClose={() => setRelationModalOpen(false)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-[var(--color-card)] px-6 py-2 text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="text-[var(--color-text-dim)]">読み込み中...</div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}

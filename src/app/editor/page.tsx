"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useTree } from "@/hooks/useTree";
import { PersonForm } from "@/components/PersonForm";
import { RelationshipModal } from "@/components/RelationshipModal";
import { FamilyTree } from "@/components/FamilyTree";
import { DEMO_TREE } from "@/lib/demo";
import type { Person } from "@/types/tree";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    tree,
    loaded,
    setFamilyName,
    addPerson,
    updatePerson,
    removePerson,
    addRelationship,
    removeRelationship,
    undo,
    canUndo,
    resetTree,
    replaceTree,
  } = useTree();

  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editPersonId, setEditPersonId] = useState<string | null>(null);
  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [relationModalTarget, setRelationModalTarget] = useState<Person | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const formData = useRef<Omit<Person, "id">>({
    name: "",
    gender: "male",
    isDeceased: false,
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
      router.replace("/editor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const editPerson = tree.persons.find((p) => p.id === editPersonId) ?? null;

  function handleSave() {
    const d = formData.current;
    if (!d.name.trim()) {
      showToast("名前を入力してください");
      return;
    }
    const person = addPerson({ ...d, name: d.name.trim() });
    formData.current = { name: "", gender: "male", isDeceased: false };
    setFormKey((k) => k + 1);
    showToast(`${person.name} を追加しました`);
  }

  function handleSaveAndRelation() {
    const d = formData.current;
    if (!d.name.trim()) {
      showToast("先に名前を入力してください");
      return;
    }
    const person = addPerson({ ...d, name: d.name.trim() });
    formData.current = { name: "", gender: "male", isDeceased: false };
    setFormKey((k) => k + 1);
    setRelationModalTarget(person);
    setRelationModalOpen(true);
  }

  function handleUpdatePerson() {
    if (!editPersonId) return;
    const d = formData.current;
    if (!d.name.trim()) {
      showToast("名前を入力してください");
      return;
    }
    updatePerson(editPersonId, { ...d, name: d.name.trim() });
    showToast("更新しました");
  }

  function handleDeletePerson() {
    if (!editPersonId || !editPerson) return;
    if (!window.confirm(`${editPerson.name} を削除しますか？関連する関係もすべて削除されます。`)) return;
    const name = editPerson.name;
    removePerson(editPersonId);
    setEditPersonId(null);
    setMode("add");
    showToast(`${name} を削除しました`);
  }

  function handleTreePersonTap(personId: string) {
    setEditPersonId(personId);
    setMode("edit");
    setFormKey((k) => k + 1);
  }

  function handleAddRelation(type: "parent" | "spouse", fromId: string, toId: string) {
    addRelationship(type, fromId, toId);
    showToast(`${type === "parent" ? "親子" : "配偶"}関係を追加しました`);
    setRelationModalOpen(false);
  }

  function handleRemoveRelation(relId: string) {
    removeRelationship(relId);
    showToast("関係を削除しました");
  }

  const editPersonRelationships = editPerson
    ? tree.relationships.filter(
        (r) => r.fromId === editPerson.id || r.toId === editPerson.id,
      )
    : [];

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-[var(--color-text-dim)]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pb-1 pt-3">
        <Link href="/" className="text-sm text-[var(--color-text-dim)]">← 戻る</Link>
        <input
          type="text"
          value={tree.familyName ?? ""}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="〇〇家"
          className="w-20 rounded-lg bg-[var(--color-card)] px-2 py-1 text-center text-sm font-bold outline-none"
        />
        <div className="flex gap-2">
          <Link href="/tree" className="rounded-lg bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium">🌳</Link>
          <button
            onClick={() => { setMode("add"); setEditPersonId(null); setFormKey((k) => k + 1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === "add" ? "bg-[var(--color-primary)]" : "bg-[var(--color-card)]"}`}
          >
            + 追加
          </button>
          <button onClick={undo} disabled={!canUndo} className="rounded-lg bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium disabled:opacity-30">
            ↩
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {mode === "add" ? (
          /* ===== ADD MODE ===== */
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl bg-[var(--color-card)] p-5 shadow-xl">
              <h2 className="mb-3 text-center font-bold">新しい人物を追加</h2>
              <PersonForm
                key={formKey}
                onChange={(data) => { formData.current = data; }}
              />
              <p className="mt-2 text-center text-xs text-[var(--color-text-dim)]">
                {tree.persons.length}人登録済み
              </p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => { formData.current = { name: "", gender: "male", isDeceased: false }; setFormKey((k) => k + 1); }}
                className="rounded-xl border-2 border-[var(--color-danger)]/40 py-3 text-sm font-medium text-[var(--color-danger)] active:scale-95"
              >
                ✕ クリア
              </button>
              <button
                onClick={handleSaveAndRelation}
                className="rounded-xl border-2 border-[var(--color-warning)]/40 py-3 text-sm font-medium text-[var(--color-warning)] active:scale-95"
              >
                保存+関係
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-[var(--color-success)] py-3 text-sm font-bold text-black active:scale-95"
              >
                ✓ 保存
              </button>
            </div>
          </div>
        ) : editPerson ? (
          /* ===== EDIT MODE ===== */
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl bg-[var(--color-card)] p-5 shadow-xl">
              <h2 className="mb-3 text-center font-bold">人物を編集</h2>
              <PersonForm
                key={formKey}
                initial={{
                  name: editPerson.name,
                  gender: editPerson.gender,
                  birthYear: editPerson.birthYear,
                  deathYear: editPerson.deathYear,
                  isDeceased: editPerson.isDeceased,
                  memo: editPerson.memo,
                }}
                onChange={(data) => { formData.current = data; }}
              />

              {/* Existing relationships */}
              {editPersonRelationships.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-bold text-[var(--color-text-dim)]">関係一覧</h3>
                  <div className="space-y-1">
                    {editPersonRelationships.map((r) => {
                      const otherId = r.fromId === editPerson.id ? r.toId : r.fromId;
                      const other = tree.persons.find((p) => p.id === otherId);
                      let label: string;
                      if (r.type === "spouse") {
                        label = r.divorced ? "💔 元配偶者" : "💑 配偶者";
                      } else if (r.fromId === editPerson.id) {
                        label = "👶 子";
                      } else {
                        label = "👨 親";
                      }
                      return (
                        <div key={r.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm">
                          <span>{label}: {other?.name ?? "不明"}</span>
                          <button
                            onClick={() => handleRemoveRelation(r.id)}
                            className="text-[var(--color-danger)] active:scale-90"
                          >✕</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={handleDeletePerson}
                className="rounded-xl border-2 border-[var(--color-danger)]/40 py-3 text-sm font-medium text-[var(--color-danger)] active:scale-95"
              >
                🗑 削除
              </button>
              <button
                onClick={() => {
                  setRelationModalTarget(editPerson);
                  setRelationModalOpen(true);
                }}
                className="rounded-xl border-2 border-[var(--color-warning)]/40 py-3 text-sm font-medium text-[var(--color-warning)] active:scale-95"
              >
                + 関係
              </button>
              <button
                onClick={handleUpdatePerson}
                className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-bold active:scale-95"
              >
                ✓ 更新
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Family tree */}
      <div className="px-4 pb-3">
        <FamilyTree
          persons={tree.persons}
          relationships={tree.relationships}
          familyName={tree.familyName}
          highlightId={editPersonId ?? undefined}
          onPersonTap={handleTreePersonTap}
          compact
        />
      </div>

      {/* Relationship modal */}
      <RelationshipModal
        open={relationModalOpen}
        currentPerson={relationModalTarget}
        allPersons={tree.persons}
        existingRelationships={tree.relationships}
        onAdd={handleAddRelation}
        onClose={() => setRelationModalOpen(false)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-14 z-50 -translate-x-1/2 rounded-full bg-[var(--color-card)] px-5 py-2 text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="text-[var(--color-text-dim)]">読み込み中...</div></div>}>
      <EditorContent />
    </Suspense>
  );
}

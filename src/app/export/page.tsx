"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useTree } from "@/hooks/useTree";
import { exportTreeJSON, importTreeJSON } from "@/lib/storage";

export default function ExportPage() {
  const { tree, loaded, replaceTree, resetTree } = useTree();
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function handleExport() {
    const json = exportTreeJSON(tree);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kakeizu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("success", "ファイルをダウンロードしました");
  }

  function handleCopyJSON() {
    const json = exportTreeJSON(tree);
    navigator.clipboard.writeText(json).then(() => {
      showMessage("success", "JSONをクリップボードにコピーしました");
    });
  }

  function handleImportText() {
    try {
      const newTree = importTreeJSON(importText);
      replaceTree(newTree);
      setImportText("");
      showMessage(
        "success",
        `インポート完了: ${newTree.persons.length}人`,
      );
    } catch {
      showMessage("error", "JSONの形式が正しくありません");
    }
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const newTree = importTreeJSON(reader.result as string);
        replaceTree(newTree);
        showMessage(
          "success",
          `インポート完了: ${newTree.persons.length}人`,
        );
      } catch {
        showMessage("error", "ファイルの形式が正しくありません");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-[var(--color-text-dim)]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <Link
          href="/"
          className="text-sm text-[var(--color-text-dim)] active:opacity-70"
        >
          ← ホーム
        </Link>
        <h1 className="font-bold">データ管理</h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 space-y-6 px-4 pb-8">
        {/* Export section */}
        <section className="rounded-2xl bg-[var(--color-card)] p-5">
          <h2 className="mb-1 text-lg font-bold">エクスポート</h2>
          <p className="mb-4 text-sm text-[var(--color-text-dim)]">
            現在のデータ: {tree.persons.length}人、
            {tree.relationships.length}件の関係
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={tree.persons.length === 0}
              className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 font-medium transition-transform active:scale-95 disabled:opacity-30"
            >
              📥 ファイル保存
            </button>
            <button
              onClick={handleCopyJSON}
              disabled={tree.persons.length === 0}
              className="flex-1 rounded-xl border-2 border-[var(--color-primary)] py-3 font-medium text-[var(--color-primary-light)] transition-transform active:scale-95 disabled:opacity-30"
            >
              📋 JSONコピー
            </button>
          </div>
        </section>

        {/* Import section */}
        <section className="rounded-2xl bg-[var(--color-card)] p-5">
          <h2 className="mb-1 text-lg font-bold">インポート</h2>
          <p className="mb-4 text-sm text-[var(--color-text-dim)]">
            既存データは上書きされます
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-3 w-full rounded-xl border-2 border-dashed border-[var(--color-text-dim)]/30 py-6 text-[var(--color-text-dim)] transition-colors active:border-[var(--color-primary)]"
          >
            📁 ファイルを選択してインポート
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          <div className="relative">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="JSONを貼り付け..."
              rows={4}
              className="w-full resize-none rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent p-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
            />
            {importText && (
              <button
                onClick={handleImportText}
                className="mt-2 w-full rounded-xl bg-[var(--color-primary)] py-3 font-medium transition-transform active:scale-95"
              >
                インポート実行
              </button>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border-2 border-[var(--color-danger)]/30 p-5">
          <h2 className="mb-1 text-lg font-bold text-[var(--color-danger)]">
            データ削除
          </h2>
          <p className="mb-4 text-sm text-[var(--color-text-dim)]">
            全データを削除します。先にエクスポートすることを推奨します。
          </p>
          <button
            onClick={() => {
              if (
                window.confirm("全データを削除しますか？この操作は元に戻せません。")
              ) {
                resetTree();
                showMessage("success", "全データを削除しました");
              }
            }}
            className="w-full rounded-xl border-2 border-[var(--color-danger)] py-3 font-medium text-[var(--color-danger)] transition-transform active:scale-95"
          >
            🗑 全データ削除
          </button>
        </section>
      </div>

      {/* Message toast */}
      {message && (
        <div
          className={`fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full px-6 py-2 text-sm font-medium shadow-lg ${
            message.type === "success"
              ? "bg-[var(--color-success)] text-black"
              : "bg-[var(--color-danger)]"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

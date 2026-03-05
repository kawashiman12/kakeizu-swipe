"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { loadTree } from "@/lib/storage";

function getHasExisting() {
  const tree = loadTree();
  return !!tree && tree.persons.length > 0;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export default function LandingPage() {
  const hasExisting = useSyncExternalStore(subscribe, getHasExisting, () => false);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6">
      <div className="mb-12 text-center">
        <div className="mb-4 text-6xl">🌳</div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          家系図スワイプ
        </h1>
        <p className="text-[var(--color-text-dim)]">
          スワイプで直感的に家系図を作成
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        {hasExisting && (
          <Link
            href="/editor"
            className="rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-center text-lg font-semibold transition-transform active:scale-95"
          >
            続きから編集する
          </Link>
        )}
        <Link
          href="/editor?new=1"
          className={`rounded-2xl px-6 py-4 text-center text-lg font-semibold transition-transform active:scale-95 ${
            hasExisting
              ? "border-2 border-[var(--color-primary)] text-[var(--color-primary-light)]"
              : "bg-[var(--color-primary)]"
          }`}
        >
          新しく作成する
        </Link>
        <Link
          href="/editor?demo=1"
          className="rounded-2xl border-2 border-[var(--color-text-dim)] px-6 py-4 text-center text-lg font-semibold text-[var(--color-text-dim)] transition-transform active:scale-95"
        >
          デモで試す
        </Link>
      </div>

      <div className="mt-8 flex gap-6 text-sm text-[var(--color-text-dim)]">
        <Link href="/export" className="underline underline-offset-4">
          インポート / エクスポート
        </Link>
      </div>

      <footer className="mt-12 text-center text-xs text-[var(--color-text-dim)]">
        <p>データはブラウザ内にのみ保存されます</p>
        <p className="mt-1">クラウドへの送信は行いません 🔒</p>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";

interface PersonFormProps {
  initialName?: string;
  initialBirthYear?: number;
  initialMemo?: string;
  onChange: (data: { name: string; birthYear?: number; memo?: string }) => void;
}

export function PersonForm({
  initialName = "",
  initialBirthYear,
  initialMemo = "",
  onChange,
}: PersonFormProps) {
  const [name, setName] = useState(initialName);
  const [birthYear, setBirthYear] = useState(
    initialBirthYear?.toString() ?? "",
  );
  const [memo, setMemo] = useState(initialMemo);

  function emit(n: string, b: string, m: string) {
    onChange({
      name: n,
      birthYear: b ? parseInt(b, 10) : undefined,
      memo: m || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-dim)]">
          名前 <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            emit(e.target.value, birthYear, memo);
          }}
          placeholder="例: 田中 太郎"
          className="w-full rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent px-4 py-3 text-lg outline-none transition-colors focus:border-[var(--color-primary)]"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-dim)]">
          生年（任意）
        </label>
        <input
          type="number"
          value={birthYear}
          onChange={(e) => {
            setBirthYear(e.target.value);
            emit(name, e.target.value, memo);
          }}
          placeholder="例: 1990"
          className="w-full rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent px-4 py-3 text-lg outline-none transition-colors focus:border-[var(--color-primary)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--color-text-dim)]">
          メモ（任意）
        </label>
        <textarea
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value);
            emit(name, birthYear, e.target.value);
          }}
          placeholder="例: 母方の祖父"
          rows={2}
          className="w-full resize-none rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent px-4 py-3 outline-none transition-colors focus:border-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}

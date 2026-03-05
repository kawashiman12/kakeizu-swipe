"use client";

import { useEffect, useState } from "react";
import { Person } from "@/types/tree";
import { parseYearInput, formatYear } from "@/lib/wareki";

type Gender = Person["gender"];

interface PersonFormData {
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  isDeceased: boolean;
  memo?: string;
}

interface PersonFormProps {
  initial?: Partial<PersonFormData>;
  onChange: (data: PersonFormData) => void;
}

export function PersonForm({ initial, onChange }: PersonFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "male");
  const [birthInput, setBirthInput] = useState(
    initial?.birthYear?.toString() ?? "",
  );
  const [deathInput, setDeathInput] = useState(
    initial?.deathYear?.toString() ?? "",
  );
  const [isDeceased, setIsDeceased] = useState(initial?.isDeceased ?? false);
  const [memo, setMemo] = useState(initial?.memo ?? "");

  const birthYear = parseYearInput(birthInput);
  const deathYear = parseYearInput(deathInput);

  useEffect(() => {
    onChange({
      name,
      gender,
      birthYear: birthYear ?? undefined,
      deathYear: deathYear ?? undefined,
      isDeceased: isDeceased || !!deathYear,
      memo: memo || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, gender, birthInput, deathInput, isDeceased, memo]);

  const genderOptions: { value: Gender; label: string; color: string }[] = [
    { value: "male", label: "🔵 男性", color: "border-sky-400 bg-sky-950/60" },
    { value: "female", label: "🩷 女性", color: "border-pink-400 bg-pink-950/60" },
    { value: "other", label: "⚪ その他", color: "border-gray-400 bg-gray-800/60" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-dim)]">
          名前 <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 田中 太郎"
          className="w-full rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent px-4 py-2.5 outline-none transition-colors focus:border-[var(--color-primary)]"
          autoFocus
        />
      </div>

      {/* Gender toggle */}
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-dim)]">
          性別 <span className="text-[var(--color-danger)]">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {genderOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGender(opt.value)}
              className={`rounded-xl border-2 py-2 text-sm font-medium transition-all ${
                gender === opt.value
                  ? opt.color
                  : "border-[var(--color-text-dim)]/20 opacity-40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Birth year */}
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-dim)]">
          生年（任意・和暦OK）
        </label>
        <input
          type="text"
          value={birthInput}
          onChange={(e) => setBirthInput(e.target.value)}
          placeholder="例: 1990 / 平成2 / H2"
          className="w-full rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent px-4 py-2.5 outline-none transition-colors focus:border-[var(--color-primary)]"
        />
        {birthYear && birthInput && !/^\d{4}$/.test(birthInput.trim()) && (
          <p className="mt-1 text-xs text-[var(--color-success)]">
            → {formatYear(birthYear)}
          </p>
        )}
      </div>

      {/* Deceased toggle + death year */}
      <div>
        <label className="mb-1 flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <button
            type="button"
            onClick={() => setIsDeceased(!isDeceased)}
            className={`h-5 w-5 rounded border-2 text-xs leading-none transition-colors ${
              isDeceased
                ? "border-gray-400 bg-gray-600 text-white"
                : "border-[var(--color-text-dim)]/30"
            }`}
          >
            {isDeceased ? "✓" : ""}
          </button>
          故人
        </label>
        {isDeceased && (
          <div className="mt-1">
            <input
              type="text"
              value={deathInput}
              onChange={(e) => setDeathInput(e.target.value)}
              placeholder="没年: 2020 / 令和2 / R2"
              className="w-full rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent px-4 py-2.5 outline-none transition-colors focus:border-[var(--color-primary)]"
            />
            {deathYear && deathInput && !/^\d{4}$/.test(deathInput.trim()) && (
              <p className="mt-1 text-xs text-[var(--color-success)]">
                → {formatYear(deathYear)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Memo */}
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-dim)]">
          メモ（任意）
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例: 母方の祖父"
          className="w-full rounded-xl border-2 border-[var(--color-text-dim)]/30 bg-transparent px-4 py-2.5 outline-none transition-colors focus:border-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}

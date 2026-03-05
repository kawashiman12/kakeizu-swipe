"use client";

import { useMemo, useState } from "react";
import { Person, Relationship } from "@/types/tree";

interface FamilyTreeProps {
  persons: Person[];
  relationships: Relationship[];
  familyName?: string;
  highlightId?: string;
  onPersonTap?: (personId: string) => void;
  compact?: boolean;
}

interface CoupleUnit {
  primary: Person;
  spouse?: Person;
  spouseRel?: Relationship;
  children: CoupleUnit[];
}

function buildGenerationTree(
  persons: Person[],
  relationships: Relationship[],
): { roots: CoupleUnit[]; generations: CoupleUnit[][] } {
  if (persons.length === 0) return { roots: [], generations: [] };

  const parentRels = relationships.filter((r) => r.type === "parent");
  const spouseRels = relationships.filter((r) => r.type === "spouse");

  const childIds = new Set(parentRels.map((r) => r.toId));
  const spouseSecondaryIds = new Set<string>();
  const spouseMap = new Map<string, { spouse: Person; rel: Relationship }>();

  for (const r of spouseRels) {
    if (!spouseSecondaryIds.has(r.fromId) && !spouseSecondaryIds.has(r.toId)) {
      const sp = persons.find((p) => p.id === r.toId);
      if (sp) {
        spouseMap.set(r.fromId, { spouse: sp, rel: r });
        spouseSecondaryIds.add(r.toId);
      }
    }
  }

  const roots = persons.filter(
    (p) => !childIds.has(p.id) && !spouseSecondaryIds.has(p.id),
  );

  function getChildPersons(personId: string, spouseId?: string): Person[] {
    const cIds = new Set<string>();
    for (const r of parentRels) {
      if (r.fromId === personId) cIds.add(r.toId);
      if (spouseId && r.fromId === spouseId) cIds.add(r.toId);
    }
    const result = Array.from(cIds)
      .map((id) => persons.find((p) => p.id === id))
      .filter((p): p is Person => !!p);

    // Sort by birth year (eldest left)
    result.sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999));
    return result;
  }

  const visited = new Set<string>();

  function buildUnit(person: Person): CoupleUnit {
    visited.add(person.id);
    const sm = spouseMap.get(person.id);
    const spouse = sm?.spouse;
    const spouseRel = sm?.rel;
    if (spouse) visited.add(spouse.id);

    const childPersons = getChildPersons(person.id, spouse?.id).filter(
      (c) => !visited.has(c.id) && !spouseSecondaryIds.has(c.id),
    );

    const children = childPersons.map((c) => buildUnit(c));
    return { primary: person, spouse, spouseRel, children };
  }

  const rootUnits = roots.map((r) => buildUnit(r));

  // Orphans
  const orphans = persons.filter((p) => !visited.has(p.id));
  for (const o of orphans) {
    rootUnits.push({ primary: o, children: [] });
    visited.add(o.id);
  }

  // Build generation rows
  const generations: CoupleUnit[][] = [];
  function assignGeneration(unit: CoupleUnit, gen: number) {
    if (!generations[gen]) generations[gen] = [];
    generations[gen].push(unit);
    for (const child of unit.children) {
      assignGeneration(child, gen + 1);
    }
  }
  for (const root of rootUnits) {
    assignGeneration(root, 0);
  }

  return { roots: rootUnits, generations };
}

/* ========== Person Box ========== */
function PersonBox({
  person,
  isHighlighted,
  onTap,
  compact,
}: {
  person: Person;
  isHighlighted: boolean;
  onTap?: (id: string) => void;
  compact?: boolean;
}) {
  const genderColors = {
    male: { border: "border-sky-400", bg: "bg-sky-900/50", dot: "bg-sky-400" },
    female: { border: "border-pink-400", bg: "bg-pink-900/50", dot: "bg-pink-400" },
    other: { border: "border-gray-400", bg: "bg-gray-700/50", dot: "bg-gray-400" },
  };

  const colors = genderColors[person.gender];
  const deceased = person.isDeceased;

  const yearText = person.birthYear
    ? person.deathYear
      ? `${person.birthYear}–${person.deathYear}`
      : `${person.birthYear}年〜`
    : person.deathYear
      ? `?–${person.deathYear}`
      : "";

  return (
    <button
      onClick={() => onTap?.(person.id)}
      className={`
        relative flex flex-col items-center rounded-lg border-2 transition-all
        ${compact ? "px-2 py-1 min-w-[52px]" : "px-3 py-2 min-w-[72px]"}
        ${isHighlighted
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/20 ring-2 ring-[var(--color-primary)]/50"
          : deceased
            ? "border-gray-500/50 bg-gray-800/60 opacity-60"
            : `${colors.border} ${colors.bg}`
        }
        active:scale-95
      `}
    >
      {/* Gender dot for deceased */}
      {deceased && !isHighlighted && (
        <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${colors.dot} border border-[var(--color-bg)]`} />
      )}
      <span className={`font-bold leading-tight ${compact ? "text-[11px]" : "text-xs"}`}>
        {person.name}
      </span>
      {yearText && (
        <span className={`leading-tight text-[var(--color-text-dim)] ${compact ? "text-[9px]" : "text-[10px]"}`}>
          {yearText}
        </span>
      )}
    </button>
  );
}

/* ========== Generation-aligned Tree ========== */
function GenerationRow({
  units,
  highlightId,
  onTap,
  compact,
}: {
  units: CoupleUnit[];
  highlightId?: string;
  onTap?: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-3" : "gap-6"} flex-wrap`}>
      {units.map((unit) => (
        <div key={unit.primary.id} className="flex items-center gap-0">
          <PersonBox
            person={unit.primary}
            isHighlighted={unit.primary.id === highlightId}
            onTap={onTap}
            compact={compact}
          />
          {unit.spouse && (
            <>
              <div className="relative flex items-center">
                <div className={`${compact ? "w-3" : "w-5"} border-t-2 ${unit.spouseRel?.divorced ? "border-dashed border-[var(--color-danger)]" : "border-[var(--color-accent)]"}`} />
                {unit.spouseRel?.divorced && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--color-danger)]">
                    ×
                  </span>
                )}
              </div>
              <PersonBox
                person={unit.spouse}
                isHighlighted={unit.spouse.id === highlightId}
                onTap={onTap}
                compact={compact}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* ========== Connectors between generations ========== */
function GenerationConnector({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex justify-center ${compact ? "py-1" : "py-2"}`}>
      <div className={`${compact ? "h-4" : "h-6"} w-0 border-l-2 border-[var(--color-text-dim)]/30`} />
    </div>
  );
}

/* ========== Main exports ========== */
export function FamilyTree({
  persons,
  relationships,
  familyName,
  highlightId,
  onPersonTap,
  compact = false,
}: FamilyTreeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { generations } = useMemo(
    () => buildGenerationTree(persons, relationships),
    [persons, relationships],
  );

  return (
    <div className="rounded-2xl bg-[var(--color-card)] shadow-lg">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold"
      >
        <span>
          🌳 {familyName ? `${familyName}家` : "家系図"} ({persons.length}人)
        </span>
        <span className="text-xs text-[var(--color-text-dim)]">
          {collapsed ? "▶" : "▼"}
        </span>
      </button>

      {!collapsed && (
        <div className="overflow-x-auto overflow-y-auto px-3 pb-3">
          {generations.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-text-dim)]">
              まだ人物が登録されていません
            </p>
          ) : (
            <div className="min-w-fit">
              {generations.map((gen, i) => (
                <div key={i}>
                  {i > 0 && <GenerationConnector compact={compact} />}
                  {/* Generation label */}
                  <div className="mb-1 text-center">
                    <span className="text-[9px] text-[var(--color-text-dim)]/60">
                      第{i + 1}世代
                    </span>
                  </div>
                  <GenerationRow
                    units={gen}
                    highlightId={highlightId}
                    onTap={onPersonTap}
                    compact={compact}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FamilyTreeFullscreen({
  persons,
  relationships,
  familyName,
  highlightId,
  onPersonTap,
}: FamilyTreeProps) {
  const { generations } = useMemo(
    () => buildGenerationTree(persons, relationships),
    [persons, relationships],
  );

  return (
    <div className="flex min-h-full min-w-fit flex-col items-center p-6">
      {/* Title */}
      {familyName && (
        <h1 className="mb-6 text-2xl font-bold">{familyName}家 家系図</h1>
      )}

      {generations.length === 0 ? (
        <p className="py-12 text-center text-lg text-[var(--color-text-dim)]">
          まだ人物が登録されていません
        </p>
      ) : (
        <div className="min-w-fit">
          {generations.map((gen, i) => (
            <div key={i}>
              {i > 0 && <GenerationConnector />}
              <div className="mb-1 text-center">
                <span className="text-xs text-[var(--color-text-dim)]/50">
                  第{i + 1}世代
                </span>
              </div>
              <GenerationRow
                units={gen}
                highlightId={highlightId}
                onTap={onPersonTap}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

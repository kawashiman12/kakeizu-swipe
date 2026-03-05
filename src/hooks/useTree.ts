"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Person, Relationship, Tree, UndoAction } from "@/types/tree";
import { loadTree, saveTree } from "@/lib/storage";
import { generateId } from "@/lib/id";

const EMPTY_TREE: Tree = {
  persons: [],
  relationships: [],
  updatedAt: new Date().toISOString(),
};

export function useTree() {
  const [tree, setTree] = useState<Tree>(EMPTY_TREE);
  const [loaded, setLoaded] = useState(false);
  const undoStack = useRef<UndoAction[]>([]);

  useEffect(() => {
    const saved = loadTree();
    if (saved) setTree(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTree(tree);
  }, [tree, loaded]);

  const addPerson = useCallback(
    (data: Omit<Person, "id">): Person => {
      const person: Person = { id: generateId(), ...data };
      setTree((prev) => ({
        ...prev,
        persons: [...prev.persons, person],
      }));
      undoStack.current.push({ type: "add-person", personId: person.id });
      return person;
    },
    [],
  );

  const updatePerson = useCallback(
    (id: string, data: Partial<Omit<Person, "id">>) => {
      setTree((prev) => ({
        ...prev,
        persons: prev.persons.map((p) =>
          p.id === id ? { ...p, ...data } : p,
        ),
      }));
    },
    [],
  );

  const removePerson = useCallback((id: string) => {
    setTree((prev) => {
      const person = prev.persons.find((p) => p.id === id);
      if (person) {
        undoStack.current.push({ type: "remove-person", person });
      }
      return {
        ...prev,
        persons: prev.persons.filter((p) => p.id !== id),
        relationships: prev.relationships.filter(
          (r) => r.fromId !== id && r.toId !== id,
        ),
      };
    });
  }, []);

  const addRelationship = useCallback(
    (
      type: Relationship["type"],
      fromId: string,
      toId: string,
    ): Relationship => {
      const rel: Relationship = { id: generateId(), type, fromId, toId };
      setTree((prev) => ({
        ...prev,
        relationships: [...prev.relationships, rel],
      }));
      undoStack.current.push({
        type: "add-relationship",
        relationshipId: rel.id,
      });
      return rel;
    },
    [],
  );

  const removeRelationship = useCallback((id: string) => {
    setTree((prev) => {
      const rel = prev.relationships.find((r) => r.id === id);
      if (rel) {
        undoStack.current.push({ type: "remove-relationship", relationship: rel });
      }
      return {
        ...prev,
        relationships: prev.relationships.filter((r) => r.id !== id),
      };
    });
  }, []);

  const undo = useCallback(() => {
    const action = undoStack.current.pop();
    if (!action) return;
    switch (action.type) {
      case "add-person":
        setTree((prev) => ({
          ...prev,
          persons: prev.persons.filter((p) => p.id !== action.personId),
          relationships: prev.relationships.filter(
            (r) =>
              r.fromId !== action.personId && r.toId !== action.personId,
          ),
        }));
        break;
      case "add-relationship":
        setTree((prev) => ({
          ...prev,
          relationships: prev.relationships.filter(
            (r) => r.id !== action.relationshipId,
          ),
        }));
        break;
      case "remove-person":
        setTree((prev) => ({
          ...prev,
          persons: [...prev.persons, action.person],
        }));
        break;
      case "remove-relationship":
        setTree((prev) => ({
          ...prev,
          relationships: [...prev.relationships, action.relationship],
        }));
        break;
    }
  }, []);

  const resetTree = useCallback(() => {
    setTree(EMPTY_TREE);
    undoStack.current = [];
  }, []);

  const replaceTree = useCallback((newTree: Tree) => {
    setTree(newTree);
    undoStack.current = [];
  }, []);

  return {
    tree,
    loaded,
    addPerson,
    updatePerson,
    removePerson,
    addRelationship,
    removeRelationship,
    undo,
    get canUndo() {
      return undoStack.current.length > 0;
    },
    resetTree,
    replaceTree,
  };
}

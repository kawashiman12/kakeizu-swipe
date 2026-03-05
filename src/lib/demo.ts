import { Tree } from "@/types/tree";

export const DEMO_TREE: Tree = {
  familyName: "田中",
  persons: [
    { id: "d1", name: "田中 太郎", gender: "male", birthYear: 1940, isDeceased: true, deathYear: 2010, memo: "祖父" },
    { id: "d2", name: "田中 花子", gender: "female", birthYear: 1942, isDeceased: false, memo: "祖母" },
    { id: "d3", name: "田中 一郎", gender: "male", birthYear: 1965, isDeceased: false, memo: "父" },
    { id: "d4", name: "佐藤 美咲", gender: "female", birthYear: 1968, isDeceased: false, memo: "母（旧姓:佐藤）" },
    { id: "d5", name: "田中 健太", gender: "male", birthYear: 1992, isDeceased: false },
    { id: "d6", name: "田中 優子", gender: "female", birthYear: 1995, isDeceased: false },
    { id: "d7", name: "田中 次郎", gender: "male", birthYear: 1968, isDeceased: false, memo: "叔父" },
    { id: "d8", name: "山本 恵", gender: "female", birthYear: 1970, isDeceased: false, memo: "叔母" },
    { id: "d9", name: "田中 真由", gender: "female", birthYear: 1998, isDeceased: false, memo: "従姉妹" },
  ],
  relationships: [
    { id: "r1", type: "spouse", fromId: "d1", toId: "d2" },
    { id: "r2", type: "parent", fromId: "d1", toId: "d3" },
    { id: "r3", type: "parent", fromId: "d2", toId: "d3" },
    { id: "r4", type: "parent", fromId: "d1", toId: "d7" },
    { id: "r5", type: "parent", fromId: "d2", toId: "d7" },
    { id: "r6", type: "spouse", fromId: "d3", toId: "d4" },
    { id: "r7", type: "parent", fromId: "d3", toId: "d5" },
    { id: "r8", type: "parent", fromId: "d4", toId: "d5" },
    { id: "r9", type: "parent", fromId: "d3", toId: "d6" },
    { id: "r10", type: "parent", fromId: "d4", toId: "d6" },
    { id: "r11", type: "spouse", fromId: "d7", toId: "d8" },
    { id: "r12", type: "parent", fromId: "d7", toId: "d9" },
    { id: "r13", type: "parent", fromId: "d8", toId: "d9" },
  ],
  updatedAt: new Date().toISOString(),
};

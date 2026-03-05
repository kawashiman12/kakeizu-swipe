import { Tree } from "@/types/tree";

export const DEMO_TREE: Tree = {
  persons: [
    { id: "demo-1", name: "田中 太郎", birthYear: 1950, memo: "祖父" },
    { id: "demo-2", name: "田中 花子", birthYear: 1952, memo: "祖母" },
    { id: "demo-3", name: "田中 一郎", birthYear: 1975, memo: "父" },
    { id: "demo-4", name: "佐藤 美咲", birthYear: 1978, memo: "母" },
    { id: "demo-5", name: "田中 健太", birthYear: 2000 },
    { id: "demo-6", name: "田中 優子", birthYear: 2003 },
  ],
  relationships: [
    { id: "rel-1", type: "spouse", fromId: "demo-1", toId: "demo-2" },
    { id: "rel-2", type: "parent", fromId: "demo-1", toId: "demo-3" },
    { id: "rel-3", type: "parent", fromId: "demo-2", toId: "demo-3" },
    { id: "rel-4", type: "spouse", fromId: "demo-3", toId: "demo-4" },
    { id: "rel-5", type: "parent", fromId: "demo-3", toId: "demo-5" },
    { id: "rel-6", type: "parent", fromId: "demo-4", toId: "demo-5" },
    { id: "rel-7", type: "parent", fromId: "demo-3", toId: "demo-6" },
    { id: "rel-8", type: "parent", fromId: "demo-4", toId: "demo-6" },
  ],
  updatedAt: new Date().toISOString(),
};

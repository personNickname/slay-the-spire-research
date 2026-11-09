import type { CharacterId } from "./types.js";

export const CHARACTERS: Record<
  CharacterId,
  {
    id: CharacterId;
    name: { eng: string; zhs: string };
    hp: number;
    gold: number;
    orbSlots: number;
    relic: string;
    deck: string[];
    color: "red" | "green" | "blue" | "purple";
  }
> = {
  ironclad: {
    id: "ironclad",
    name: { eng: "Ironclad", zhs: "铁甲战士" },
    hp: 80,
    gold: 99,
    orbSlots: 0,
    relic: "Burning Blood",
    color: "red",
    deck: ["Strike_R", "Strike_R", "Strike_R", "Strike_R", "Strike_R", "Defend_R", "Defend_R", "Defend_R", "Defend_R", "Bash"],
  },
  silent: {
    id: "silent",
    name: { eng: "Silent", zhs: "静默猎手" },
    hp: 70,
    gold: 99,
    orbSlots: 0,
    relic: "Ring of the Snake",
    color: "green",
    deck: ["Strike_G", "Strike_G", "Strike_G", "Strike_G", "Strike_G", "Defend_G", "Defend_G", "Defend_G", "Defend_G", "Defend_G", "Survivor", "Neutralize"],
  },
  defect: {
    id: "defect",
    name: { eng: "Defect", zhs: "故障机器人" },
    hp: 75,
    gold: 99,
    orbSlots: 3,
    relic: "Cracked Core",
    color: "blue",
    deck: ["Strike_B", "Strike_B", "Strike_B", "Strike_B", "Defend_B", "Defend_B", "Defend_B", "Defend_B", "Zap", "Dualcast"],
  },
  watcher: {
    id: "watcher",
    name: { eng: "Watcher", zhs: "观者" },
    hp: 72,
    gold: 99,
    orbSlots: 0,
    relic: "PureWater",
    color: "purple",
    deck: ["Strike_P", "Strike_P", "Strike_P", "Strike_P", "Defend_P", "Defend_P", "Defend_P", "Defend_P", "Eruption", "Vigilance"],
  },
};

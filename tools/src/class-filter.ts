/**
 * Which jar classes count as game entities. Source: docs/audits/2026-11-09-sts1-fidelity-audit.md §F6/F3.
 * Everything listed here was verified against the decompiled code; do not "fix" from memory.
 */

/** Card classes present in the jar but not obtainable in the game. */
export const EXCLUDED_CARD_CLASSES = new Set<string>([
  "blue/Impulse", // no localization, unused
  "purple/Discipline", // localized "DEPRECATED Discipline"
  "purple/Unraveling", // unobtainable
]);

/**
 * Card packages scanned. Records are filed by the CardColor parsed from `super(...)`, not by package:
 * tempCards (Shiv, Smite, Insight, …) and optionCards (stance choices) are COLORLESS/PURPLE SPECIAL cards.
 */
export const CARD_PACKAGES = ["red", "green", "blue", "purple", "colorless", "curses", "status", "tempCards"];
// optionCards (ChooseCalm/ChooseWrath …) are stance-choice UI stubs, not obtainable cards → not extracted.
// cards/deprecated (Become Almighty, Live Forever, Fame and Fortune) were cut from the game → not extracted.

/** Power classes with a POWER_ID but no localization entry (unused in game). */
export const EXCLUDED_POWER_CLASSES = new Set<string>(["LightningMasteryPower", "RechargingCorePower", "WinterPower"]);

export const EXCLUDED_RELIC_CLASSES = new Set<string>([
  "Test1", "Test3", "Test4", "Test5", "Test6", // dev test relics
  "DiscerningMonocle", // unused
]);

export const EXCLUDED_POTION_CLASSES = new Set<string>(["PotionSlot"]); // PLACEHOLDER rarity

/** Monster classes that are not combat entities (boss parts, debug). */
export const EXCLUDED_MONSTER_CLASSES = new Set<string>([
  "exordium/ApologySlime",
  "exordium/HexaghostBody",
  "exordium/HexaghostOrb",
]);

export const MONSTER_PACKAGES = ["exordium", "city", "beyond", "ending"];

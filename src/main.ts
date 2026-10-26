import {
  type Wizard,
  type Spell,
  type AcademyEvent,
  type House,
  type HousePoints,
  type SpellCategory,
  type SpellOutput,
  type ArrayElement,
  type WizardSummary,
  type WizardUpdate,
  type AttackSpell,
  type NonHealingCategory,
  type NewWizard,
  type SpellCastEvent,
} from "./types";

import { WizardRepository, SpellRepository } from "./repository";
import { Log, Cache } from "./decorators";

// ============================================================
// Exercise 6 — Type Guard: isHouse() + isWizard()
// ============================================================

// Exercise 6 step 1: Dedicated type guard for House.
// The return type "value is House" is a type predicate.
function isHouse(value: unknown): value is House {
  return (
    value === "Gryffindor" ||
    value === "Slytherin" ||
    value === "Ravenclaw" ||
    value === "Hufflepuff"
  );
}

// Exercise 6 step 2: Updated isWizard() uses isHouse() instead of typeof === "string".
function isWizard(value: unknown): value is Wizard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isHouse(candidate.house) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

// ============================================================
// Exercise 3 — Event handler for spell-cast events
// ============================================================

function handleSpellCast(event: SpellCastEvent): void {
  console.log(
    `🪄 Wizard #${event.wizardId} cast "${event.spellName}"`
  );
}

// ============================================================
// Academy Service
// ============================================================

class AcademyService {
  constructor(
    private readonly wizards: WizardRepository,
    private readonly spells: SpellRepository
  ) {}

  @Log
  castSpell(wizardId: number, spellId: number): string {
    const wizard = this.wizards.findById(wizardId);
    const spell = this.spells.findById(spellId);

    if (!wizard || !spell) {
      throw new Error("Wizard or spell not found");
    }

    return `${wizard.name} casts ${spell.name}!`;
  }

  findByHouse(house: House): WizardSummary[] {
    return this.wizards
      .getAll()
      .filter(wizard => wizard.house === house)
      .map(({ id, name, house }) => ({ id, name, house }));
  }

  updateWizard(id: number, changes: WizardUpdate): boolean {
    return this.wizards.update(id, changes);
  }

  getSpellEvents(events: AcademyEvent[]): SpellCastEvent[] {
    return events.filter(
      (event): event is SpellCastEvent =>
        event.type === "spell-cast"
    );
  }
}

// ============================================================
// Exercise 5 — Cached service
// ============================================================

class HousePointsService {
  @Cache
  computePoints(house: House): number {
    console.log(`  [computing points for ${house}...]`);
    // Simulate an expensive calculation.
    const base: Record<House, number> = {
      Gryffindor: 100,
      Slytherin: 80,
      Ravenclaw: 90,
      Hufflepuff: 70,
    };
    return base[house] * 2;
  }
}

// ============================================================
// TESTS — Démonstration de tous les exercices
// ============================================================

const wizards = new WizardRepository();
const spells = new SpellRepository();

// ---- Exercise 1: Add a wizard using NewWizard (no id required) ----
console.log("=== Exercise 1 — Ajouter un sorcier avec NewWizard ===");

const harryData: NewWizard = {
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true,
};

const hermioneData: NewWizard = {
  name: "Hermione Granger",
  house: "Gryffindor",
  level: 8,
  active: true,
};

const dracoData: NewWizard = {
  name: "Draco Malfoy",
  house: "Slytherin",
  level: 6,
  active: true,
};

const harry = wizards.addWizard(harryData);
const hermione = wizards.addWizard(hermioneData);
const draco = wizards.addWizard(dracoData);

console.log("Harry:", harry);
console.log("Hermione:", hermione);
console.log("Draco:", draco);

// ---- Exercise 2: Filter wizards by house ----
console.log("\n=== Exercise 2 — Filtrer par maison ===");

const gryffindors = wizards.findByHouse("Gryffindor");
console.log("Gryffindor wizards:", gryffindors);

const slytherins = wizards.findByHouse("Slytherin");
console.log("Slytherin wizards:", slytherins);

// ---- Exercise 3: Extract spell-cast events ----
console.log("\n=== Exercise 3 — Événements spell-cast (Extract) ===");

const events: AcademyEvent[] = [
  { type: "spell-cast", wizardId: 1, spellName: "Lumos" },
  { type: "level-up", wizardId: 2, newLevel: 9 },
  { type: "spell-cast", wizardId: 3, spellName: "Expelliarmus" },
  { type: "wizard-expelled", wizardId: 3 },
];

const academy = new AcademyService(wizards, spells);
const spellEvents = academy.getSpellEvents(events);
console.log("Spell-cast events:", spellEvents);

// Use the dedicated event handler:
spellEvents.forEach(handleSpellCast);

// ---- Exercise 4: Validate spell power (decorator) ----
console.log("\n=== Exercise 4 — Valider la puissance d'un sort ===");

// Valid spell:
spells.add({ id: 101, name: "Expelliarmus", category: "attack", power: 80 });
console.log("Expelliarmus added ✅");

spells.add({ id: 102, name: "Protego", category: "defense", power: 60 });
console.log("Protego added ✅");

// Invalid spell (negative power) — should be rejected:
spells.add({ id: 103, name: "Cursed Spell", category: "attack", power: -10 });
console.log("Cursed Spell result (should be rejected) ❌");

console.log("All spells:", spells.getAll());

// ---- Exercise 5: Cache decorator ----
console.log("\n=== Exercise 5 — Décorateur Cache ===");

const pointsService = new HousePointsService();

console.log("1st call (Gryffindor):", pointsService.computePoints("Gryffindor"));
console.log("2nd call (Gryffindor):", pointsService.computePoints("Gryffindor")); // cached
console.log("1st call (Slytherin):",  pointsService.computePoints("Slytherin"));
console.log("3rd call (Gryffindor):", pointsService.computePoints("Gryffindor")); // cached

// ---- Exercise 6: Type guard isHouse() + isWizard() ----
console.log("\n=== Exercise 6 — Type Guard renforcé ===");

// Valid house:
const testHouse1: unknown = "Gryffindor";
if (isHouse(testHouse1)) {
  console.log(`✅ "${testHouse1}" is a valid House`);
}

// Invalid house — "Durmstrang" is NOT one of the four houses:
const testHouse2: unknown = "Durmstrang";
if (!isHouse(testHouse2)) {
  console.log(`❌ "${testHouse2}" is NOT a valid House`);
}

// Valid wizard:
const testWizard: unknown = { id: 1, name: "Harry", house: "Gryffindor", level: 5, active: true };
if (isWizard(testWizard)) {
  console.log(`✅ isWizard passed: ${testWizard.name} belongs to ${testWizard.house}`);
}

// Invalid wizard (bad house):
const badWizard: unknown = { id: 99, name: "Fake", house: "Durmstrang", level: 1, active: true };
if (!isWizard(badWizard)) {
  console.log(`❌ isWizard rejected: house "Durmstrang" is not valid`);
}

// ---- Academy service demo ----
console.log("\n=== Démonstrations supplémentaires ===");

console.log("\n--- Cast a spell ---");
console.log(academy.castSpell(1, 101));

console.log("\n--- Update a wizard ---");
academy.updateWizard(1, { level: 6 });
console.log(wizards.findById(1));

console.log("\n--- Record utility type ---");
const points: HousePoints = {
  Gryffindor: 100,
  Slytherin: 80,
  Ravenclaw: 90,
  Hufflepuff: 70,
};
console.log(points);

// Compile-time demonstrations: these aliases are checked by TypeScript.
type CastArguments = Parameters<AcademyService["castSpell"]>;
type CastResult = ReturnType<AcademyService["castSpell"]>;
type AttackOutput = SpellOutput<"attack">; // number
type HealingOutput = SpellOutput<"healing">; // string
type SpellItem = ArrayElement<Spell[]>; // Spell
type AttackSpellExample = AttackSpell;
type RemainingCategories = NonHealingCategory;
type CategoryExample = SpellCategory;

const typeExamples: [
  CastArguments,
  CastResult,
  AttackOutput,
  HealingOutput,
  SpellItem,
  AttackSpellExample["category"],
  RemainingCategories,
  CategoryExample
] | null = null;

void typeExamples;

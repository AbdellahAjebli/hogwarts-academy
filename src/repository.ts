import type { Wizard, Spell, NewWizard } from "./types";
import { Log, MeasureTime, ValidateSpellPower } from "./decorators";

export class Repository<T extends { id: number }> {
  protected items: T[] = [];

  @Log
  add(item: T): void {
    this.items.push(item);
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);

    if (!item) return false;

    Object.assign(item, changes);
    return true;
  }
}

// Exercise 1: addWizard auto-generates the id using NewWizard.
// Exercise 2: findByHouse filters wizards by their house.
export class WizardRepository extends Repository<Wizard> {
  private nextId = 1;

  // Exercise 1: The caller provides everything except the id.
  addWizard(data: NewWizard): Wizard {
    const wizard = { id: this.nextId++, ...data } as Wizard;
    this.add(wizard);
    return wizard;
  }

  // Exercise 2: Indexed access type Wizard["house"] restricts to valid House values.
  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.items.filter(wizard => wizard.house === house);
  }
}

// Exercise 4: @ValidateSpellPower rejects spells with negative power.
export class SpellRepository extends Repository<Spell> {
  @ValidateSpellPower
  override add(item: Spell): void {
    super.add(item);
  }
}

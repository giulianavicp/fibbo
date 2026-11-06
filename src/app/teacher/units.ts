export const MAX_UNITS = 3;
export const NO_UNIT = 'Sem unidade';

type WithUnit = { unit: string | null };

export const unitOf = (c: WithUnit) => c.unit?.trim() || NO_UNIT;

export const unitsOf = (courses: WithUnit[]) => [...new Set(courses.map(unitOf))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export function toggleUnit(selected: string[], unit: string): { selected: string[]; limitReached: boolean } {
  if (selected.includes(unit)) return { selected: selected.filter(u => u !== unit), limitReached: false };
  if (selected.length >= MAX_UNITS) return { selected, limitReached: true };
  return { selected: [...selected, unit], limitReached: false };
}

export const coursesInUnits = <T extends WithUnit>(courses: T[], units: string[]) => courses.filter(c => units.includes(unitOf(c)));

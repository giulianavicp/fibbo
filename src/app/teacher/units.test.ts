import { describe, expect, it } from 'vitest';
import { MAX_UNITS, NO_UNIT, coursesInUnits, toggleUnit, unitsOf } from './units';

const courses = [
  { id: '1', unit: 'FATEC Santo André' },
  { id: '2', unit: 'FATEC Mauá' },
  { id: '3', unit: null },
  { id: '4', unit: 'FATEC Mauá' },
];

describe('units', () => {
  it('lists distinct units, with courses without a unit grouped', () => {
    expect(unitsOf(courses)).toEqual(['FATEC Mauá', 'FATEC Santo André', NO_UNIT]);
  });

  it('adds and removes a unit', () => {
    expect(toggleUnit([], 'A')).toEqual({ selected: ['A'], limitReached: false });
    expect(toggleUnit(['A', 'B'], 'A')).toEqual({ selected: ['B'], limitReached: false });
  });

  it(`refuses more than ${MAX_UNITS} units`, () => {
    expect(toggleUnit(['A', 'B', 'C'], 'D')).toEqual({ selected: ['A', 'B', 'C'], limitReached: true });
  });

  it('filters courses by the selected units', () => {
    expect(coursesInUnits(courses, ['FATEC Mauá', NO_UNIT]).map(c => c.id)).toEqual(['2', '3', '4']);
  });
});

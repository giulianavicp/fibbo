import { describe, expect, it } from 'vitest';
import { KEY_FILE_MAX_BYTES, keyFileProblem } from './validation';

describe('keyFileProblem', () => {
  it('accepts PDF, PNG and JPG', () => {
    for (const type of ['application/pdf', 'image/png', 'image/jpeg']) expect(keyFileProblem({ type, size: 1000 })).toBeNull();
  });

  it('rejects other formats', () => {
    expect(keyFileProblem({ type: 'application/msword', size: 1000 })).toMatch(/Formato inválido/);
  });

  it('rejects empty and oversized files', () => {
    expect(keyFileProblem({ type: 'application/pdf', size: 0 })).toMatch(/vazio/);
    expect(keyFileProblem({ type: 'application/pdf', size: KEY_FILE_MAX_BYTES + 1 })).toMatch(/10 MB/);
  });
});

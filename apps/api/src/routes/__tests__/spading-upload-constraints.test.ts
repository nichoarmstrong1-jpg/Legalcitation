import { describe, expect, it } from 'vitest';
import { getJournalUploadConstraintError } from '../spading.js';

describe('getJournalUploadConstraintError', () => {
  it('allows replacing an existing journal entry with one new file', () => {
    const result = getJournalUploadConstraintError('journal_entry', 1, true);
    expect(result).toBeNull();
  });

  it('rejects uploading multiple journal entries at once', () => {
    const result = getJournalUploadConstraintError('journal_entry', 2, false);
    expect(result).toEqual({
      status: 400,
      body: { error: 'Only one journal entry allowed per project' },
    });
  });

  it('allows multiple source files', () => {
    const result = getJournalUploadConstraintError('source', 5, false);
    expect(result).toBeNull();
  });
});

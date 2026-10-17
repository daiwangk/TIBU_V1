import { describe, expect, it } from 'vitest';
import { findGitlinks } from './gitlinks.mjs';

const entry = (mode, path, stage = 0) => `${mode} 738344ff5c55c8bbb668d9189c43de2e90486f0e ${stage}\t${path}`;
const output = (...entries) => entries.join('\0') + '\0';

describe('findGitlinks', () => {
  it('finds a gitlink (mode 160000)', () => {
    expect(findGitlinks(output(entry('100644', 'package.json'), entry('160000', 'TIBU_V1')))).toEqual(['TIBU_V1']);
  });

  it('finds several, including nested paths and names with spaces', () => {
    expect(findGitlinks(output(entry('160000', 'a/b'), entry('100755', 'run.sh'), entry('160000', 'my folder/x')))).toEqual([
      'a/b',
      'my folder/x',
    ]);
  });

  it('ignores regular files, executables and symlinks', () => {
    expect(findGitlinks(output(entry('100644', 'a.js'), entry('100755', 'b.sh'), entry('120000', 'link')))).toEqual([]);
  });

  it('does not match "160000" inside a path or object name', () => {
    expect(findGitlinks(output(entry('100644', 'docs/160000 notes.md')))).toEqual([]);
  });

  it('handles empty or missing output', () => {
    expect(findGitlinks('')).toEqual([]);
    expect(findGitlinks(undefined)).toEqual([]);
  });
});

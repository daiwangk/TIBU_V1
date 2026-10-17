/**
 * Gitlink (submodule) detection for scripts/check-guards.mjs. Pure, so it can be unit-tested.
 *
 * A gitlink is an index entry with mode 160000. Committed without a .gitmodules file (for example by
 * running `git add .` one directory too high, which stages a nested clone), it makes Cloudflare Pages'
 * clone step abort with "No url found for submodule path", while GitHub Actions stays green because
 * actions/checkout does not initialise submodules.
 */

/**
 * Paths of every gitlink in the output of `git ls-files -s -z`.
 * Each entry is `<mode> <object> <stage>\t<path>`, entries separated by NUL.
 *
 * @param {string} lsFilesOutput
 * @returns {string[]}
 */
export function findGitlinks(lsFilesOutput) {
  const paths = [];
  for (const entry of String(lsFilesOutput ?? '').split('\0')) {
    const tab = entry.indexOf('\t');
    if (tab === -1) continue;
    const mode = entry.slice(0, tab).split(' ')[0];
    if (mode === '160000') paths.push(entry.slice(tab + 1));
  }
  return paths;
}

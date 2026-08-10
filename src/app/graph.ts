import { InMemoryGraph } from '../graph/query';
import type { GraphFragment } from '../graph/types';

/**
 * Content is flat JSON in the repo, loaded at build time. No CMS, no runtime database.
 * `_acceptance/` is excluded: that directory holds the verbatim research F.5 seed, which
 * is a test fixture, not site content, and would collide with the fuller records here.
 */
const modules = import.meta.glob<GraphFragment>('/content/**/*.json', { eager: true, import: 'default' });

const fragments = Object.entries(modules)
  .filter(([path]) => !path.includes('/_acceptance/'))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, data]) => ({ name, data }));

export const graph = InMemoryGraph.fromFragments(fragments);

if (import.meta.env.DEV) {
  const errors = graph.issues().filter((i) => i.severity === 'error');
  if (errors.length) {
    console.error('[content] integrity errors — run `npm run validate`:', errors);
  }
}

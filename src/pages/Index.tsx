import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { questionMap, questionView, positionView } from '../graph/views';
import { positionBySlug, positionSlug, questionBySlug, questionSlug } from '../graph/slugs';
import { search } from '../lib/search';
import { Gloss } from '../components/Gloss';
import { NotYetWritten } from '../components/Epistemic';
import { HolderRow } from '../components/pieces';

/* ------------------------- /questions ------------------------- */

export function QuestionsIndex() {
  const { s, t } = usePrefs();
  const entries = questionMap(graph);

  // Grouped by domain, as the brief asks. Domain is the reader's entry point into a
  // corpus; a flat list of four is fine now and stops being fine at forty.
  const byDomain = new Map<string, typeof entries>();
  for (const e of entries) {
    const d = t(e.question.domain);
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d)!.push(e);
  }

  return (
    <article className="page">
      <h1 className="hero__q">{s.homeIndexTitle}</h1>
      <p className="lede">{s.questionsIndexBlurb}</p>

      {[...byDomain].map(([domain, list]) => (
        <section className="qgroup" key={domain} aria-labelledby={`d-${domain}`}>
          <h2 className="qgroup__domain" id={`d-${domain}`}>{domain}</h2>
          <ul className="qlist">
            {list.map((e) => {
              const total = e.sourcedClaimCount + e.unsourcedClaimCount;
              return (
                <li className="qcard" key={e.question.id}>
                  <h3 className="qcard__q">
                    <Link to={`/questions/${questionSlug(e.question)}`}>{t(e.question.canonical)}</Link>
                  </h3>
                  <p className="qcard__plain"><Gloss>{t(e.question.plain)}</Gloss></p>
                  <p className="qcard__meta">
                    <span>{s.pickPositions(e.positionCount)}</span>
                    {e.refusalCount > 0 && <span className="refuse">{s.refusalsCount(e.refusalCount)}</span>}
                    <span>{e.traditions.length ? e.traditions.map((tr) => t(tr.label)).join(' · ') : s.noTraditionsYet}</span>
                    {e.crossTraditionIntersectionCount > 0 && (
                      <span>{s.nIntersections(e.crossTraditionIntersectionCount)}</span>
                    )}
                    {total > 0 && (
                      <span className={e.unsourcedClaimCount ? 'warn' : undefined}>
                        {s.sourcedOf(e.sourcedClaimCount, total)}
                      </span>
                    )}
                    <span>{e.question.completeness === 'worked' ? s.worked : s.stub}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </article>
  );
}

/* ------------------------- /questions/:slug/compare ------------------------- */

/**
 * Contrasting cases (research I.1): putting al-Ashʿarī beside ʿAbd al-Jabbār on the
 * same claim is the most instructive view this data supports. Both choices live in the
 * URL so a comparison is linkable.
 */
export function ComparePositions() {
  const { s, t } = usePrefs();
  const [params, setParams] = useSearchParams();
  const slug = window.location.hash.split('/')[2] ?? '';
  const question = questionBySlug(graph, slug);

  if (!question) return <p className="empty">Unknown question.</p>;
  const view = questionView(graph, question.id)!;
  const all = [...view.answers, ...view.refusals];

  const pick = (which: 'a' | 'b', fallbackIndex: number) => {
    const raw = params.get(which);
    const found = raw ? positionBySlug(graph, raw) : undefined;
    return found ?? all[fallbackIndex]?.position;
  };
  const a = pick('a', 0);
  const b = pick('b', 1);

  const setSide = (which: 'a' | 'b', slugValue: string) => {
    const next = new URLSearchParams(params);
    next.set(which, slugValue);
    setParams(next, { replace: false });
  };

  const va = a ? positionView(graph, a.id) : undefined;
  const vb = b ? positionView(graph, b.id) : undefined;

  const rows: Array<[string, (v: NonNullable<typeof va>) => React.ReactNode]> = [
    [s.inTheirTerms, (v) => <Gloss>{t(v.position.definition)}</Gloss>],
    [s.heldBy, (v) => (v.holdings.length
      ? <ul className="holders">{v.holdings.map((h) => <HolderRow key={h.holds.id ?? h.thinker.id} holding={h} />)}</ul>
      : <span className="prose-note">{s.noHolders}</span>)],
    [s.strongestArgument, (v) => (v.arguments[0]
      ? <Gloss>{t(v.arguments[0].claim.statement)}</Gloss>
      : <NotYetWritten compact />)],
    [s.strongestObjection, (v) => (v.strongestObjection
      ? <Gloss>{t(v.strongestObjection.claim.statement)}</Gloss>
      : <NotYetWritten compact />)],
  ];

  return (
    <article className="page">
      <p className="hero__kicker">
        <Link to={`/questions/${questionSlug(question)}`}>{t(question.canonical)}</Link>
      </p>
      <h1 className="hero__q">{s.compareTwo}</h1>
      <p className="lede">{s.compareBlurb}</p>

      <div className="compare" style={{ marginTop: '2rem' }}>
        {([['a', va], ['b', vb]] as const).map(([which, v]) => (
          <div className="compare__col" key={which}>
            <label className="visually-hidden" htmlFor={`cmp-${which}`}>{s.compareChoose}</label>
            <select
              id={`cmp-${which}`} className="compare__pick"
              value={v ? positionSlug(v.position) : ''}
              onChange={(e) => setSide(which, e.target.value)}
            >
              {all.map((p) => (
                <option key={p.position.id} value={positionSlug(p.position)}>
                  {t(p.position.shortLabel ?? p.position.label)}
                </option>
              ))}
            </select>

            {v ? (
              <>
                <h2 className="position__title">
                  <Link to={`/questions/${questionSlug(question)}/${positionSlug(v.position)}`}>
                    {t(v.position.label)}
                  </Link>
                </h2>
                {rows.map(([label, render]) => (
                  <div className="compare__row" key={label}>
                    <h4>{label}</h4>
                    <div>{render(v)}</div>
                  </div>
                ))}
              </>
            ) : <p className="empty">{s.compareChoose}</p>}
          </div>
        ))}
      </div>
    </article>
  );
}

/* ------------------------- /search ------------------------- */

export function SearchPage() {
  const { s, locale } = usePrefs();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);

  const results = useMemo(() => search(q, locale), [q, locale]);

  const kindLabel: Record<string, string> = {
    question: s.navQuestions, position: s.positions, thinker: s.thinker, term: s.navTerms,
  };

  return (
    <article className="page" style={{ maxWidth: '44rem' }}>
      <h1 className="hero__q">{s.searchTitle}</h1>
      <p className="lede">{s.searchBlurb}</p>

      <form
        className="search" style={{ marginTop: '1.5rem' }}
        onSubmit={(e) => { e.preventDefault(); setParams(draft ? { q: draft } : {}); }}
      >
        <label className="visually-hidden" htmlFor="q">{s.searchTitle}</label>
        <input
          id="q" type="search" value={draft} placeholder={s.searchPlaceholder}
          onChange={(e) => setDraft(e.target.value)}
        />
      </form>

      {q && (
        <p className="prose-note" style={{ marginTop: '1rem' }} aria-live="polite">
          {s.searchCount(results.length, q)}
        </p>
      )}

      <ul className="search__results">
        {results.map((r) => (
          <li key={r.path + r.title}>
            <Link className="search__hit" to={r.path}>
              <span className="search__kind">{kindLabel[r.kind] ?? r.kind}</span>
              <span className="search__title">{r.title}</span>
              {r.subtitle && <span className="search__sub">{r.subtitle}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {q && results.length === 0 && <p className="empty">{s.searchNone}</p>}
    </article>
  );
}


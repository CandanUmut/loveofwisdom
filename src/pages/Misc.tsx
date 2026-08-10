import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { conceptView, thinkerView } from '../graph/views';
import { EpistemicMark, FallbackNote, NotYetWritten } from '../components/Epistemic';
import { CoverageNote, ScriptTerm } from '../components/pieces';
import { clearCommitments, loadCommitments, type Commitment } from '../lib/tracer';

/* ------------------------------- thinker ------------------------------- */

export function Thinker() {
  const { id = '' } = useParams();
  const { s, t, d } = usePrefs();
  const view = thinkerView(graph, id);
  if (!view) return <p className="empty">No thinker with id <code>{id}</code>.</p>;

  const { thinker, tradition, school } = view;

  return (
    <article>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="hero__q" style={{ maxWidth: '20ch' }}>{d(thinker.name)}</h1>
        {thinker.nameSourceScript && (
          <p
            className={thinker.script === 'Arab' ? 'script-arab' : thinker.script === 'Hani' ? 'script-hani' : 'script-grek'}
            lang={thinker.script === 'Arab' ? 'ar' : thinker.script === 'Hani' ? 'zh' : 'grc'}
            dir={thinker.script === 'Arab' ? 'rtl' : 'ltr'}
          >
            {thinker.nameSourceScript}
          </p>
        )}
        {thinker.summary && <p className="lede">{t(thinker.summary)}</p>}
      </header>

      <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.4rem 1.25rem', marginBottom: '2rem' }}>
        <dt className="section-label" style={{ margin: 0 }}>{s.dates}</dt>
        <dd style={{ margin: 0 }}>
          {thinker.born || thinker.died
            ? [thinker.born, thinker.died].filter(Boolean).join(' – ')
            : <span className="prose-note">{s.datesUnknown}</span>}
        </dd>
        {school && (<><dt className="section-label" style={{ margin: 0 }}>{s.school}</dt><dd style={{ margin: 0 }}>{t(school.label)}</dd></>)}
        {tradition && (<><dt className="section-label" style={{ margin: 0 }}>{s.tradition}</dt><dd style={{ margin: 0 }}>{t(tradition.label)}</dd></>)}
        <dt className="section-label" style={{ margin: 0 }}>{s.thinkerWikidata}</dt>
        <dd style={{ margin: 0 }}>
          {thinker.wikidata
            ? <a href={`https://www.wikidata.org/wiki/${thinker.wikidata}`}>{thinker.wikidata}</a>
            : <span className="prose-note" style={{ color: 'var(--orpiment)' }}>{s.thinkerWikidataMissing}</span>}
        </dd>
      </dl>

      {tradition && <CoverageNote tradition={tradition} />}

      <section style={{ marginTop: '2rem' }}>
        <h2 className="section-label">{s.thinkerHeldPositions}</h2>
        {view.holdings.length === 0 ? (
          <p className="empty">{s.thinkerNoPositions}</p>
        ) : (
          <ul className="holders">
            {view.holdings.map((h) => (
              <li key={h.holds.id ?? h.position.id} style={{ display: 'block' }}>
                <p style={{ margin: 0 }}>
                  <Link to={`/positions/${h.position.id}`} style={{ fontWeight: 700 }}>
                    {t(h.position.label)}
                  </Link>
                  {' '}
                  <EpistemicMark
                    status={h.holds.epistemicStatus}
                    qualification={h.holds.qualification}
                    dispute={h.holds.scholarlyDispute}
                    sides={h.holds.sides}
                    alwaysShow
                  />
                </p>
                {h.question && (
                  <p className="prose-note" style={{ margin: '0.2rem 0 0' }}>
                    <Link to={`/questions/${h.question.id}`}>{t(h.question.canonical)}</Link>
                  </p>
                )}
                {h.holds.careerPhase && <p className="holder__qual">{t(h.holds.careerPhase)}</p>}
                {h.evidence === 'none' && (
                  <p className="prose-note" style={{ color: 'var(--orpiment)', margin: '0.2rem 0 0' }}>
                    {s.noSourcePassage}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!!thinker.sources?.length && (
        <section style={{ marginTop: '2rem' }}>
          <h2 className="section-label">{s.apparatus}</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {thinker.sources.map((src, i) => (
              <li key={i} className="apparatus__cite" style={{ marginBottom: '0.4rem' }}>
                {src.citation}
                {src.doi && <> · <a href={`https://doi.org/${src.doi}`}>doi:{src.doi}</a></>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

/* ------------------------------- terms ------------------------------- */

export function Terms() {
  const { s, t } = usePrefs();
  const concepts = graph.concepts();
  return (
    <article>
      <h1 className="hero__q" style={{ maxWidth: '20ch' }}>{s.termsTitle}</h1>
      <p className="lede" style={{ marginBottom: '2rem' }}>{s.termsBlurb}</p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
        {concepts.map((c) => (
          <li key={c.id} className="panel" style={{ margin: 0 }}>
            <h2 className="position__title" style={{ marginTop: 0 }}>
              <Link to={`/terms/${c.id}`}><ScriptTerm term={c.term} showRendering={false} /></Link>
            </h2>
            <p className="prose-note">{s.usuallyRendered}: {c.commonRendering ?? '—'}</p>
            {c.distortion && <p>{t(c.distortion)}</p>}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Concept() {
  const { id = '' } = useParams();
  const { s, t, text } = usePrefs();
  const view = conceptView(graph, id);
  if (!view) return <p className="empty">No term with id <code>{id}</code>.</p>;
  const { concept, cluster, tradition } = view;
  const rtl = concept.term.script === 'Arab';

  return (
    <article>
      <header style={{ marginBottom: '2rem' }}>
        <p className="hero__kicker"><Link to="/terms">{s.termsTitle}</Link></p>
        <h1 className="hero__q" style={{ maxWidth: '20ch' }}>
          <span className="translit">{concept.term.translit}</span>
        </h1>
        {concept.term.sourceScript && (
          <p
            className={rtl ? 'script-arab' : concept.term.script === 'Deva' ? 'script-deva' : 'script-hani'}
            lang={concept.term.lang}
            dir={rtl ? 'rtl' : 'ltr'}
            style={{ fontSize: '2rem' }}
          >
            {concept.term.sourceScript}
          </p>
        )}
      </header>

      <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.5rem 1.25rem', marginBottom: '2rem' }}>
        <dt className="section-label" style={{ margin: 0 }}>{s.sourceScript}</dt>
        <dd style={{ margin: 0 }} lang={concept.term.lang} dir={rtl ? 'rtl' : 'ltr'}>
          {concept.term.sourceScript ?? '—'}
        </dd>
        <dt className="section-label" style={{ margin: 0 }}>{s.transliteration}</dt>
        <dd style={{ margin: 0 }} className="translit">{concept.term.translit}</dd>
        <dt className="section-label" style={{ margin: 0 }}>{s.usuallyRendered}</dt>
        <dd style={{ margin: 0 }}>{concept.commonRendering ?? '—'}</dd>
      </dl>

      <div className="stack">
        <section>
          <h2 className="section-label">{s.semanticRange}</h2>
          {concept.semanticRange ? <p>{t(concept.semanticRange)}</p> : <NotYetWritten />}
          <FallbackNote shown={text(concept.semanticRange).fellBack} />
        </section>
        <section className="objection">
          <p className="objection__label">{s.whereItDistorts}</p>
          {concept.distortion ? <p>{t(concept.distortion)}</p> : <NotYetWritten />}
        </section>
        <section>
          <h2 className="section-label">{s.howWeRenderIt}</h2>
          {concept.interfaceRecommendation ? <p>{t(concept.interfaceRecommendation)}</p> : <NotYetWritten />}
        </section>
        {cluster.length > 0 && (
          <section>
            <h2 className="section-label">{s.seenAlongside}</h2>
            <ul className="holders">
              {cluster.map((c) => (
                <li key={c.id}>
                  <Link to={`/terms/${c.id}`}><ScriptTerm term={c.term} /></Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {tradition && <CoverageNote tradition={tradition} />}
        {!!concept.sources?.length && (
          <section>
            <h2 className="section-label">{s.apparatus}</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {concept.sources.map((src, i) => (
                <li key={i} className="apparatus__cite">{src.citation}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

/* --------------------------- your positions --------------------------- */

export function YourPositions() {
  const { s, t } = usePrefs();
  const [items, setItems] = useState<Commitment[]>([]);
  useEffect(() => setItems(loadCommitments()), []);

  return (
    <article>
      <h1 className="hero__q" style={{ maxWidth: '20ch' }}>{s.yoursTitle}</h1>
      <p className="lede" style={{ marginBottom: '2rem' }}>{s.yoursBlurb}</p>

      {items.length === 0 ? (
        <p className="empty">{s.yoursEmpty}</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1.25rem' }}>
            {items.map((c) => {
              const p = graph.position(c.position);
              const q = graph.question(c.question);
              if (!p) return null;
              return (
                <li key={c.position} className="panel" style={{ margin: 0 }}>
                  {q && (
                    <p className="prose-note">
                      <Link to={`/questions/${q.id}`}>{t(q.canonical)}</Link>
                    </p>
                  )}
                  <h2 className="position__title">
                    <Link to={`/positions/${p.id}`}>{t(p.label)}</Link>
                  </h2>
                  <p className="prose-note">
                    {s.yoursCommitted}: {new Date(c.committedAt).toLocaleDateString()}
                  </p>
                  {c.recall && (
                    <>
                      <p className="section-label" style={{ marginTop: '1rem' }}>{s.yoursRecall}</p>
                      <p style={{ fontStyle: 'italic' }}>{c.recall}</p>
                    </>
                  )}
                  {c.response && (
                    <>
                      <p className="section-label" style={{ marginTop: '1rem' }}>{s.yoursResponse}</p>
                      <p style={{ fontStyle: 'italic' }}>{c.response}</p>
                    </>
                  )}
                  {c.outcome === 'revised' && <p className="prose-note">{s.yoursRevised}</p>}
                </li>
              );
            })}
          </ul>
          <p className="hero__actions">
            <button
              type="button" className="btn"
              onClick={() => { clearCommitments(); setItems([]); }}
            >
              {s.yoursClear}
            </button>
          </p>
        </>
      )}
    </article>
  );
}

/* ------------------------------- about ------------------------------- */

export function About() {
  const issues = graph.issues();
  const byCode = new Map<string, number>();
  for (const i of issues) byCode.set(i.code, (byCode.get(i.code) ?? 0) + 1);

  return (
    <article style={{ maxWidth: '46rem' }}>
      <h1 className="hero__q" style={{ maxWidth: '20ch' }}>How this is built</h1>

      <div className="stack">
        <section>
          <h2 className="section-label">What this is</h2>
          <p>
            A question-first map of philosophical positions. The unit is the position, not
            the thinker and not the tradition, and the distinctive surface is the
            intersection view — where thinkers from traditions that never met turn out to
            have landed on the same answer, and where that resemblance turns out to be an
            artifact of the English word used to describe both.
          </p>
          <p>
            This is not an encyclopedia. The Stanford and Internet encyclopedias are better
            at that and are linked and cited rather than reproduced. Their text is never
            ingested here.
          </p>
        </section>

        <section>
          <h2 className="section-label">Rules the content follows</h2>
          <ul>
            <li>No citation, passage, page number, date or attribution is ever invented. A field with no source renders as “Not yet written”.</li>
            <li>A passage either quotes a verified text or says its locus could not be verified. It never shows an unattributed quotation.</li>
            <li>Attribution is a first-class object, not an edge: it carries the qualification, the epistemic status, the career phase, and the named sides of any scholarly dispute.</li>
            <li>“Contested” surfaces who reads it which way. A status with no sides is treated as a defect and flagged by the build.</li>
            <li>Cross-tradition convergences carry a verdict — genuine, superficial, or translation artifact — and a required statement of where the two part ways.</li>
            <li>Wikidata Q-IDs are the primary key for people. They are resolved against Wikidata or left null. They are never recalled from memory.</li>
          </ul>
        </section>

        <section>
          <h2 className="section-label">Sourcing and licensing</h2>
          <p>
            Encyclopedia text is linked and cited, never ingested. Quotations from
            copyrighted secondary literature are short and used under fair use, with the
            citation shown next to them. Where a source has a confessional or sectarian
            slant, that is displayed alongside the quotation rather than filed as metadata.
          </p>
        </section>

        <section>
          <h2 className="section-label">Content integrity report</h2>
          <p className="prose-note">
            Generated from the live graph on every build. Warnings are visible in the UI too.
          </p>
          <table className="graph-table">
            <thead><tr><th scope="col">Check</th><th scope="col">Count</th></tr></thead>
            <tbody>
              {[...byCode].map(([code, n]) => (
                <tr key={code}><th scope="row" style={{ textTransform: 'none', color: 'var(--ink)' }}>{code}</th><td>{n}</td></tr>
              ))}
              {byCode.size === 0 && <tr><td colSpan={2}>No issues.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </article>
  );
}

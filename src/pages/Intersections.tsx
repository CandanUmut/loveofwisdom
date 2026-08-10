import { Link } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { intersectionView, type IntersectionView } from '../graph/views';
import { Confluence, verdictClass } from '../components/Confluence';
import { FallbackNote } from '../components/Epistemic';

/**
 * The signature surface. Every intersection in the graph, honestly graded.
 * A translation_artifact card must not read like a genuine one — the verdict word,
 * the joint geometry and the colour channel all change together.
 */
export function IntersectionCard({ view, reveal = false }: { view: IntersectionView; reveal?: boolean }) {
  const { s, t, text } = usePrefs();
  const e = view.equivalence;
  const verdict = text(e.verdict ?? e.evidence);

  return (
    <section className={verdictClass(e.convergenceType)} aria-labelledby={`int-${e.id ?? view.a.ref}`}>
      <p className="intersection__verdict">
        {e.convergenceType === 'genuine' ? s.convergenceGenuine
          : e.convergenceType === 'superficial' ? s.convergenceSuperficial
            : s.convergenceArtifact}
        {' · '}
        {view.crossesTraditions ? s.crossesTraditions : s.withinOneTradition}
      </p>
      <h3 className="intersection__title" id={`int-${e.id ?? view.a.ref}`}>
        {t(e.title ?? `${view.a.ref} / ${view.b.ref}`)}
      </h3>

      <Confluence view={view} reveal={reveal} />

      <div className="intersection__grid">
        {e.convergesOn && (
          <div className="intersection__cell intersection__cell--converges">
            <h4>{s.convergesOn}</h4>
            <p>{t(e.convergesOn)}</p>
          </div>
        )}
        {e.partsWaysOn && (
          <div className="intersection__cell intersection__cell--parts">
            <h4>{s.partsWaysOn}</h4>
            <p>{t(e.partsWaysOn)}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4 className="section-label">{s.verdict}</h4>
        <p>{t(e.verdict ?? e.evidence)}</p>
        <FallbackNote shown={verdict.fellBack} />
      </div>

      {e.transmissionLink === 'uncertain' && (
        <p className="prose-note" style={{ marginTop: '0.75rem' }}>
          {s.transmission}: {s.transmissionUncertain}
        </p>
      )}

      {!!e.sources?.length && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0' }}>
          {e.sources.map((src, i) => (
            <li key={i} className="apparatus__cite">
              {src.citation}
              {src.doi && <> · <a href={`https://doi.org/${src.doi}`}>doi:{src.doi}</a></>}
              {src.perspectiveFlag && (
                <span style={{ color: 'var(--orpiment)' }}> · {src.perspectiveFlag}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {view.question && (
        <p style={{ marginTop: '0.85rem' }}>
          <Link className="prose-note" to={`/questions/${view.question.id}`}>
            {s.backToQuestion}
          </Link>
        </p>
      )}
    </section>
  );
}

export function Intersections() {
  const { s } = usePrefs();
  const views = graph.equivalences().map((e) => intersectionView(graph, e));
  const cross = views.filter((v) => v.crossesTraditions);
  const within = views.filter((v) => !v.crossesTraditions);

  return (
    <article>
      <h1 className="hero__q" style={{ maxWidth: '20ch' }}>{s.intersectionsHeading}</h1>
      <p className="lede" style={{ marginBottom: '2rem' }}>
        {s.homeIndexNote}
      </p>

      <h2 className="section-label">{s.crossesTraditions} ({cross.length})</h2>
      {cross.length === 0 && <p className="empty">{s.noIntersections}</p>}
      {cross.map((v) => (
        <IntersectionCard key={v.equivalence.id ?? v.a.ref + v.b.ref} view={v} />
      ))}

      {within.length > 0 && (
        <>
          <h2 className="section-label" style={{ marginTop: '2rem' }}>
            {s.withinOneTradition} ({within.length})
          </h2>
          {within.map((v) => (
            <IntersectionCard key={v.equivalence.id ?? v.a.ref + v.b.ref} view={v} />
          ))}
        </>
      )}
    </article>
  );
}

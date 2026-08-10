import { Link, useParams } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { questionView, type PositionView } from '../graph/views';
import { ApparatusProvider, ApparatusRail, Sigil } from '../components/Apparatus';
import { EpistemicMark, FallbackNote, NotYetWritten, ReportError } from '../components/Epistemic';
import { HolderRow, ScriptTerm } from '../components/pieces';
import { IntersectionCard } from './Intersections';

export function Question() {
  const { id = '' } = useParams();
  const { s, t, text } = usePrefs();
  const view = questionView(graph, id);

  if (!view) {
    return (
      <p className="empty">
        No question with id <code>{id}</code>. <Link to="/">{s.allQuestions}</Link>
      </p>
    );
  }

  const { question, answers, refusals, intersections, cases } = view;
  const canonical = text(question.canonical);

  return (
    <ApparatusProvider passages={view.apparatus}>
      <article>
        <header style={{ marginBottom: '2rem', maxWidth: '54rem' }}>
          <p className="hero__kicker">
            {t(question.domain)}
            {question.technicalName && <> · <span className="translit">{t(question.technicalName)}</span></>}
          </p>
          <h1 className="hero__q" style={{ maxWidth: '26ch' }}>{t(question.canonical)}</h1>
          <p className="hero__plain">{t(question.plain)}</p>
          <FallbackNote shown={canonical.fellBack} />
          {question.whyItMatters && (
            <p style={{ marginTop: '1rem' }}>
              <span className="section-label" style={{ display: 'inline', marginInlineEnd: '0.5rem' }}>
                {s.whyItMatters}
              </span>
              {t(question.whyItMatters)}
            </p>
          )}
          <p className="hero__actions">
            {view.tracer && (
              <Link className="btn btn--primary" to={`/questions/${question.id}/tracer`}>
                {s.tracerStart}
              </Link>
            )}
          </p>
        </header>

        <div className={`folio${view.apparatus.length === 0 ? ' folio--solo' : ''}`}>
          <div className="folio__text">
            <h2 className="section-label" id="positions">{s.positions}</h2>
            {answers.length === 0 && <NotYetWritten />}
            {answers.map((p, i) => (
              <PositionBlock key={p.position.id} view={p} index={i + 1} />
            ))}

            {refusals.length > 0 && (
              <section className="panel panel--refusal" aria-labelledby="refusals">
                <p className="panel__label" id="refusals">{s.refusalHeading}</p>
                <p style={{ marginBottom: '1rem' }}>{s.refusalNote}</p>
                {refusals.map((p) => (
                  <div key={p.position.id} className="position position--refusal" style={{ borderTop: 0 }}>
                    <h3 className="position__title">
                      <Link to={`/positions/${p.position.id}`}>{t(p.position.label)}</Link>
                    </h3>
                    {p.position.sourceTerm && (
                      <p><ScriptTerm term={p.position.sourceTerm} /></p>
                    )}
                    <p className="position__def">{t(p.position.definition)}</p>
                    <HolderList view={p} />
                  </div>
                ))}
              </section>
            )}

            <section aria-labelledby="intersections" style={{ marginTop: '2.5rem' }}>
              <h2 className="section-label" id="intersections">
                {s.intersectionsHeading}
              </h2>
              {intersections.length === 0 ? (
                <div className="empty">
                  <strong>{s.noIntersections}</strong>
                  <br />
                  {s.noIntersectionsWhy}
                </div>
              ) : (
                intersections.map((iv) => (
                  <IntersectionCard key={iv.equivalence.id ?? iv.a.ref + iv.b.ref} view={iv} />
                ))
              )}
            </section>

            {cases.map((c) => (
              <section key={c.id} className="panel panel--editorial" aria-labelledby={`case-${c.id}`}>
                <p className="panel__label" id={`case-${c.id}`}>{s.caseHeading}</p>
                <h3 className="position__title">{t(c.title)}</h3>
                <p>{t(c.scenario)}</p>
                <p className="prose-note" style={{ marginTop: '0.75rem' }}>{s.editorialNote}</p>
                <dl style={{ marginTop: '1rem' }}>
                  {c.implications.map((im) => {
                    const pos = graph.position(im.position);
                    if (!pos) return null;
                    return (
                      <div key={im.position} style={{ marginBottom: '1rem' }}>
                        <dt style={{ fontWeight: 700 }}>
                          <Link to={`/positions/${pos.id}`}>{t(pos.shortLabel ?? pos.label)}</Link>
                        </dt>
                        <dd style={{ margin: '0.25rem 0 0' }}>{t(im.implication)}</dd>
                        {im.cost && (
                          <dd style={{ margin: '0.35rem 0 0', color: 'var(--madder)' }}>
                            <span className="section-label" style={{ display: 'inline', marginInlineEnd: '0.4rem', color: 'var(--madder)' }}>
                              {s.whatItCosts}
                            </span>
                            {t(im.cost)}
                          </dd>
                        )}
                      </div>
                    );
                  })}
                </dl>
              </section>
            ))}

            {!!question.provenance?.length && (
              <p className="prose-note" style={{ marginTop: '2.5rem' }}>
                {question.provenance.join(' · ')}
              </p>
            )}
          </div>

          {view.apparatus.length > 0 && <ApparatusRail />}
        </div>
      </article>
    </ApparatusProvider>
  );
}

function HolderList({ view }: { view: PositionView }) {
  const { s } = usePrefs();
  if (view.holdings.length === 0) {
    return <p className="empty">{s.noHolders}</p>;
  }
  return (
    <>
      <p className="section-label" style={{ marginTop: '1rem' }}>{s.heldBy}</p>
      <ul className="holders">
        {view.holdings.map((h) => <HolderRow key={h.holds.id ?? h.thinker.id} holding={h} />)}
      </ul>
    </>
  );
}

export function PositionBlock({ view, index }: { view: PositionView; index: number }) {
  const { s, t, text } = usePrefs();
  const { position } = view;
  const def = text(position.definition);
  const arg = view.arguments[0];
  const obj = view.strongestObjection;

  return (
    <section className="position" aria-labelledby={`pos-${position.id}`}>
      <p className="position__num">{String(index).padStart(2, '0')}</p>
      <h3 className="position__title" id={`pos-${position.id}`}>
        <Link to={`/positions/${position.id}`}>{t(position.label)}</Link>
      </h3>
      {position.sourceTerm && <p><ScriptTerm term={position.sourceTerm} /></p>}
      <p className="position__def">{t(position.definition)}</p>
      <FallbackNote shown={def.fellBack} />

      {!!position.notYetWritten?.length && (
        <NotYetWritten what={position.notYetWritten.join(', ')} compact />
      )}

      <HolderList view={view} />

      {arg && (
        <div style={{ marginTop: '1.25rem' }}>
          <p className="section-label">{s.strongestArgument}</p>
          <p>
            {t(arg.claim.statement)}
            <Sigil passageIds={arg.claim.sourcePassages} />
          </p>
        </div>
      )}

      {obj && (
        <div className="objection">
          <p className="objection__label">{s.strongestObjection}</p>
          <h4 className="objection__title">{t(obj.claim.label ?? obj.claim.id)}</h4>
          <p>
            {t(obj.claim.statement)}
            <Sigil passageIds={obj.claim.sourcePassages} />
          </p>
          <EpistemicMark status={obj.claim.epistemicStatus ?? 'uncertain'} />
        </div>
      )}

      <p style={{ marginTop: '0.75rem' }}>
        <ReportError claimId={position.id} claimLabel={text(position.label).text} />
      </p>
    </section>
  );
}

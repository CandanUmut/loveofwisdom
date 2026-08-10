import { Link, useParams } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { positionView } from '../graph/views';
import { ApparatusProvider, ApparatusRail, Sigil } from '../components/Apparatus';
import { EpistemicMark, FallbackNote, NotYetWritten, ReportError } from '../components/Epistemic';
import { CoverageNote, HolderRow, ScriptTerm } from '../components/pieces';
import { IntersectionCard } from './Intersections';

export function Position() {
  const { id = '' } = useParams();
  const { s, t, d, text } = usePrefs();
  const view = positionView(graph, id);

  if (!view) {
    return <p className="empty">No position with id <code>{id}</code>. <Link to="/">{s.allQuestions}</Link></p>;
  }

  const { position } = view;
  const question = position.answersQuestion ? graph.question(position.answersQuestion) : undefined;
  const passages = [
    ...view.holdings.flatMap((h) => h.passages),
    ...view.arguments.flatMap((a) => a.passages),
    ...view.objections.flatMap((o) => o.passages),
  ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  const def = text(position.definition);

  return (
    <ApparatusProvider passages={passages}>
      <article>
        <header style={{ marginBottom: '2rem' }}>
          {question && (
            <p className="hero__kicker">
              <Link to={`/questions/${question.id}`}>{t(question.canonical)}</Link>
            </p>
          )}
          <h1 className="hero__q" style={{ maxWidth: '24ch' }}>{t(position.label)}</h1>
          {position.sourceTerm && <p><ScriptTerm term={position.sourceTerm} /></p>}
          {position.refusesQuestion && (
            <p className="panel panel--refusal" style={{ maxWidth: '52ch' }}>
              <span className="panel__label">{s.refusalHeading}</span>
              {s.refusalNote}
            </p>
          )}
        </header>

        <div className={`folio${passages.length === 0 ? ' folio--solo' : ''}`}>
          <div className="folio__text">
            <section>
              <h2 className="section-label">{s.positions}</h2>
              <p style={{ fontSize: '1.15rem' }}>{t(position.definition)}</p>
              <FallbackNote shown={def.fellBack} />
              {!!position.notYetWritten?.length && (
                <NotYetWritten what={position.notYetWritten.join(', ')} compact />
              )}
            </section>

            <section style={{ marginTop: '2rem' }}>
              <h2 className="section-label">{s.heldBy}</h2>
              {view.holdings.length === 0 ? (
                <p className="empty">{s.noHolders}</p>
              ) : (
                <ul className="holders">
                  {view.holdings.map((h) => <HolderRow key={h.holds.id ?? h.thinker.id} holding={h} />)}
                </ul>
              )}
              {view.traditions.map((tr) => <CoverageNote key={tr.id} tradition={tr} />)}
              {view.allAttributionsQualified && view.holdings.length > 0 && (
                <p className="prose-note" style={{ color: 'var(--orpiment)', marginTop: '0.75rem' }}>
                  † {s.contestedMeaning}
                </p>
              )}
            </section>

            {view.arguments.length > 0 && (
              <section style={{ marginTop: '2rem' }}>
                <h2 className="section-label">{s.strongestArgument}</h2>
                {view.arguments.map((a) => (
                  <div key={a.claim.id} style={{ marginBottom: '1.25rem' }}>
                    {a.claim.label && <h3 className="position__title">{t(a.claim.label)}</h3>}
                    <p>{t(a.claim.statement)}<Sigil passageIds={a.claim.sourcePassages} /></p>
                    {a.attributedTo.length > 0 && (
                      <p className="prose-note">
                        {a.attributedTo.map((th) => (
                          <Link key={th.id} to={`/thinkers/${th.id}`} style={{ marginInlineEnd: '0.5rem' }}>
                            {d(th.name)}
                          </Link>
                        ))}
                      </p>
                    )}
                    {a.evidence === 'none' && (
                      <p className="prose-note" style={{ color: 'var(--orpiment)' }}>{s.noSourcePassage}</p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {view.strongestObjection && (
              <section className="objection" style={{ marginTop: '2rem' }}>
                <p className="objection__label">{s.strongestObjection}</p>
                <h3 className="objection__title">
                  {t(view.strongestObjection.claim.label ?? view.strongestObjection.claim.id)}
                </h3>
                <p>
                  {t(view.strongestObjection.claim.statement)}
                  <Sigil passageIds={view.strongestObjection.claim.sourcePassages} />
                </p>
                <EpistemicMark status={view.strongestObjection.claim.epistemicStatus ?? 'uncertain'} alwaysShow />
                {!!view.strongestObjection.claim.standardReplies?.length && (
                  <>
                    <p className="section-label" style={{ marginTop: '1rem' }}>{s.standardReplies}</p>
                    <ul>
                      {view.strongestObjection.claim.standardReplies.map((r, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>{t(r)}</li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}

            {view.intersections.length > 0 && (
              <section style={{ marginTop: '2.5rem' }}>
                <h2 className="section-label">{s.intersectionsHeading}</h2>
                {view.intersections.map((iv) => (
                  <IntersectionCard key={iv.equivalence.id ?? iv.a.ref + iv.b.ref} view={iv} />
                ))}
              </section>
            )}

            <p style={{ marginTop: '2rem' }}>
              <ReportError claimId={position.id} claimLabel={text(position.label).text} />
            </p>
          </div>

          {passages.length > 0 && <ApparatusRail />}
        </div>
      </article>
    </ApparatusProvider>
  );
}

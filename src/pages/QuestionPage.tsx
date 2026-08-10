import { Link, useParams } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { questionView, type PositionView, type QuestionView } from '../graph/views';
import { positionBySlug, positionSlug, questionBySlug, questionSlug } from '../graph/slugs';
import { ApparatusProvider, ApparatusRail, Sigil } from '../components/Apparatus';
import { EpistemicMark, FallbackNote, NotYetWritten, ReportError } from '../components/Epistemic';
import { CoverageNote, HolderRow, ScriptTerm } from '../components/pieces';
import { IntersectionCard } from '../components/Intersection';
import { PositionPicker } from '../components/PositionPicker';
import { Reader } from '../components/Reader';
import { Gloss } from '../components/Gloss';

/**
 * One question. The reader lands on the framing — what is being asked and why it
 * matters — and picks a position from the left pane to read it. Phase 1 put the
 * position-locating interaction first, which asked a visitor to commit before they
 * knew what they were committing to; here that entry point sits at the foot of the
 * framing, after the positions have been seen.
 */
export function QuestionPage() {
  const { slug = '', position: positionSlugParam } = useParams();
  const { s, t } = usePrefs();

  const question = questionBySlug(graph, slug);
  if (!question) {
    return <NotFound what={slug} />;
  }
  const view = questionView(graph, question.id)!;
  const selected = positionSlugParam ? positionBySlug(graph, positionSlugParam) : undefined;
  const selectedView = selected
    ? [...view.answers, ...view.refusals].find((p) => p.position.id === selected.id)
    : undefined;

  // The apparatus shows sources for what is in the reading column — the whole question
  // when nothing is selected, that position alone once one is.
  const passages = selectedView
    ? dedupe([
      ...selectedView.holdings.flatMap((h) => h.passages),
      ...selectedView.arguments.flatMap((a) => a.passages),
      ...selectedView.objections.flatMap((o) => o.passages),
    ])
    : view.apparatus;

  return (
    <ApparatusProvider passages={passages}>
      <Reader
        label={t(question.canonical)}
        asideLabel={s.positions}
        apparatusLabel={s.apparatus}
        aside={<PositionPicker view={view} activeId={selected?.id} />}
        apparatus={passages.length > 0 ? <ApparatusRail /> : undefined}
      >
        {selectedView
          ? <PositionReading view={selectedView} question={view} />
          : <Framing view={view} />}
      </Reader>
    </ApparatusProvider>
  );
}

function dedupe<T extends { id: string }>(xs: T[]) {
  return xs.filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i);
}

function NotFound({ what }: { what: string }) {
  const { s } = usePrefs();
  return (
    <p className="empty" style={{ marginTop: '2rem' }}>
      Nothing here with the name <code>{what}</code>. <Link to="/questions">{s.allQuestions}</Link>
    </p>
  );
}

/** The question itself: what is asked, why it matters, and what is at stake across traditions. */
function Framing({ view }: { view: QuestionView }) {
  const { s, t, text } = usePrefs();
  const { question } = view;
  const canonical = text(question.canonical);
  const qs = questionSlug(question);

  return (
    <article>
      <header className="qhead">
        <p className="hero__kicker">
          {t(question.domain)}
          {question.technicalName && <> · <span className="translit">{t(question.technicalName)}</span></>}
        </p>
        <h1 className="hero__q">{t(question.canonical)}</h1>
        <p className="hero__plain"><Gloss>{t(question.plain)}</Gloss></p>
        <FallbackNote shown={canonical.fellBack} />
      </header>

      {question.whyItMatters && (
        <section className="stack-tight">
          <h2 className="section-label">{s.whyItMatters}</h2>
          <p><Gloss>{t(question.whyItMatters)}</Gloss></p>
        </section>
      )}

      <section style={{ marginTop: '1.75rem' }}>
        <h2 className="section-label">{s.howToRead}</h2>
        <p>{s.pickAPosition(view.answers.length + view.refusals.length)}</p>
        {view.refusals.length > 0 && (
          <p className="panel panel--refusal">
            <span className="panel__label">{s.refusalHeading}</span>
            {s.refusalNote}
          </p>
        )}
      </section>

      {view.intersections.length > 0 && (
        <section className="wide" style={{ marginTop: '2rem' }}>
          <h2 className="section-label">
            {s.intersectionsHeading} <span className="picker__count">{view.intersections.length}</span>
          </h2>
          {view.intersections.map((iv) => (
            <IntersectionCard key={iv.equivalence.id ?? iv.a.ref} view={iv} compact />
          ))}
          <p><Link className="prose-note" to="/intersections">{s.allIntersections}</Link></p>
        </section>
      )}

      {view.cases.map((c) => (
        <CaseBlock key={c.id} caseId={c.id} />
      ))}

      {/* The locating interaction lives here, after the positions — never as the first
          thing a newcomer meets. */}
      {view.tracer && (
        <section className="panel" style={{ marginTop: '2rem' }}>
          <p className="panel__label">{s.tracerStart}</p>
          <p>{s.tracerStartBlurb}</p>
          <p className="hero__actions">
            <Link className="btn btn--primary" to={`/questions/${qs}/locate`}>{s.tracerStart}</Link>
          </p>
        </section>
      )}

      {!!question.provenance?.length && (
        <p className="prose-note" style={{ marginTop: '2.5rem' }}>{question.provenance.join(' · ')}</p>
      )}
    </article>
  );
}

function CaseBlock({ caseId }: { caseId: string }) {
  const { s, t } = usePrefs();
  const rwc = graph.questions().flatMap((q) => graph.casesFor(q.id)).find((x) => x.id === caseId);
  if (!rwc) return null;
  return (
    <section className="panel panel--editorial" style={{ marginTop: '2rem' }}>
      <p className="panel__label">{s.caseHeading}</p>
      <h3 className="position__title">{t(rwc.title)}</h3>
      <p><Gloss>{t(rwc.scenario)}</Gloss></p>
      <p className="prose-note" style={{ marginTop: '0.75rem' }}>{s.editorialNote}</p>
    </section>
  );
}

/** A single position, in the reading column. */
function PositionReading({ view, question }: { view: PositionView; question: QuestionView }) {
  const { s, t, text } = usePrefs();
  const { position } = view;
  const def = text(position.definition);
  const qs = questionSlug(question.question);
  const index = [...question.answers, ...question.refusals].findIndex((p) => p.position.id === position.id) + 1;
  const rwc = view.case?.implications.find((i) => i.position === position.id);

  return (
    <article>
      <header className="qhead">
        <p className="hero__kicker">
          <Link to={`/questions/${qs}`}>{t(question.question.canonical)}</Link>
        </p>
        <p className="position__num">{String(index).padStart(2, '0')}</p>
        <h1 className="hero__q">{t(position.label)}</h1>
        {position.sourceTerm && <p><ScriptTerm term={position.sourceTerm} /></p>}
        {position.refusesQuestion && (
          <p className="panel panel--refusal">
            <span className="panel__label">{s.refusalHeading}</span>
            {s.refusalNote}
          </p>
        )}
      </header>

      <section>
        <h2 className="section-label">{s.inTheirTerms}</h2>
        <p style={{ fontSize: '1.12rem' }}><Gloss>{t(position.definition)}</Gloss></p>
        <FallbackNote shown={def.fellBack} />
        {!!position.notYetWritten?.length && (
          <NotYetWritten what={position.notYetWritten.join(', ')} compact />
        )}
      </section>

      <section style={{ marginTop: '1.75rem' }}>
        <h2 className="section-label">{s.heldBy}</h2>
        {view.holdings.length === 0
          ? <p className="empty">{s.noHolders}</p>
          : (
            <ul className="holders">
              {view.holdings.map((h) => <HolderRow key={h.holds.id ?? h.thinker.id} holding={h} />)}
            </ul>
          )}
        {view.traditions.map((tr) => <CoverageNote key={tr.id} tradition={tr} />)}
      </section>

      {view.arguments.length > 0 && (
        <section style={{ marginTop: '1.75rem' }}>
          <h2 className="section-label">{s.strongestArgument}</h2>
          {view.arguments.map((a) => (
            <div key={a.claim.id} style={{ marginBottom: '1.25rem' }}>
              {a.claim.label && <h3 className="position__title">{t(a.claim.label)}</h3>}
              <p><Gloss>{t(a.claim.statement)}</Gloss><Sigil passageIds={a.claim.sourcePassages} /></p>
              {a.attributedTo.length > 0 && (
                <p className="prose-note">
                  {a.attributedTo.map((th) => (
                    <Link key={th.id} to={`/thinkers/${th.id}`} style={{ marginInlineEnd: '0.5rem' }}>{th.name}</Link>
                  ))}
                </p>
              )}
              {a.evidence === 'none' && <p className="prose-note" style={{ color: 'var(--orpiment)' }}>{s.noSourcePassage}</p>}
            </div>
          ))}
        </section>
      )}

      {view.strongestObjection && (
        <section className="objection" style={{ marginTop: '1.75rem' }}>
          <p className="objection__label">{s.strongestObjection}</p>
          <h3 className="objection__title">
            {t(view.strongestObjection.claim.label ?? view.strongestObjection.claim.id)}
          </h3>
          <p>
            <Gloss>{t(view.strongestObjection.claim.statement)}</Gloss>
            <Sigil passageIds={view.strongestObjection.claim.sourcePassages} />
          </p>
          <EpistemicMark status={view.strongestObjection.claim.epistemicStatus ?? 'uncertain'} alwaysShow />
          {!!view.strongestObjection.claim.standardReplies?.length && (
            <>
              <p className="section-label" style={{ marginTop: '1rem' }}>{s.standardReplies}</p>
              <ul>
                {view.strongestObjection.claim.standardReplies.map((r, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}><Gloss>{t(r)}</Gloss></li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {view.intersections.length > 0 && (
        <section className="wide" style={{ marginTop: '2rem' }}>
          <h2 className="section-label">{s.intersectionsHeading}</h2>
          {view.intersections.map((iv) => (
            <IntersectionCard key={iv.equivalence.id ?? iv.a.ref} view={iv} compact />
          ))}
        </section>
      )}

      {rwc && view.case && (
        <section className="panel panel--editorial" style={{ marginTop: '2rem' }}>
          <p className="panel__label">{s.caseHeading}</p>
          <h3 className="position__title">{t(view.case.title)}</h3>
          <p><Gloss>{t(view.case.scenario)}</Gloss></p>
          <p className="section-label" style={{ marginTop: '1rem' }}>{s.ifYouHold}</p>
          <p><Gloss>{t(rwc.implication)}</Gloss></p>
          {rwc.cost && (
            <>
              <p className="section-label" style={{ marginTop: '0.85rem', color: 'var(--madder)' }}>{s.whatItCosts}</p>
              <p><Gloss>{t(rwc.cost)}</Gloss></p>
            </>
          )}
          <p className="prose-note" style={{ marginTop: '0.75rem' }}>{s.editorialNote}</p>
        </section>
      )}

      <p className="hero__actions" style={{ marginTop: '2rem' }}>
        <Link className="btn btn--sm" to={`/questions/${qs}/compare?a=${positionSlug(position)}`}>
          {s.compareWith}
        </Link>
        <ReportError claimId={position.id} claimLabel={text(position.label).text} />
      </p>
    </article>
  );
}

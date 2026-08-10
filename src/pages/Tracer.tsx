import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { positionView, questionView } from '../graph/views';
import { evaluate, saveCommitment, type Answers } from '../lib/tracer';
import { Sigil, ApparatusProvider, ApparatusRail } from '../components/Apparatus';
import { EpistemicMark } from '../components/Epistemic';
import { IntersectionCard } from './Intersections';

type Step = 'locate' | 'results' | 'confront' | 'join' | 'apply';

/**
 * The four-step interaction (research I.3), in order:
 *   1 locate    a commitment tracer over Position nodes
 *   2 confront  recall the position first, then the single best-attributed objection
 *   3 join      the intersection cluster — the one animated moment on the site
 *   4 apply     the position translated into an ordinary decision
 */
export function TracerPage() {
  const { id = '' } = useParams();
  const { s, t, d } = usePrefs();

  const qv = questionView(graph, id);
  const tracer = qv?.tracer;

  const [step, setStep] = useState<Step>('locate');
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [chosen, setChosen] = useState<string | null>(null);
  const [recall, setRecall] = useState('');
  const [response, setResponse] = useState('');
  const [objectionShown, setObjectionShown] = useState(false);
  const [saved, setSaved] = useState(false);

  const result = useMemo(() => (tracer ? evaluate(tracer, answers) : null), [tracer, answers]);

  if (!qv || !tracer) {
    return (
      <p className="empty">
        No tracer for this question yet. <Link to="/">{s.allQuestions}</Link>
      </p>
    );
  }

  const item = tracer.items[cursor];
  const pv = chosen ? positionView(graph, chosen) : undefined;

  const steps: Array<[Step[], string]> = [
    [['locate', 'results'], s.tracerStep1],
    [['confront'], s.tracerStep2],
    [['join'], s.tracerStep3],
    [['apply'], s.tracerStep4],
  ];

  return (
    <article className="tracer">
      <p className="hero__kicker">
        <Link to={`/questions/${qv.question.id}`}>{t(qv.question.canonical)}</Link>
      </p>

      <ol className="tracer__steps">
        {steps.map(([owns, label]) => (
          <li key={label} aria-current={owns.includes(step) ? 'step' : undefined}>{label}</li>
        ))}
      </ol>

      {/* ---------- 1. locate ---------- */}
      {step === 'locate' && (
        <section aria-labelledby="tracer-prompt">
          <p className="tracer__progress">{s.tracerOf(cursor + 1, tracer.items.length)}</p>
          <h1 className="tracer__prompt" id="tracer-prompt">{t(item.prompt)}</h1>
          {item.note && <p className="tracer__note">{t(item.note)}</p>}

          <div className="tracer__options">
            {item.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="tracer__option"
                aria-pressed={answers[item.id] === opt.id}
                onClick={() => {
                  const next = { ...answers, [item.id]: opt.id };
                  setAnswers(next);
                  if (cursor + 1 < tracer.items.length) setCursor(cursor + 1);
                  else setStep('results');
                }}
              >
                {t(opt.label)}
              </button>
            ))}
          </div>

          <p className="hero__actions">
            <button
              type="button" className="btn" disabled={cursor === 0}
              onClick={() => setCursor(Math.max(0, cursor - 1))}
            >
              {s.tracerBack}
            </button>
          </p>
        </section>
      )}

      {/* ---------- results of step 1 ---------- */}
      {step === 'results' && result && (
        <section aria-labelledby="tracer-results">
          <h1 className="tracer__prompt" id="tracer-results">{s.tracerResults}</h1>

          {result.hits.length > 0 && (
            <div className="hits">
              <p className="hits__label">{s.tracerConflicts}</p>
              <ul>
                {result.hits.map((h) => {
                  const p = graph.position(h.position);
                  return (
                    <li key={h.position}>
                      {s.tracerHitExplain(t(p?.shortLabel ?? p?.label ?? h.position))}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {result.entailed.length === 0 ? (
            <p className="empty">{s.tracerNoCommitment}</p>
          ) : (
            <>
              <p className="section-label">{s.tracerEntailed}</p>
              <div className="tracer__options">
                {result.entailed.map((pid) => {
                  const p = graph.position(pid);
                  if (!p) return null;
                  return (
                    <button
                      key={pid} type="button" className="tracer__option"
                      aria-pressed={chosen === pid}
                      onClick={() => { setChosen(pid); setStep('confront'); }}
                    >
                      <strong>{t(p.label)}</strong>
                      <br />
                      <span className="prose-note">{t(p.definition)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="prose-note" style={{ marginTop: '0.75rem' }}>{s.tracerCommit}</p>
            </>
          )}

          <p className="hero__actions">
            <button type="button" className="btn" onClick={() => { setStep('locate'); setCursor(0); }}>
              {s.tracerBack}
            </button>
          </p>
        </section>
      )}

      {/* ---------- 2. confront — the emotional centre ---------- */}
      {step === 'confront' && pv && (
        <section aria-labelledby="confront-heading">
          <h1 className="tracer__prompt" id="confront-heading">{t(pv.position.label)}</h1>
          <p className="tracer__note">{s.tracerConfrontIntro}</p>

          <label htmlFor="recall" className="section-label" style={{ display: 'block' }}>
            {s.tracerRecallPrompt}
          </label>
          <textarea
            id="recall" rows={3} value={recall} onChange={(e) => setRecall(e.target.value)}
            placeholder={s.tracerRecallPlaceholder}
            style={{
              width: '100%', font: 'inherit', padding: '0.7rem',
              background: 'var(--paper-2)', color: 'var(--ink)',
              border: '1px solid var(--rule-strong)', borderRadius: 'var(--radius)',
            }}
          />

          {!objectionShown ? (
            <p className="hero__actions">
              <button
                type="button" className="btn btn--primary"
                disabled={recall.trim().length < 3}
                onClick={() => setObjectionShown(true)}
              >
                {s.tracerRevealObjection}
              </button>
            </p>
          ) : pv.strongestObjection ? (
            <ApparatusProvider passages={pv.strongestObjection.passages}>
              <div className="folio" style={{ marginTop: '1.5rem' }}>
                <div className="folio__text">
                  <div className="objection">
                    <p className="objection__label">{s.strongestObjection}</p>
                    <h2 className="objection__title">
                      {t(pv.strongestObjection.claim.label ?? pv.strongestObjection.claim.id)}
                    </h2>
                    <p>
                      {t(pv.strongestObjection.claim.statement)}
                      <Sigil passageIds={pv.strongestObjection.claim.sourcePassages} />
                    </p>
                    {pv.strongestObjection.attributedTo.map((th) => (
                      <p key={th.id} className="prose-note">
                        <Link to={`/thinkers/${th.id}`}>{d(th.name)}</Link>
                      </p>
                    ))}
                    <EpistemicMark
                      status={pv.strongestObjection.claim.epistemicStatus ?? 'uncertain'}
                      alwaysShow
                    />
                  </div>

                  {!!pv.strongestObjection.claim.standardReplies?.length && (
                    <>
                      <p className="section-label">{s.standardReplies}</p>
                      <ul>
                        {pv.strongestObjection.claim.standardReplies.map((r, i) => (
                          <li key={i} style={{ marginBottom: '0.5rem' }}>{t(r)}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <label htmlFor="response" className="section-label" style={{ display: 'block', marginTop: '1.5rem' }}>
                    {s.tracerRespond}
                  </label>
                  <textarea
                    id="response" rows={4} value={response} onChange={(e) => setResponse(e.target.value)}
                    placeholder={s.tracerRespondPlaceholder}
                    style={{
                      width: '100%', font: 'inherit', padding: '0.7rem',
                      background: 'var(--paper-2)', color: 'var(--ink)',
                      border: '1px solid var(--rule-strong)', borderRadius: 'var(--radius)',
                    }}
                  />

                  <p className="hero__actions">
                    <button
                      type="button" className="btn btn--primary"
                      onClick={() => {
                        saveCommitment({
                          position: pv.position.id, question: qv.question.id,
                          committedAt: new Date().toISOString(),
                          recall, response, outcome: 'held', answers,
                        });
                        setStep('join');
                      }}
                    >
                      {s.tracerHold}
                    </button>
                    <button
                      type="button" className="btn"
                      onClick={() => { setChosen(null); setObjectionShown(false); setResponse(''); setStep('results'); }}
                    >
                      {s.tracerRevise}
                    </button>
                  </p>
                </div>
                <ApparatusRail />
              </div>
            </ApparatusProvider>
          ) : (
            <>
              <p className="empty">
                <strong>{s.notYetWritten}</strong> — {s.strongestObjection.toLowerCase()}.{' '}
                {s.notYetWrittenInvite}
              </p>
              <p className="hero__actions">
                <button type="button" className="btn btn--primary" onClick={() => setStep('join')}>
                  {s.tracerNext}
                </button>
              </p>
            </>
          )}
        </section>
      )}

      {/* ---------- 3. join — the one animated moment ---------- */}
      {step === 'join' && pv && (
        <section aria-labelledby="join-heading">
          <h1 className="tracer__prompt" id="join-heading">{s.intersectionsHeading}</h1>
          <p className="tracer__note">{s.tracerJoinIntro(t(pv.position.shortLabel ?? pv.position.label))}</p>

          {pv.intersections.length === 0 ? (
            <div className="empty">
              <strong>{s.noIntersections}</strong>
              <br />
              {s.noIntersectionsWhy}
            </div>
          ) : (
            pv.intersections.map((iv) => (
              <IntersectionCard key={iv.equivalence.id ?? iv.a.ref + iv.b.ref} view={iv} reveal />
            ))
          )}

          <p className="hero__actions">
            <button type="button" className="btn btn--primary" onClick={() => setStep('apply')}>
              {s.tracerNext}
            </button>
          </p>
        </section>
      )}

      {/* ---------- 4. apply ---------- */}
      {step === 'apply' && pv && (
        <section aria-labelledby="apply-heading">
          <h1 className="tracer__prompt" id="apply-heading">{s.caseHeading}</h1>
          <p className="tracer__note">{s.tracerApplyIntro}</p>

          {pv.case ? (
            <div className="panel panel--editorial">
              <h2 className="position__title">{t(pv.case.title)}</h2>
              <p>{t(pv.case.scenario)}</p>
              <p className="prose-note" style={{ marginTop: '0.75rem' }}>{s.editorialNote}</p>
              {pv.case.implications
                .filter((im) => im.position === pv.position.id)
                .map((im) => (
                  <div key={im.position} style={{ marginTop: '1.25rem' }}>
                    <p className="section-label">{s.ifYouHold}</p>
                    <p>{t(im.implication)}</p>
                    {im.cost && (
                      <>
                        <p className="section-label" style={{ marginTop: '1rem', color: 'var(--madder)' }}>
                          {s.whatItCosts}
                        </p>
                        <p>{t(im.cost)}</p>
                      </>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="empty">
              <strong>{s.notYetWritten}</strong> — {s.caseHeading.toLowerCase()}. {s.notYetWrittenInvite}
            </p>
          )}

          <p className="hero__actions">
            <button
              type="button" className="btn btn--primary"
              onClick={() => {
                saveCommitment({
                  position: pv.position.id, question: qv.question.id,
                  committedAt: new Date().toISOString(),
                  recall, response, outcome: 'held', answers,
                });
                setSaved(true);
              }}
            >
              {s.tracerDone}
            </button>
            <Link className="btn" to="/yours">{s.navYours}</Link>
          </p>
          <p aria-live="polite">{saved ? s.tracerSaved : ''}</p>
        </section>
      )}
    </article>
  );
}

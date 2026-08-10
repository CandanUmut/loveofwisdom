import { Link } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { intersectionView, questionMap } from '../graph/views';
import { questionSlug } from '../graph/slugs';
import { IntersectionCard } from '../components/Intersection';
import { Gloss } from '../components/Gloss';
import { loadCommitments } from '../lib/tracer';

/**
 * Home.
 *
 * Phase 1 opened with "Locate your position" as the first action, which asks a visitor
 * to commit before they know what they are committing to. Understanding comes first
 * now: one live question, entered directly, then the thing that makes this site
 * different — a real intersection, shown rather than described. The locating
 * interaction is offered from the question page, once the positions have been seen.
 *
 * Returning visitors get an entry point too, but only if they have one: the "continue"
 * link appears when there are saved commitments, not as a permanent call to action.
 */
export function HomePage() {
  const { s, t } = usePrefs();
  const entries = questionMap(graph);
  const seed = entries.find((e) => e.question.completeness === 'worked') ?? entries[0];
  const returning = loadCommitments();

  // Lead with a genuine cross-tradition convergence — preferring a translation artifact,
  // because "these look the same and are not" states the site's whole thesis in one card.
  const all = graph.equivalences().map((e) => intersectionView(graph, e)).filter((v) => v.crossesTraditions);
  const showcase = all.find((v) => v.equivalence.convergenceType === 'translation_artifact') ?? all[0];

  const totals = entries.reduce(
    (acc, e) => ({
      positions: acc.positions + e.positionCount + e.refusalCount,
      sourced: acc.sourced + e.sourcedClaimCount,
      claims: acc.claims + e.sourcedClaimCount + e.unsourcedClaimCount,
    }),
    { positions: 0, sourced: 0, claims: 0 },
  );

  return (
    <div className="page">
      <section className="hero">
        <p className="hero__kicker">{t(seed.question.domain)}</p>
        <h1 className="hero__q">
          <Link to={`/questions/${questionSlug(seed.question)}`}>{t(seed.question.canonical)}</Link>
        </h1>
        <p className="hero__plain"><Gloss>{t(seed.question.plain)}</Gloss></p>
        <p className="hero__actions">
          <Link className="btn btn--primary" to={`/questions/${questionSlug(seed.question)}`}>
            {s.seeWhoAnswered(seed.positionCount + seed.refusalCount)}
          </Link>
          <Link className="btn" to="/questions">{s.navQuestions}</Link>
          {returning.length > 0 && (
            <Link className="btn" to="/positions/mine">{s.continueWhereYouLeftOff}</Link>
          )}
        </p>
      </section>

      <section className="home-what" aria-labelledby="what">
        <h2 className="section-label" id="what">{s.whatThisIs}</h2>
        <p className="lede">{s.whatThisIsBody}</p>
      </section>

      {showcase && (
        <section className="wide" aria-labelledby="showcase" style={{ marginTop: '2.5rem' }}>
          <h2 className="section-label" id="showcase">{s.homeShowcase}</h2>
          <IntersectionCard view={showcase} compact />
          <p><Link className="prose-note" to="/intersections">{s.allIntersections}</Link></p>
        </section>
      )}

      <section aria-labelledby="state" style={{ marginTop: '2.5rem' }}>
        <h2 className="section-label" id="state">{s.stateOfTheWork}</h2>
        <ul className="ledger-list">
          <li><strong>{entries.length}</strong> {s.navQuestions.toLowerCase()}</li>
          <li><strong>{totals.positions}</strong> {s.positions.toLowerCase()}</li>
          <li><strong>{graph.concepts().length}</strong> {s.navTerms.toLowerCase()}</li>
          <li>
            <strong>{totals.sourced}/{totals.claims}</strong> {s.colSourcing.toLowerCase()}
          </li>
        </ul>
        <p className="prose-note">{s.stateOfTheWorkNote}</p>
      </section>
    </div>
  );
}

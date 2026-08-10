import { Link } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { questionMap } from '../graph/views';

/**
 * The home page is an index locorum, not a hero (design pass 2, §6).
 *
 * One question is set large and entered directly. Beneath it, the corpus as a dense
 * table with a sourcing ledger — how many attributions cite a source passage against
 * how many do not. A table that says on the front page that three of four questions are
 * stubs is more useful than any hero copy, and it is the only honest way to open a site
 * whose whole claim is that it does not fabricate.
 */
export function Home() {
  const { s, t, d } = usePrefs();
  const entries = questionMap(graph);
  const seed = entries.find((e) => e.question.completeness === 'worked') ?? entries[0];
  const rest = entries.filter((e) => e !== seed);

  return (
    <>
      <section className="hero">
        <p className="hero__kicker">{s.homeKicker} · {d(t(seed.question.domain))}</p>
        <h1 className="hero__q">
          <Link to={`/questions/${seed.question.id}`}>{t(seed.question.canonical)}</Link>
        </h1>
        <p className="hero__plain">{t(seed.question.plain)}</p>
        <div className="hero__actions">
          <Link className="btn btn--primary" to={`/questions/${seed.question.id}/tracer`}>
            {s.tracerStart}
          </Link>
          <Link className="btn" to={`/questions/${seed.question.id}`}>
            {s.positions} ({seed.positionCount})
          </Link>
        </div>
      </section>

      <section aria-labelledby="corpus">
        <h2 id="corpus" className="section-label">{s.homeIndexTitle}</h2>
        <p className="lede" style={{ marginBottom: '1.5rem' }}>{s.homeIndexNote}</p>

        <div className="table-scroll" tabIndex={0} role="region" aria-labelledby="corpus">
        <table className="index">
          <colgroup>
            <col style={{ width: '34%' }} /><col /><col style={{ width: '24%' }} /><col /><col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">{s.colQuestion}</th>
              <th scope="col">{s.colPositions}</th>
              <th scope="col">{s.colTraditions}</th>
              <th scope="col">{s.colIntersections}</th>
              <th scope="col">{s.colSourcing}</th>
            </tr>
          </thead>
          <tbody>
            {[seed, ...rest].map((e) => {
              const total = e.sourcedClaimCount + e.unsourcedClaimCount;
              return (
                <tr key={e.question.id}>
                  <td className="index__q-cell">
                    <span className="index__q">
                      <Link to={`/questions/${e.question.id}`}>{t(e.question.canonical)}</Link>
                    </span>
                    <span className="index__domain">
                      {t(e.question.domain)} · {e.question.completeness === 'worked' ? s.worked : s.stub}
                    </span>
                    {e.question.westernFramedMismatch && (
                      <span className="index__flag">{s.refusalHeading}</span>
                    )}
                  </td>
                  <td className="num" data-label={s.colPositions}>
                    {e.positionCount}
                    {e.refusalCount > 0 && (
                      <>
                        <br />
                        <span className="ledger">+ {s.refusalsCount(e.refusalCount)}</span>
                      </>
                    )}
                  </td>
                  <td className="num trads" data-label={s.colTraditions}>
                    {e.traditions.length === 0 ? '—' : e.traditions.map((tr) => t(tr.label)).join(', ')}
                  </td>
                  <td className="num" data-label={s.colIntersections}>
                    {e.crossTraditionIntersectionCount || '—'}
                  </td>
                  <td className="num" data-label={s.colSourcing}>
                    {total === 0 ? (
                      <span className="ledger ledger__unsourced">—</span>
                    ) : (
                      <span className="ledger">
                        {s.sourcedOf(e.sourcedClaimCount, total)}
                        {e.unsourcedClaimCount > 0 && (
                          <span className="ledger__unsourced"> †{e.unsourcedClaimCount}</span>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </section>
    </>
  );
}

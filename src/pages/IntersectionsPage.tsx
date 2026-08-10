import { Link } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { intersectionView } from '../graph/views';
import { IntersectionCard } from '../components/Intersection';

/**
 * The signature surface. Cross-tradition convergences first, because those are the ones
 * that make the point; same-tradition ones follow, labelled as such rather than mixed in.
 */
export function IntersectionsPage() {
  const { s } = usePrefs();
  const views = graph.equivalences().map((e) => intersectionView(graph, e));
  const cross = views.filter((v) => v.crossesTraditions);
  const within = views.filter((v) => !v.crossesTraditions);

  return (
    <article className="page">
      <h1 className="hero__q">{s.intersectionsHeading}</h1>
      <p className="lede">{s.intersectionsBlurb}</p>

      <section style={{ marginTop: '2rem' }} aria-labelledby="ixn-cross">
        <h2 className="section-label" id="ixn-cross">
          {s.crossesTraditions} <span className="picker__count">{cross.length}</span>
        </h2>
        {cross.length === 0
          ? <p className="empty">{s.noIntersections}</p>
          : cross.map((v) => <IntersectionCard key={v.equivalence.id ?? v.a.ref} view={v} />)}
      </section>

      {within.length > 0 && (
        <section style={{ marginTop: '2.5rem' }} aria-labelledby="ixn-within">
          <h2 className="section-label" id="ixn-within">
            {s.withinOneTradition} <span className="picker__count">{within.length}</span>
          </h2>
          {within.map((v) => <IntersectionCard key={v.equivalence.id ?? v.a.ref} view={v} />)}
        </section>
      )}

      <p className="prose-note" style={{ marginTop: '2rem' }}>
        <Link to="/about">{s.howVerdictsWork}</Link>
      </p>
    </article>
  );
}

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { graph } from '../app/graph';
import { usePrefs } from '../app/prefs';
import { positionPath, questionSlug } from '../graph/slugs';
import type { PositionView } from '../graph/views';

/**
 * The shareable card: the reader's position, who else holds it, and the strongest
 * objection to it. This is the artifact that leaves the site, so it has to carry the
 * objection — a card that only says "here is what I believe" is a bumper sticker, and
 * the objection is the part that makes it worth sending to someone.
 *
 * Copying puts plain text on the clipboard rather than an image: text survives being
 * pasted anywhere, keeps the link, and cannot misquote the site by being cropped.
 */
export function PositionCard({ view }: { view: PositionView }) {
  const { s, t, d } = usePrefs();
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const q = view.position.answersQuestion ? graph.question(view.position.answersQuestion) : undefined;
  const others = view.holdings.slice(0, 4);
  const obj = view.strongestObjection;
  const url = typeof location === 'undefined' ? ''
    : `${location.origin}${location.pathname}#${positionPath(graph, view.position)}`;

  const asText = [
    q ? `${t(q.canonical)}` : '',
    `My position: ${t(view.position.label)}`,
    others.length ? `In company with: ${others.map((h) => d(h.thinker.name)).join(', ')}` : '',
    obj ? `The strongest objection to it: ${t(obj.claim.label ?? obj.claim.id)} — ${t(obj.claim.statement)}` : '',
    url,
  ].filter(Boolean).join('\n\n');

  return (
    <div>
      <div className="pcard" ref={ref}>
        {q && <p className="pcard__kicker">{t(q.canonical)}</p>}
        <h2 className="pcard__pos">{t(view.position.label)}</h2>

        {others.length > 0 && (
          <div className="pcard__row">
            <h3>{s.cardInCompanyWith}</h3>
            <p>
              {others.map((h, i) => (
                <span key={h.thinker.id}>
                  {i > 0 && ', '}
                  {d(h.thinker.name)}
                  {h.tradition && <span className="prose-note"> ({t(h.tradition.label)})</span>}
                </span>
              ))}
            </p>
          </div>
        )}

        <div className="pcard__row">
          <h3>{s.cardCosts}</h3>
          {obj
            ? <p>{t(obj.claim.label ?? obj.claim.id)} — {t(obj.claim.statement)}</p>
            : <p className="prose-note">{s.notYetWritten}</p>}
        </div>

        <div className="pcard__foot">
          <span>{s.siteName}</span>
          {q && <Link to={`/questions/${questionSlug(q)}`}>{s.cardReadIt}</Link>}
        </div>
      </div>

      <p className="hero__actions">
        <button
          type="button" className="btn"
          onClick={async () => {
            try { await navigator.clipboard.writeText(asText); setCopied(true); }
            catch { setCopied(false); }
          }}
        >
          {s.cardCopy}
        </button>
      </p>
      <p aria-live="polite" className="prose-note">{copied ? s.cardCopied : ''}</p>
    </div>
  );
}

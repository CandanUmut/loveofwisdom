import { useId, useState } from 'react';
import { usePrefs } from '../app/prefs';
import type { EpistemicStatus, LocalizedString, Side } from '../graph/types';

/**
 * Epistemic status, as apparatus marks rather than badges (design pass 2, §3).
 *
 * `†` contested, `‡` uncertain, and *nothing at all* for settled. Absence is the signal
 * for the ordinary case, so a well-attested page reads quiet and a disputed one reads
 * annotated — not alarmed. Every mark expands to the named sides, because a status with
 * no sides is a defect and a status with sides is content.
 */

const GLYPH: Record<EpistemicStatus, string> = { settled: '', contested: '†', uncertain: '‡' };

export function EpistemicMark({
  status, qualification, dispute, sides, alwaysShow = false,
}: {
  status: EpistemicStatus;
  qualification?: LocalizedString;
  dispute?: LocalizedString;
  sides?: Side[];
  /** Show a mark even for `settled`. Used on pages that list statuses side by side. */
  alwaysShow?: boolean;
}) {
  const { s, t, text } = usePrefs();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const word = s[status];
  const meaning = status === 'settled' ? s.settledMeaning
    : status === 'contested' ? s.contestedMeaning : s.uncertainMeaning;

  if (status === 'settled' && !alwaysShow && !qualification) return null;

  const hasDetail = !!(dispute || sides?.length || qualification);

  return (
    <span>
      <button
        type="button"
        className={`emark emark--${status}`}
        aria-expanded={hasDetail ? open : undefined}
        aria-controls={hasDetail ? panelId : undefined}
        onClick={() => hasDetail && setOpen((v) => !v)}
        title={meaning}
        disabled={!hasDetail}
      >
        {GLYPH[status] && <span className="emark__glyph" aria-hidden="true">{GLYPH[status]}</span>}
        <span className="emark__word">{word}</span>
      </button>

      {hasDetail && open && (
        <div id={panelId}>
          <p className="prose-note" style={{ marginTop: '0.4rem' }}>{meaning}</p>
          {qualification && <p style={{ fontStyle: 'italic' }}>{t(qualification)}</p>}
          {dispute && <p>{t(dispute)}</p>}
          {!!sides?.length && (
            <>
              <p className="section-label" style={{ marginTop: '0.75rem' }}>{s.sides}</p>
              <ul className="sides">
                {sides.map((side, i) => (
                  <li key={i}>
                    {side.who && <span className="sides__who">{side.who}</span>}
                    <span>{t(side.reading)}</span>
                    {side.citation && <span className="sides__cite">{side.citation}</span>}
                    {text(side.reading).fellBack && (
                      <span className="sides__cite">{s.notTranslated}</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </span>
  );
}

/** Per-claim error reporting (research G.3). Opens the reader's mail client — no backend in the MVP. */
export function ReportError({ claimId, claimLabel }: { claimId: string; claimLabel: string }) {
  const { s } = usePrefs();
  const href =
    `mailto:corrections@example.invalid?subject=${encodeURIComponent(`Error report: ${claimId}`)}` +
    `&body=${encodeURIComponent(
      `Claim: ${claimLabel}\nId: ${claimId}\nPage: ${typeof location === 'undefined' ? '' : location.href}\n\nWhat is wrong:\n`,
    )}`;
  return (
    <a className="prose-note" href={href} style={{ textDecoration: 'underline' }}>
      {s.reportError}
    </a>
  );
}

/**
 * An honest empty state. An invitation, never a shrug.
 *
 * `compact` names the missing fields on one line. The stub questions stack several of
 * these per position, and repeating the full explanation each time turned three honest
 * gaps into a wall of apology — which reads as broken rather than as candid.
 */
export function NotYetWritten({ what, compact = false }: { what?: string; compact?: boolean }) {
  const { s } = usePrefs();
  if (compact) {
    return (
      <p className="empty empty--compact">
        <strong>{s.notYetWritten}</strong>{what ? `: ${what}` : ''}
      </p>
    );
  }
  return (
    <p className="empty">
      <strong>{s.notYetWritten}</strong>
      {what ? ` — ${what}. ` : '. '}
      {s.notYetWrittenInvite}
    </p>
  );
}

/** Marks content shown in English because no translation exists for the active locale. */
export function FallbackNote({ shown }: { shown: boolean }) {
  const { s } = usePrefs();
  if (!shown) return null;
  return <p className="prose-note">{s.notTranslated}</p>;
}

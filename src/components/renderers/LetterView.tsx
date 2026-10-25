import { useState } from 'react';
import type { LetterContent } from '../../content/types.ts';
import { assetUrl } from '../../lib/assets.ts';

export function LetterView({ content }: { content: LetterContent }) {
  const [giftOpen, setGiftOpen] = useState(false);
  return (
    <>
      <article className="letter">
        <p className="letter__greeting">{content.greeting}</p>
        {content.paragraphs.map((p) => <p key={p}>{p}</p>)}
        <p className="letter__closing">{content.closing}</p>
        <p className="letter__signature">{content.signature}</p>
      </article>
      {content.gift && (
        <section className="gift" aria-live="polite">
          {!giftOpen ? (
            <button type="button" className="btn btn--gold btn--wide" onClick={() => setGiftOpen(true)}>Scopri il regalo</button>
          ) : (
            <div className="gift__reveal">
              <img src={assetUrl('assets/games/finale.svg')} alt="" width="400" height="240" />
              <h3>{content.gift.title}</h3>
              <p>{content.gift.description}</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}

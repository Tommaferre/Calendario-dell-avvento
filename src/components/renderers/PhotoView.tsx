import { useState } from 'react';
import type { PhotoContent } from '../../content/types.ts';
import { assetUrl } from '../../lib/assets.ts';

export function PhotoView({ content, fallbackArt }: { content: PhotoContent; fallbackArt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="photo">
      {failed ? (
        <div className="photo__fallback" role="img" aria-label={content.alt}>
          <img src={assetUrl(fallbackArt)} alt="" />
          <p>La fotografia non è disponibile in questo momento.</p>
        </div>
      ) : (
        <img className="photo__img" src={assetUrl(content.image)} alt={content.alt} onError={() => setFailed(true)} />
      )}
      <figcaption>{content.caption}</figcaption>
    </figure>
  );
}

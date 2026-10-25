import type { VoucherContent } from '../../content/types.ts';
import { assetUrl } from '../../lib/assets.ts';

interface Props {
  content: VoucherContent;
  art: string;
  redeemedAt: string | undefined;
  onToggle: () => void;
}

export function VoucherView({ content, art, redeemedAt, onToggle }: Props) {
  const used = Boolean(redeemedAt);
  const when = redeemedAt ? new Date(redeemedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return (
    <article className={`voucher ${used ? 'voucher--used' : ''}`}>
      <img className="voucher__art" src={assetUrl(art)} alt="" />
      <h3 className="voucher__title">{content.title}</h3>
      <p>{content.description}</p>
      <p className="voucher__redeem"><strong>Come si usa.</strong> {content.redeem}</p>
      {content.validity && <p className="voucher__validity">{content.validity}</p>}
      {used && <p className="voucher__stamp" role="status">Buono usato il {when}</p>}
      <button type="button" className={`btn ${used ? 'btn--ghost' : 'btn--gold'} btn--wide`} onClick={onToggle}>
        {used ? 'Segna come non usato' : 'Segna come usato'}
      </button>
    </article>
  );
}

import { assetUrl } from '../lib/assets.ts';

interface Props { title: string; dedication: string[]; howTo: string; opened: number; total: number }

export function Header({ title, dedication, howTo, opened, total }: Props) {
  const pct = Math.round((opened / total) * 100);
  return (
    <header className="hero">
      <div className="lights" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 5) * 0.4}s` }} />)}</div>
      <img className="hero__img" src={assetUrl('assets/advent/calendar-hero.svg')} alt="" width="400" height="400" />
      <h1 className="hero__title">{title}</h1>
      <div className="hero__dedication">{dedication.map((p) => <p key={p}>{p}</p>)}</div>
      <p className="hero__howto">{howTo}</p>
      <div className="progress" role="progressbar" aria-label="Sorprese aperte" aria-valuemin={0} aria-valuemax={total} aria-valuenow={opened} aria-valuetext={`${opened} di ${total} sorprese aperte`}>
        <div className="progress__bar"><div className="progress__fill" style={{ width: `${pct}%` }} /></div>
        <p className="progress__label">{opened} di {total} sorprese aperte</p>
      </div>
    </header>
  );
}

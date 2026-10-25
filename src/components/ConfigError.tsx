export function ConfigError({ errors }: { errors: string[] }) {
  return (
    <main className="page config-error" role="alert">
      <h1>Configurazione da correggere</h1>
      <p>Il file dei contenuti contiene errori. Correggili in <code>src/content/advent-content.json</code> o <code>config/app.json</code>:</p>
      <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
    </main>
  );
}

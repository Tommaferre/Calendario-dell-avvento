/** Risolve un percorso di public/ rispettando il base path (GitHub Pages). */
export const assetUrl = (relativePath: string): string => `${import.meta.env.BASE_URL}${relativePath}`;

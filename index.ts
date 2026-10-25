import appJson from '../../config/app.json';
import contentJson from './advent-content.json';
import { validateContent } from './types.ts';
import type { AdventContent, AppConfig } from './types.ts';

export const appConfig: AppConfig = appJson;
export const adventContent = contentJson as unknown as AdventContent;
/** Errori di configurazione dei contenuti (vuoto se tutto è a posto). */
export const contentErrors: string[] = validateContent(adventContent, appConfig);

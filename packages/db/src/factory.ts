/**
 * Ortak data source factory.
 *
 * DATA_SOURCE=firestore  → gerçek Firestore adapter (lazy Firebase init)
 * DATA_SOURCE=memory     → in-memory seed bundle (varsayılan / dev / demo)
 *
 * Singleton: ilk çağrıda seçilir, sonraki çağrılar aynı bundle'ı döner.
 */

import { createInMemoryRepositoryBundle } from "./in-memory";
import { firestoreSeedData } from "./seeds";
import type { UstacaRepositoryBundle } from "./repositories";

let _bundle: UstacaRepositoryBundle | null = null;

export const createRepositoryBundle = (): UstacaRepositoryBundle => {
  if (_bundle) return _bundle;

  const dataSource = process.env["DATA_SOURCE"];

  if (dataSource === "firestore") {
    // Lazy import: firestore.ts yalnızca Firestore modu seçildiğinde yüklenir.
    // firebase-admin server-side only; Next.js server component'lerde güvenli.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createFirestoreRepositoryBundle } = require("./firestore") as {
      createFirestoreRepositoryBundle: () => UstacaRepositoryBundle;
    };
    _bundle = createFirestoreRepositoryBundle();
  } else {
    _bundle = createInMemoryRepositoryBundle(firestoreSeedData);
  }

  return _bundle;
};

/**
 * Test / seed scriptleri için bundle'ı sıfırla.
 * Normal uygulama kodunda çağrılmamalı.
 */
export const resetRepositoryBundle = (): void => {
  _bundle = null;
};

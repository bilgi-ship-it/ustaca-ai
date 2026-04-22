import { DataTable, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { saveGalleryAssetAction } from "@/lib/actions";
import { requireCustomerSession } from "@/lib/auth";
import { resolvePanelFeedback } from "@/lib/feedback";
import { buildGalleryRows, getCustomerWorkspaceForSession } from "@/lib/data";

export default async function GalleryPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const feedback = await resolvePanelFeedback(searchParams, {
    saved: {
      gallery_saved: "Galeri gorseli kaydedildi."
    },
    error: {
      gallery_invalid: "Gorsel bilgilerini ve baglantiyi tekrar kontrol et.",
      save_failed: "Gorsel kaydedilirken bir sorun oldu. Birazdan tekrar deneyebilirsin."
    }
  });
  const galleryRows = buildGalleryRows(workspace);
  const leadAsset = workspace.gallery.find((asset) => asset.highlight) ?? workspace.gallery[0];

  return (
    <div className="page-stack">
      {feedback ? (
        <p className={feedback.tone === "critical" ? "form-message form-message--critical" : "form-message"}>
          {feedback.message}
        </p>
      ) : null}

      <div className="two-column">
        <SurfaceCard
          eyebrow="gorsel ekle"
          title="Yeni gorsel hazirla"
          description="Fotografin hazirsa baglanti veya isim bilgisiyle ekleyebilirsin. Gorsel olmadan da siten yayinda kalir."
        >
          <form action={saveGalleryAssetAction} className="form-stack">
            <input name="assetId" type="hidden" value={leadAsset?.id ?? ""} />

            <div className="field">
              <label htmlFor="galleryTitle">Gorsel basligi</label>
              <input
                defaultValue={leadAsset?.title ?? ""}
                id="galleryTitle"
                name="title"
              />
            </div>

            <div className="field">
              <label htmlFor="galleryCategory">Kategori</label>
              <input
                defaultValue={leadAsset?.category ?? ""}
                id="galleryCategory"
                name="category"
              />
            </div>

            <div className="field">
              <label htmlFor="galleryImageUrl">Gorsel baglantisi</label>
              <input
                defaultValue={leadAsset?.imageUrl ?? ""}
                id="galleryImageUrl"
                name="imageUrl"
              />
            </div>

            <div className="field">
              <label htmlFor="galleryHighlight">Kapakta one ciksin mi?</label>
                <select
                  defaultValue={leadAsset?.highlight ? "yes" : "no"}
                  id="galleryHighlight"
                  name="highlight"
                >
                  <option value="yes">Evet</option>
                  <option value="no">Hayir</option>
              </select>
            </div>

            <div className="button-row">
              <button className="button-primary" name="intent" type="submit" value="upsert">
                Gorseli kaydet
              </button>
              <button className="button-secondary" name="intent" type="submit" value="create">
                Yeni gorsel olarak ekle
              </button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="not"
          title="Gorsel zorunlu degil"
          description="Ilk kurulumda tum fotograflar hazir degilse bile siten yayina acilmaya devam eder."
        >
          <ul className="stack-list">
            <li>Kapak alaninda en guclu fotografi kullanman yeterli.</li>
            <li>Galeriye daha sonra diledigin kadar yeni gorsel ekleyebilirsin.</li>
            <li>Gorsel eksigi teknik sureci durdurmaz; sadece vitrini daha guclu hale getirir.</li>
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="galeri"
        title="Gorsellerini duzenle, siten yayinda kalsin"
        description="Galeri gorunumu siteni guclendirir ama gorsel eksikligi sitenin yayinina engel olmaz."
      >
        <DataTable
          caption="Yuklu gorseller"
          columns={[
            {
              key: "title",
              header: "Gorsel",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.title}</strong>
                  <span className="cell-muted">{row.category}</span>
                </div>
              )
            },
            {
              key: "publishedAt",
              header: "Yayin",
              render: (row) => <span>{row.publishedAt}</span>
            },
            {
              key: "highlight",
              header: "Kapak",
              render: (row) => <StatusBadge label={row.highlightLabel} tone={row.highlightTone} />
            }
          ]}
          rows={galleryRows}
        />
      </SurfaceCard>
    </div>
  );
}

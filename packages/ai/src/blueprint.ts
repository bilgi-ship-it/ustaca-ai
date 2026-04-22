import { z } from "zod";

import { productModuleCodeSchema } from "@ustaca/domain";

export const themeFamilySchema = z.enum([
  "service_modern",
  "premium_showcase",
  "warm_local_business",
  "corporate_clean",
  "startup_motion"
]);

export const projectClassificationSchema = z.enum(["standard_product", "special_project"]);

export const siteBlueprintSchema = z.object({
  businessName: z.string(),
  sector: z.string(),
  subSector: z.string(),
  siteGoal: z.string(),
  themeFamily: themeFamilySchema,
  ctaStyle: z.string(),
  colorDirection: z.string(),
  sections: z.array(z.string()),
  productModules: z.array(productModuleCodeSchema),
  assistantDirections: z.array(z.string()),
  excludedCapabilities: z.array(z.string())
});

export const generationStageSchema = z.enum([
  "collect",
  "classify",
  "blueprint",
  "generate",
  "validate",
  "publish"
]);

export type ThemeFamily = z.infer<typeof themeFamilySchema>;
export type ProjectClassification = z.infer<typeof projectClassificationSchema>;
export type SiteBlueprint = z.infer<typeof siteBlueprintSchema>;
export type GenerationStage = z.infer<typeof generationStageSchema>;

export const themeFamilyCatalog: Record<
  ThemeFamily,
  {
    label: string;
    intent: string;
  }
> = {
  service_modern: {
    label: "Hizmet Odakli Modern",
    intent: "Temizlik, tamirat, tesisat ve saha hizmetleri icin net CTA'li hizli akis."
  },
  premium_showcase: {
    label: "Premium Vitrin",
    intent: "Klinik, guzellik, danismanlik ve premium hizmetlerde vitrin algisi yuksek tema."
  },
  warm_local_business: {
    label: "Sicak Yerel Isletme",
    intent: "Mahalle esnafi ve samimi marka dili kullanan isletmeler icin sade ve guven veren kurgu."
  },
  corporate_clean: {
    label: "Kurumsal Sade",
    intent: "Daha duz, net ve guven veren B2B veya ofis tipi isletme hissi."
  },
  startup_motion: {
    label: "Hareketli Startup",
    intent: "Daha modern, neon, hareketli ve teknoloji odakli marka anlatisi."
  }
};

export const defaultGenerationPipeline: Array<{
  stage: GenerationStage;
  description: string;
}> = [
  {
    stage: "collect",
    description: "Yapilandirilmis form alanlariyla sektor, hizmet, CTA ve domain verisi toplanir."
  },
  {
    stage: "classify",
    description: "Standart urun mu yoksa ozel proje mi oldugu belirlenir."
  },
  {
    stage: "blueprint",
    description: "Tema ailesi, section listesi ve modullerle blueprint/spec uretilir."
  },
  {
    stage: "generate",
    description: "AI ajanlari ve tanimli tasarim sistemi ile kod uretimi yapilir."
  },
  {
    stage: "validate",
    description: "Preview, yapi ve hata kontrolleri calistirilir."
  },
  {
    stage: "publish",
    description: "Trial subdomain yayini acilir ve panel kaydina baglanir."
  }
];


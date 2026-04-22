"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { brand } from "@ustaca/config";

import { requireCustomerSession } from "@/lib/auth";
import { getCustomerIdForSession } from "@/lib/data";
import { panelMutationService } from "@/lib/mutations";

const siteInfoSchema = z.object({
  businessName: z.string().trim().min(2),
  heroSubtitle: z.string().trim().min(8),
  phone: z.string().trim().min(8),
  email: z.string().trim().email(),
  city: z.string().trim().min(2),
  address: z.string().trim().min(8)
});

const ctaSchema = z.object({
  heroTitle: z.string().trim().min(4),
  primaryCta: z.string().trim().min(2),
  secondaryCta: z.string().trim().min(2),
  themeAccent: z.enum(["violet-cyan", "gold-cyan", "violet-gold"])
});

const featuredServiceSchema = z.object({
  serviceId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  summary: z.string().trim().min(8),
  priceFrom: z.coerce.number().int().nonnegative(),
  durationMinutes: z.coerce.number().int().positive(),
  featured: z.enum(["yes", "no"]).transform((value) => value === "yes")
});

const primaryPlanSchema = z.object({
  planId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  tagline: z.string().trim().min(4),
  price: z.coerce.number().int().nonnegative(),
  features: z
    .string()
    .trim()
    .min(2)
    .transform((value) =>
      value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
});

const gallerySchema = z.object({
  assetId: z.string().trim().optional(),
  title: z.string().trim().min(2),
  category: z.string().trim().min(2),
  imageUrl: z.string().trim().url(),
  highlight: z.enum(["yes", "no"]).transform((value) => value === "yes"),
  intent: z.enum(["upsert", "create"]).default("upsert")
});

const siteAiSchema = z.object({
  enabled: z.enum(["enabled", "disabled"]).transform((value) => value === "enabled"),
  greeting: z.string().trim().min(4),
  primaryGoal: z.string().trim().min(4),
  escalationRoute: z.string().trim().min(3)
});

const supportTicketSchema = z.object({
  category: z.string().trim().min(2),
  priority: z.enum(["low", "medium", "high"]),
  subject: z.string().trim().min(4),
  customerMessage: z.string().trim().min(8)
});

const toFormPayload = (formData: FormData) =>
  Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value)]));

const readCustomerContext = async () => {
  const session = await requireCustomerSession();
  const customerId = await getCustomerIdForSession(session);

  if (!customerId) {
    throw new Error("customer_context_not_found");
  }

  return {
    customerId,
    actor: {
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email
    }
  };
};

const redirectWithFeedback = (
  path: string,
  feedback:
    | {
        saved: string;
      }
    | {
        error: string;
      }
): never => {
  const params = new URLSearchParams(feedback);
  redirect(`${path}?${params.toString()}`);
};

const commitPanelMutation = async (path: string, saved: string, callback: () => Promise<unknown>) => {
  try {
    await callback();
  } catch {
    redirectWithFeedback(path, { error: "save_failed" });
  }

  revalidatePath(path);
  revalidatePath("/");
  redirectWithFeedback(path, { saved });
};

export const saveSiteInfoAction = async (formData: FormData) => {
  const parsed = siteInfoSchema.safeParse(toFormPayload(formData));
  const data = parsed.success ? parsed.data : redirectWithFeedback("/site", { error: "site_info_invalid" });

  const context = await readCustomerContext();

  return commitPanelMutation("/site", "site_info_saved", () =>
    panelMutationService.updateSiteInfo({
      customerId: context.customerId,
      actor: context.actor,
      businessName: data.businessName,
      heroSubtitle: data.heroSubtitle,
      phone: data.phone,
      email: data.email,
      city: data.city,
      address: data.address
    })
  );
};

export const saveSiteCtaAction = async (formData: FormData) => {
  const parsed = ctaSchema.safeParse(toFormPayload(formData));
  const data = parsed.success ? parsed.data : redirectWithFeedback("/site", { error: "site_cta_invalid" });

  const context = await readCustomerContext();

  return commitPanelMutation("/site", "site_cta_saved", () =>
    panelMutationService.updateSiteCta({
      customerId: context.customerId,
      actor: context.actor,
      heroTitle: data.heroTitle,
      primaryCta: data.primaryCta,
      secondaryCta: data.secondaryCta,
      themeAccent: data.themeAccent
    })
  );
};

export const saveFeaturedServiceAction = async (formData: FormData) => {
  const parsed = featuredServiceSchema.safeParse(toFormPayload(formData));
  const data = parsed.success
    ? parsed.data
    : redirectWithFeedback("/services", { error: "service_invalid" });

  const context = await readCustomerContext();

  return commitPanelMutation("/services", "service_saved", () =>
    panelMutationService.updateFeaturedService({
      customerId: context.customerId,
      actor: context.actor,
      serviceId: data.serviceId,
      name: data.name,
      summary: data.summary,
      priceFrom: data.priceFrom,
      durationMinutes: data.durationMinutes,
      featured: data.featured
    })
  );
};

export const savePrimaryPlanAction = async (formData: FormData) => {
  const parsed = primaryPlanSchema.safeParse(toFormPayload(formData));
  const data = parsed.success ? parsed.data : redirectWithFeedback("/services", { error: "plan_invalid" });

  const context = await readCustomerContext();

  return commitPanelMutation("/services", "plan_saved", () =>
    panelMutationService.updatePrimaryPricingPlan({
      customerId: context.customerId,
      actor: context.actor,
      planId: data.planId,
      name: data.name,
      tagline: data.tagline,
      price: data.price,
      features: data.features
    })
  );
};

export const saveGalleryAssetAction = async (formData: FormData) => {
  const parsed = gallerySchema.safeParse(toFormPayload(formData));
  const data = parsed.success ? parsed.data : redirectWithFeedback("/gallery", { error: "gallery_invalid" });

  const context = await readCustomerContext();

  return commitPanelMutation("/gallery", "gallery_saved", () =>
    panelMutationService.upsertGalleryAsset({
      ...context,
      assetId: data.assetId || null,
      title: data.title,
      category: data.category,
      imageUrl: data.imageUrl,
      highlight: data.highlight,
      forceCreate: data.intent === "create"
    })
  );
};

export const saveSiteAiAction = async (formData: FormData) => {
  const parsed = siteAiSchema.safeParse(toFormPayload(formData));
  const data = parsed.success ? parsed.data : redirectWithFeedback("/site-ai", { error: "site_ai_invalid" });

  const context = await readCustomerContext();

  return commitPanelMutation("/site-ai", "site_ai_saved", () =>
    panelMutationService.updateSiteAssistant({
      customerId: context.customerId,
      actor: context.actor,
      enabled: data.enabled,
      greeting: data.greeting,
      primaryGoal: data.primaryGoal,
      escalationRoute: data.escalationRoute
    })
  );
};

export const createSupportTicketAction = async (formData: FormData) => {
  const payload = toFormPayload(formData);
  const parsed = supportTicketSchema.safeParse({
    category: payload.supportCategory,
    priority: payload.supportPriority,
    subject: payload.supportSubject,
    customerMessage: payload.supportMessage
  });
  const data = parsed.success ? parsed.data : redirectWithFeedback("/support", { error: "support_invalid" });

  const context = await readCustomerContext();

  return commitPanelMutation("/support", "support_saved", () =>
    panelMutationService.createSupportTicket({
      customerId: context.customerId,
      actor: context.actor,
      category: data.category,
      priority: data.priority,
      subject: data.subject,
      customerMessage: data.customerMessage,
      notificationRecipient: brand.supportEmail
    })
  );
};

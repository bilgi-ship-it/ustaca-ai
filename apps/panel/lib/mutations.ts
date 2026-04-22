import { randomUUID } from "node:crypto";

import {
  createAdminFilterKey,
  createEntityTimestamps,
  type AiAssistantEntity,
  type AuditLogEntity,
  type CustomerEntity,
  type SupportTicketEntity,
  type UserRole
} from "@ustaca/domain";
import {
  createEventProcessingService,
  type AiAssistantDocument,
  type CustomerRecordBundle,
  type SiteDocument
} from "@ustaca/db";

import { dataAccess, repositories } from "@/lib/data";

const eventProcessing = createEventProcessingService(repositories);

type MutationActor = {
  userId: string;
  role: UserRole;
  email: string;
};

type SiteInfoInput = {
  customerId: string;
  actor: MutationActor;
  businessName: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  city: string;
  address: string;
};

type SiteCtaInput = {
  customerId: string;
  actor: MutationActor;
  heroTitle: string;
  primaryCta: string;
  secondaryCta: string;
  themeAccent: string;
};

type FeaturedServiceInput = {
  customerId: string;
  actor: MutationActor;
  serviceId: string;
  name: string;
  summary: string;
  priceFrom: number;
  durationMinutes: number;
  featured: boolean;
};

type PrimaryPricingPlanInput = {
  customerId: string;
  actor: MutationActor;
  planId: string;
  name: string;
  tagline: string;
  price: number;
  features: string[];
};

type GalleryAssetInput = {
  customerId: string;
  actor: MutationActor;
  assetId?: string | null;
  title: string;
  category: string;
  imageUrl: string;
  highlight: boolean;
  forceCreate?: boolean;
};

type SiteAiInput = {
  customerId: string;
  actor: MutationActor;
  enabled: boolean;
  greeting: string;
  primaryGoal: string;
  escalationRoute: string;
};

type CreateSupportTicketInput = {
  customerId: string;
  actor: MutationActor;
  category: string;
  priority: SupportTicketEntity["priority"];
  subject: string;
  customerMessage: string;
  notificationRecipient: string;
};

const nowIso = () => new Date().toISOString();

const createId = (prefix: string) => `${prefix}_${randomUUID()}`;

const touchRecord = <T extends { updated_at: string; updatedAt: string }>(record: T, timestamp: string): T => ({
  ...record,
  updated_at: timestamp,
  updatedAt: timestamp
});

const requireEditableBundle = async (customerId: string): Promise<CustomerRecordBundle> => {
  const bundle = await dataAccess.getCustomerRecordBundle(customerId);

  if (!bundle) {
    throw new Error("customer_bundle_not_found");
  }

  return bundle;
};

const appendAuditLog = async (input: {
  actor: MutationActor;
  customerId: string;
  siteId: string | null;
  action: string;
  targetCollection: string;
  targetId: string;
  summary: string;
  metadata: Record<string, unknown>;
}) => {
  const timestamp = nowIso();
  const auditLog: AuditLogEntity = {
    id: createId("audit"),
    status: "recorded",
    customer_id: input.customerId,
    customerId: input.customerId,
    site_id: input.siteId,
    siteId: input.siteId,
    actor_user_id: input.actor.userId,
    actorUserId: input.actor.userId,
    actorRole: input.actor.role,
    action: input.action,
    action_key: createAdminFilterKey(input.action) ?? input.action,
    targetCollection: input.targetCollection,
    targetId: input.targetId,
    summary: input.summary,
    metadata: input.metadata,
    ...createEntityTimestamps(timestamp)
  };

  await repositories.auditLogs.append(auditLog);
};

const updateCustomerDocument = (
  customer: CustomerEntity,
  timestamp: string,
  patch: Partial<CustomerEntity>
): CustomerEntity => ({
  ...touchRecord(customer, timestamp),
  ...patch
});

const updateSiteDocument = (
  site: SiteDocument,
  timestamp: string,
  patch: Partial<SiteDocument>
): SiteDocument => ({
  ...touchRecord(site, timestamp),
  ...patch
});

const updateAssistantDocument = (
  assistant: AiAssistantDocument,
  timestamp: string,
  patch: Partial<AiAssistantDocument>
): AiAssistantDocument => ({
  ...touchRecord(assistant, timestamp),
  ...patch
});

const ensureSiteModule = (site: SiteDocument, enabled: boolean): SiteDocument["enabledModules"] => {
  const hasModule = site.enabledModules.some((module) => module.code === "site_ai_assistant");

  if (hasModule) {
    return site.enabledModules.map((module) =>
      module.code === "site_ai_assistant" ? { ...module, enabled } : module
    );
  }

  return [
    ...site.enabledModules,
    {
      code: "site_ai_assistant" as const,
      label: "Site AI Asistani",
      tier: "addon" as const,
      enabled
    }
  ];
};

export const panelMutationService = {
  async updateSiteInfo(input: SiteInfoInput) {
    const bundle = await requireEditableBundle(input.customerId);
    const timestamp = nowIso();

    const nextCustomer = updateCustomerDocument(bundle.customer, timestamp, {
      businessName: input.businessName,
      contact: {
        ...bundle.customer.contact,
        phone: input.phone,
        email: input.email,
        city: input.city,
        address: input.address
      },
      business_name_key: createAdminFilterKey(input.businessName) ?? bundle.customer.business_name_key,
      owner_email_key: createAdminFilterKey(input.email) ?? bundle.customer.owner_email_key,
      city_key: createAdminFilterKey(input.city) ?? bundle.customer.city_key
    });

    const nextSite = updateSiteDocument(bundle.site, timestamp, {
      content: {
        ...bundle.site.content,
        heroSubtitle: input.heroSubtitle
      }
    });

    await Promise.all([
      repositories.customers.upsert(nextCustomer),
      repositories.sites.upsert(nextSite),
      appendAuditLog({
        actor: input.actor,
        customerId: input.customerId,
        siteId: bundle.site.id,
        action: "customer_site_info_updated",
        targetCollection: "sites",
        targetId: bundle.site.id,
        summary: "Musteri panelinden temel site ve iletisim bilgileri guncellendi.",
        metadata: {
          businessName: input.businessName,
          phone: input.phone,
          email: input.email,
          city: input.city
        }
      })
    ]);
  },

  async updateSiteCta(input: SiteCtaInput) {
    const bundle = await requireEditableBundle(input.customerId);
    const timestamp = nowIso();

    const nextSite = updateSiteDocument(bundle.site, timestamp, {
      content: {
        ...bundle.site.content,
        heroTitle: input.heroTitle,
        primaryCta: input.primaryCta,
        secondaryCta: input.secondaryCta,
        themeAccent: input.themeAccent
      }
    });

    await Promise.all([
      repositories.sites.upsert(nextSite),
      appendAuditLog({
        actor: input.actor,
        customerId: input.customerId,
        siteId: bundle.site.id,
        action: "customer_site_cta_updated",
        targetCollection: "sites",
        targetId: bundle.site.id,
        summary: "Musteri panelinden hero ve CTA alanlari guncellendi.",
        metadata: {
          heroTitle: input.heroTitle,
          primaryCta: input.primaryCta,
          secondaryCta: input.secondaryCta,
          themeAccent: input.themeAccent
        }
      })
    ]);
  },

  async updateFeaturedService(input: FeaturedServiceInput) {
    const bundle = await requireEditableBundle(input.customerId);
    const timestamp = nowIso();

    const nextServices = bundle.site.services.map((service) => {
      if (service.id === input.serviceId) {
        return {
          ...service,
          name: input.name,
          summary: input.summary,
          priceFrom: input.priceFrom,
          durationMinutes: input.durationMinutes,
          featured: input.featured
        };
      }

      return input.featured ? { ...service, featured: false } : service;
    });

    const nextSite = updateSiteDocument(bundle.site, timestamp, {
      services: nextServices
    });

    await Promise.all([
      repositories.sites.upsert(nextSite),
      appendAuditLog({
        actor: input.actor,
        customerId: input.customerId,
        siteId: bundle.site.id,
        action: "customer_featured_service_updated",
        targetCollection: "sites",
        targetId: bundle.site.id,
        summary: "Musteri panelinden one cikan hizmet bilgisi guncellendi.",
        metadata: {
          serviceId: input.serviceId,
          featured: input.featured
        }
      })
    ]);
  },

  async updatePrimaryPricingPlan(input: PrimaryPricingPlanInput) {
    const bundle = await requireEditableBundle(input.customerId);
    const timestamp = nowIso();

    const nextPricingPlans = bundle.site.pricingPlans.map((plan) =>
      plan.id === input.planId
        ? {
            ...plan,
            name: input.name,
            tagline: input.tagline,
            price: input.price,
            features: input.features
          }
        : plan
    );

    const nextSite = updateSiteDocument(bundle.site, timestamp, {
      pricingPlans: nextPricingPlans
    });

    await Promise.all([
      repositories.sites.upsert(nextSite),
      appendAuditLog({
        actor: input.actor,
        customerId: input.customerId,
        siteId: bundle.site.id,
        action: "customer_pricing_plan_updated",
        targetCollection: "sites",
        targetId: bundle.site.id,
        summary: "Musteri panelinden ana fiyat plani guncellendi.",
        metadata: {
          planId: input.planId,
          price: input.price
        }
      })
    ]);
  },

  async upsertGalleryAsset(input: GalleryAssetInput) {
    const bundle = await requireEditableBundle(input.customerId);
    const timestamp = nowIso();
    const assetId = input.forceCreate ? createId("gallery") : input.assetId || createId("gallery");
    const existingAsset = bundle.site.gallery.find((asset) => asset.id === assetId);

    const nextAsset = {
      id: assetId,
      title: input.title,
      category: input.category,
      imageUrl: input.imageUrl,
      publishedAt: existingAsset?.publishedAt ?? timestamp,
      highlight: input.highlight
    };

    const galleryWithoutAsset = bundle.site.gallery.filter((asset) => asset.id !== assetId);
    const galleryBase = input.highlight
      ? galleryWithoutAsset.map((asset) => ({ ...asset, highlight: false }))
      : galleryWithoutAsset;

    const nextSite = updateSiteDocument(bundle.site, timestamp, {
      gallery: [...galleryBase, nextAsset]
    });

    await Promise.all([
      repositories.sites.upsert(nextSite),
      appendAuditLog({
        actor: input.actor,
        customerId: input.customerId,
        siteId: bundle.site.id,
        action: existingAsset ? "customer_gallery_asset_updated" : "customer_gallery_asset_created",
        targetCollection: "sites",
        targetId: bundle.site.id,
        summary: existingAsset
          ? "Musteri panelinden bir galeri gorseli guncellendi."
          : "Musteri panelinden yeni bir galeri gorseli eklendi.",
        metadata: {
          assetId,
          highlight: input.highlight,
          created: !existingAsset
        }
      })
    ]);
  },

  async updateSiteAssistant(input: SiteAiInput) {
    const bundle = await requireEditableBundle(input.customerId);
    const timestamp = nowIso();
    const existingAssistant = bundle.aiAssistants.find((assistant) => assistant.channel === "site");

    const assistantRecord: AiAssistantEntity = existingAssistant
      ? updateAssistantDocument(existingAssistant, timestamp, {
          status: input.enabled,
          enabled: input.enabled,
          greeting: input.greeting,
          primaryGoal: input.primaryGoal,
          escalationRoute: input.escalationRoute
        })
      : {
          id: createId("assistant"),
          status: input.enabled,
          customer_id: input.customerId,
          customerId: input.customerId,
          site_id: bundle.site.id,
          siteId: bundle.site.id,
          channel: "site",
          enabled: input.enabled,
          greeting: input.greeting,
          primaryGoal: input.primaryGoal,
          escalationRoute: input.escalationRoute,
          maxCatalogItems: 20,
          knowledgeScope: ["services", "forms", "appointments"],
          ...createEntityTimestamps(timestamp)
        };

    const nextSite = updateSiteDocument(bundle.site, timestamp, {
      enabledModules: ensureSiteModule(bundle.site, input.enabled)
    });

    await Promise.all([
      repositories.aiAssistants.upsert(assistantRecord),
      repositories.sites.upsert(nextSite),
      appendAuditLog({
        actor: input.actor,
        customerId: input.customerId,
        siteId: bundle.site.id,
        action: "customer_site_ai_updated",
        targetCollection: "ai_assistants",
        targetId: assistantRecord.id,
        summary: "Musteri panelinden Site AI ayarlari guncellendi.",
        metadata: {
          enabled: input.enabled,
          channel: "site"
        }
      })
    ]);
  },

  async createSupportTicket(input: CreateSupportTicketInput) {
    const bundle = await requireEditableBundle(input.customerId);
    const timestamp = nowIso();
    const ticketId = createId("support");

    const ticket: SupportTicketEntity = {
      id: ticketId,
      status: "open",
      customer_id: input.customerId,
      customerId: input.customerId,
      site_id: bundle.site.id,
      siteId: bundle.site.id,
      support_status: "open",
      category_key: createAdminFilterKey(input.category) ?? input.category,
      subject_key: createAdminFilterKey(input.subject) ?? input.subject,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      channel: "chat",
      customerMessage: input.customerMessage,
      opsNote: "",
      resolvedAt: null,
      lastResponseAt: null,
      ...createEntityTimestamps(timestamp)
    };

    await repositories.supportTickets.upsert(ticket);

    await Promise.all([
      eventProcessing.processSupportCreated({
        ticketId,
        recipient: input.notificationRecipient,
        actorUserId: input.actor.userId,
        occurredAt: timestamp
      }),
      appendAuditLog({
        actor: input.actor,
        customerId: input.customerId,
        siteId: bundle.site.id,
        action: "support.created",
        targetCollection: "support_tickets",
        targetId: ticketId,
        summary: "Musteri panelinden yeni bir destek kaydi olusturuldu.",
        metadata: {
          category: input.category,
          priority: input.priority
        }
      })
    ]);

    return {
      ticketId
    };
  }
};

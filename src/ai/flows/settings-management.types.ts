/**
 * @fileOverview Types and Zod schemas for application settings management.
 */
import { z } from 'zod';

export const ManualAdSlotSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
});
export type ManualAdSlot = z.infer<typeof ManualAdSlotSchema>;

export const AdvertisementSettingsSchema = z.object({
  adType: z.enum(['none', 'auto', 'manual']).default('none'),
  autoAdsScript: z.string().optional(),
  showAdsForPro: z.boolean().default(false),
  manualAdSlots: z.array(ManualAdSlotSchema).optional(),
});
export type AdvertisementSettings = z.infer<typeof AdvertisementSettingsSchema>;


export const ReferralSettingsSchema = z.object({
  isReferralEnabled: z.boolean().default(true),
  commissionRate: z.number().min(0).max(100).default(20),
  cookieDuration: z.number().min(1).default(30),
  payoutThreshold: z.number().min(0).default(50),
  isMultiLevel: z.boolean().default(false),
});
export type ReferralSettings = z.infer<typeof ReferralSettingsSchema>;

export const SocialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
});
export type SocialLinks = z.infer<typeof SocialLinksSchema>;

export const WebmasterSettingsSchema = z.object({
    googleSearchConsole: z.string().optional(),
    googleAnalytics: z.string().optional(),
    googleAdsense: z.string().optional(),
    yandexWebmaster: z.string().optional(),
    bingWebmaster: z.string().optional(),
    pinterest: z.string().optional(),
    baidu: z.string().optional(),
    yahooSearchConsole: z.string().optional(),
});
export type WebmasterSettings = z.infer<typeof WebmasterSettingsSchema>;

export const GeneralSettingsSchema = z.object({
  siteTitle: z.string().default('ToolifyAI'),
  slogan: z.string().default('Your All-in-One Smart Toolkit'),
  siteDescription: z.string().default('Over 100 smart utility tools and AI-powered solutions.'),
  metaKeywords: z.string().default('ai tools, utility, productivity, developer tools'),
  copyrightText: z.string().default('© {year} ToolifyAI. All rights reserved.'),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  contactEmail: z.string().email().optional(),
  socialLinks: SocialLinksSchema.optional(),
  webmaster: WebmasterSettingsSchema.optional(),
});
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;


export const AppSettingsSchema = z.object({
  advertisement: AdvertisementSettingsSchema.optional(),
  referral: ReferralSettingsSchema.optional(),
  general: GeneralSettingsSchema.optional(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

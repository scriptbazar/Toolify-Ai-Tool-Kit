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


export const AppSettingsSchema = z.object({
  advertisement: AdvertisementSettingsSchema.optional(),
  referral: ReferralSettingsSchema.optional(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

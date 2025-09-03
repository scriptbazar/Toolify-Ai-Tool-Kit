

/**
 * @fileOverview Types and Zod schemas for application settings management.
 */
import { z } from 'zod';
import { type ReferralRequestSchema, type ReferralStatusSchema } from './user-management.types';
import * as Icons from 'lucide-react';

const iconNames = Object.keys(Icons) as [string, ...string[]];
const IconEnum = z.enum(iconNames);


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
  cookieDuration: z.number().min(0).default(30),
  payoutThreshold: z.number().min(0).default(50),
  isMultiLevel: z.boolean().default(false),
  referralProgramDescription: z.string().optional(),
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

export const ApiKeysSchema = z.object({
    gemini: z.string().optional(),
});
export type ApiKeys = z.infer<typeof ApiKeysSchema>;

export const TwoFactorAuthMethodsSchema = z.object({
    email: z.boolean().default(true),
    authenticatorApp: z.boolean().default(false),
    mobileNumber: z.boolean().default(false),
});
export type TwoFactorAuthMethods = z.infer<typeof TwoFactorAuthMethodsSchema>;


export const SecuritySettingsSchema = z.object({
    enableTwoFactorAuth: z.boolean().default(false),
    twoFactorAuthMethods: TwoFactorAuthMethodsSchema.optional(),
    enableRecaptcha: z.boolean().default(false),
    recaptchaSiteKey: z.string().optional(),
    recaptchaSecretKey: z.string().optional(),
    maintenanceMode: z.boolean().default(false),
    maintenanceModeMessage: z.string().optional(),
    maintenanceModeUntil: z.date().optional(),
    enableNewLoginAlerts: z.boolean().default(true),
    enableAdBlockerDetection: z.boolean().default(false),
});
export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>;


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
  apiKeys: ApiKeysSchema.optional(),
  security: SecuritySettingsSchema.optional(),
});
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;

export const PlanFeatureSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type PlanFeature = z.infer<typeof PlanFeatureSchema>;

export const PlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Plan name is required.'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a positive number.'),
  priceSuffix: z.string().default('/ month'),
  features: z.array(PlanFeatureSchema).default([]),
  isPopular: z.boolean().default(false),
  status: z.enum(['active', 'disabled']).default('active'),
});
export type Plan = z.infer<typeof PlanSchema>;

export const PlanSettingsSchema = z.object({
  plans: z.array(PlanSchema).default([]),
});
export type PlanSettings = z.infer<typeof PlanSettingsSchema>;

export const StripeSettingsSchema = z.object({
  isEnabled: z.boolean().default(false),
  name: z.string().default('Stripe'),
  publishableKey: z.string().optional(),
  secretKey: z.string().optional(),
});
export type StripeSettings = z.infer<typeof StripeSettingsSchema>;

export const PaypalSettingsSchema = z.object({
  isEnabled: z.boolean().default(false),
  name: z.string().default('PayPal'),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  mode: z.enum(['sandbox', 'live']).default('sandbox'),
});
export type PaypalSettings = z.infer<typeof PaypalSettingsSchema>;

export const RazorpaySettingsSchema = z.object({
  isEnabled: z.boolean().default(false),
  name: z.string().default('Razorpay'),
  keyId: z.string().optional(),
  keySecret: z.string().optional(),
});
export type RazorpaySettings = z.infer<typeof RazorpaySettingsSchema>;

export const PayUSettingsSchema = z.object({
  isEnabled: z.boolean().default(false),
  name: z.string().default('PayU'),
  merchantKey: z.string().optional(),
  merchantSalt: z.string().optional(),
  mode: z.enum(['test', 'live']).default('test'),
});
export type PayUSettings = z.infer<typeof PayUSettingsSchema>;

export const CashfreeSettingsSchema = z.object({
  isEnabled: z.boolean().default(false),
  name: z.string().default('Cashfree'),
  appId: z.string().optional(),
  secretKey: z.string().optional(),
  mode: z.enum(['sandbox', 'production']).default('sandbox'),
});
export type CashfreeSettings = z.infer<typeof CashfreeSettingsSchema>;

export const PhonePeSettingsSchema = z.object({
  isEnabled: z.boolean().default(false),
  name: z.string().default('PhonePe'),
  merchantId: z.string().optional(),
  merchantUserId: z.string().optional(),
  saltKey: z.string().optional(),
  saltIndex: z.string().optional(),
  mode: z.enum(['uat', 'production']).default('uat'),
});
export type PhonePeSettings = z.infer<typeof PhonePeSettingsSchema>;

export const PaymentSettingsSchema = z.object({
  stripe: StripeSettingsSchema.optional(),
  paypal: PaypalSettingsSchema.optional(),
  razorpay: RazorpaySettingsSchema.optional(),
  payu: PayUSettingsSchema.optional(),
  cashfree: CashfreeSettingsSchema.optional(),
  phonepe: PhonePeSettingsSchema.optional(),
});
export type PaymentSettings = z.infer<typeof PaymentSettingsSchema>;

export const CustomPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  icon: z.string().optional(),
  content: z.string().optional(),
});
export type CustomPage = z.infer<typeof CustomPageSchema>;

export const PageSettingsSchema = z.object({
  pages: z.array(CustomPageSchema).default([]),
});
export type PageSettings = z.infer<typeof PageSettingsSchema>;

const FooterLinkSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Link name is required."),
  href: z.string().min(1, "Link URL is required."),
});
export type FooterLink = z.infer<typeof FooterLinkSchema>;

export const FooterSettingsSchema = z.object({
  showLogo: z.boolean().default(true),
  description: z.string().optional(),
  topToolsTitle: z.string().optional(),
  quickLinksTitle: z.string().optional(),
  hostingLinksTitle: z.string().optional(),
  moreToolsTitle: z.string().optional(),
  topTools: z.array(FooterLinkSchema).optional(),
  quickLinks: z.array(FooterLinkSchema).optional(),
  hostingLinks: z.array(FooterLinkSchema).optional(),
  moreTools: z.array(FooterLinkSchema).optional(),
});
export type FooterSettings = z.infer<typeof FooterSettingsSchema>;

const HomepageFeatureSchema = z.object({
  id: z.string(),
  icon: IconEnum,
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

const HomepageStepSchema = z.object({
  id: z.string(),
  icon: IconEnum,
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

export const HomepageSettingsSchema = z.object({
  features: z.array(HomepageFeatureSchema).optional(),
  steps: z.array(HomepageStepSchema).optional(),
});
export type HomepageSettings = z.infer<typeof HomepageSettingsSchema>;


export const FaqItemSchema = z.object({
  id: z.string(),
  icon: IconEnum,
  question: z.string().min(1, "Question is required."),
  answer: z.string().min(1, "Answer is required."),
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

export const FaqSettingsSchema = z.object({
  contactFaqs: z.array(FaqItemSchema).optional(),
  pricingFaqs: z.array(FaqItemSchema).optional(),
  affiliateFaqs: z.array(FaqItemSchema).optional(),
});
export type FaqSettings = z.infer<typeof FaqSettingsSchema>;

export const ToolSidebarSettingsSchema = z.object({
    showPopularTools: z.boolean().default(true),
    showRecentPosts: z.boolean().default(true),
});
export type ToolSidebarSettings = z.infer<typeof ToolSidebarSettingsSchema>;

export const BlogSidebarSettingsSchema = z.object({
    showPopularTools: z.boolean().default(true),
    showRecentPosts: z.boolean().default(true),
    showCategories: z.boolean().default(true),
});
export type BlogSidebarSettings = z.infer<typeof BlogSidebarSettingsSchema>;

export const SidebarSettingsSchema = z.object({
    toolSidebar: ToolSidebarSettingsSchema.optional(),
    blogSidebar: BlogSidebarSettingsSchema.optional(),
});
export type SidebarSettings = z.infer<typeof SidebarSettingsSchema>;


export const AppSettingsSchema = z.object({
  advertisement: AdvertisementSettingsSchema.optional(),
  referral: ReferralSettingsSchema.optional(),
  general: GeneralSettingsSchema.optional(),
  plan: PlanSettingsSchema.optional(),
  payment: PaymentSettingsSchema.optional(),
  page: PageSettingsSchema.optional(),
  footer: FooterSettingsSchema.optional(),
  homepage: HomepageSettingsSchema.optional(),
  faqs: FaqSettingsSchema.optional(),
  sidebar: SidebarSettingsSchema.optional(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type ReferralRequest = z.infer<typeof ReferralRequestSchema>;
export type ReferralStatus = z.infer<typeof ReferralStatusSchema>;

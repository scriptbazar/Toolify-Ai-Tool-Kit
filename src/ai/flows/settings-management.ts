
'use server';

/**
 * @fileOverview Manages application settings in Firestore.
 *
 * - getSettings - Retrieves the entire settings document.
 * - updateSettings - Updates the settings document with new values.
 */

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { AppSettingsSchema, type AppSettings } from './settings-management.types';
import fs from 'fs/promises';
import path from 'path';
import { merge } from 'lodash';

const SETTINGS_COLLECTION = 'settings';
const MAIN_SETTINGS_DOC_ID = 'main';


const defaultPages = [
    {
      id: 'about-us',
      slug: 'about-us',
      title: 'About Us',
      content: `
        <div class="space-y-6">
          <p class="text-lg">Welcome to ToolifyAI, your all-in-one destination for a smarter, more efficient digital life. Our mission is to provide a comprehensive suite of powerful, easy-to-use online utilities that simplify complex tasks and boost productivity for everyone—from students and content creators to developers and business professionals.</p>
          
          <h2 class="text-2xl font-bold border-b pb-2">Our Mission</h2>
          <p>In a world overflowing with information and digital noise, we believe in the power of simplicity and efficiency. ToolifyAI was born from a desire to eliminate the need for multiple, single-purpose websites and applications. We wanted to create a single, reliable hub where you can find all the tools you need, right when you need them. Our goal is to empower you to work smarter, not harder, by providing intuitive tools that deliver accurate results instantly.</p>

          <h2 class="text-2xl font-bold border-b pb-2">Meet The Team</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4">
              <div class="text-center">
                  <img src="https://i.pravatar.cc/150?u=jane" alt="Jane Doe" class="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg" />
                  <h3 class="text-xl font-semibold">Jane Doe</h3>
                  <p class="text-muted-foreground">Founder & CEO</p>
              </div>
              <div class="text-center">
                  <img src="https://i.pravatar.cc/150?u=john" alt="John Smith" class="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg" />
                  <h3 class="text-xl font-semibold">John Smith</h3>
                  <p class="text-muted-foreground">Lead Developer</p>
              </div>
              <div class="text-center">
                  <img src="https://i.pravatar.cc/150?u=emily" alt="Emily White" class="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg" />
                  <h3 class="text-xl font-semibold">Emily White</h3>
                  <p class="text-muted-foreground">UX/UI Designer</p>
              </div>
          </div>
        </div>
      `,
    },
    {
      id: 'contact-us',
      slug: 'contact-us',
      title: 'Contact Us',
      content: '<p>Contact form coming soon. For now, please reach out to us at contact@toolifyai.com.</p>',
    },
    {
      id: 'privacy-policy',
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: '<p>Your privacy is important to us. Our full privacy policy will be detailed here soon.</p>',
    },
    {
      id: 'terms-conditions',
      slug: 'terms-conditions',
      title: 'Terms & Conditions',
      content: '<p>Please read our terms and conditions carefully. Full details will be provided here shortly.</p>',
    },
    {
      id: 'dmca',
      slug: 'dmca',
      title: 'DMCA',
      content: '<p>We respect intellectual property rights. Our DMCA policy and takedown request form will be available here.</p>',
    },
  ];

const defaultPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individuals and hobbyists starting out.',
    price: 0,
    priceSuffix: '/ month',
    features: [
      { id: 'f1', text: 'Access to basic tools' },
      { id: 'f2', text: '5 AI generations per day' },
      { id: 'f3', text: 'Community support' },
      { id: 'f4', text: 'Ad-supported experience' },
    ],
    isPopular: false,
    status: 'active' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and power users who need more.',
    price: 19,
    priceSuffix: '/ month',
    features: [
      { id: 'p1', text: 'Access to all tools' },
      { id: 'p2', text: 'Unlimited AI generations' },
      { id: 'p3', text: 'Priority email support' },
      { id: 'p4', text: 'Advanced analytics' },
    ],
    isPopular: true,
    status: 'active' as const,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For collaborative teams and businesses.',
    price: 49,
    priceSuffix: '/ month',
    features: [
      { id: 't1', text: 'All Pro features' },
      { id: 't2', text: 'Team management' },
      { id: 't3', text: 'Shared workspaces' },
      { id: 't4', text: 'Dedicated support' },
    ],
    isPopular: false,
    status: 'active' as const,
  },
];

const defaultFooterSettings = {
    showLogo: true,
    description: "ToolifyAI is your go-to hub for powerful, easy-to-use online utilities that simplify everyday tasks. Whether you need converters, analyzers, or creative tools, ToolifyAI connects you to everything in one place.",
    topTools: [
        { id: 'tt1', name: 'Case Converter', href: '/tools/case-converter' },
        { id: 'tt2', name: 'Word Counter', href: '/tools/word-counter' },
        { id: 'tt3', name: 'Lorem Ipsum Generator', href: '/tools/lorem-ipsum-generator' },
        { id: 'tt4', name: 'Password Generator', href: '/tools/password-generator' },
        { id: 'tt5', name: 'JSON Formatter', href: '/tools/json-formatter' },
    ],
    quickLinks: [
        { id: 'ql1', name: 'About Us', href: '/about-us' },
        { id: 'ql2', name: 'Contact Us', href: '/contact-us' },
        { id: 'ql3', name: 'Privacy Policy', href: '/privacy-policy' },
        { id: 'ql4', name: 'Terms & Conditions', href: '/terms-conditions' },
        { id: 'ql5', name: 'DMCA', href: '/dmca' },
    ],
    moreTools: [
        { id: 'mt1', name: 'BMI Calculator', href: '/tools/bmi-calculator' },
        { id: 'mt2', name: 'Text to Speech', href: '/tools/text-to-speech' },
        { id: 'mt3', name: 'PDF Merger', href: '/tools/pdf-merger' },
    ],
    hostingLinks: [
        { id: 'hl1', name: 'Hostinger', href: '#' },
        { id: 'hl2', name: 'Hostarmada', href: '#' },
        { id: 'hl3', name: 'YouStable', href: '#' },
        { id: 'hl4', name: 'Sitecountry', href: '#' },
        { id: 'hl5', name: 'Hostwinds', href: '#' },
    ],
};

const defaultHomepageSettings = {
  steps: [
    {
      id: 'step1',
      icon: 'MousePointerClick' as const,
      title: 'Choose a Tool',
      description: 'Browse our extensive collection and select the tool that fits your needs.',
    },
    {
      id: 'step2',
      icon: 'Database' as const,
      title: 'Input Your Data',
      description: 'Upload your file, paste your text, or enter the required information.',
    },
    {
      id: 'step3',
      icon: 'Wand2' as const,
      title: 'Get Results',
      description: 'Our tool will process your request instantly, providing you with the output you need.',
    },
    {
      id: 'step4',
      icon: 'Download' as const,
      title: 'Download & Share',
      description: 'Easily download your results or share them with others in just a click.',
    },
  ],
  features: [
    {
      id: 'feat1',
      icon: 'LifeBuoy' as const,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you with any questions or issues.',
    },
    {
      id: 'feat2',
      icon: 'Wand2' as const,
      title: 'Wide Range of Tools',
      description: 'From content creation to technical utilities, find everything you need in one convenient platform.',
    },
    {
      id: 'feat3',
      icon: 'MessageSquare' as const,
      title: 'Live Chat',
      description: 'Get instant help and support from our team through live chat.',
    },
    {
      id: 'feat4',
      icon: 'Users' as const,
      title: 'Community',
      description: 'Join our community to share ideas, get feedback, and connect with other users.',
    },
  ],
};


const defaultSettings = AppSettingsSchema.parse({ 
  page: { pages: defaultPages },
  plan: { plans: defaultPlans },
  footer: defaultFooterSettings,
  homepage: defaultHomepageSettings,
  referral: {
    isReferralEnabled: true,
    commissionRate: 20,
    cookieDuration: 30,
    payoutThreshold: 50,
    isMultiLevel: false,
    referralProgramDescription: 'Earn a commission for every new paying customer you refer. Payments are made monthly via PayPal.',
  }
});

/**
 * Retrieves the application settings from Firestore.
 * If no settings exist, it returns the default values defined in the schema.
 * @returns {Promise<AppSettings>} The application settings.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Validate data against schema, falling back to defaults if fields are missing
      const parsedData = AppSettingsSchema.safeParse(docSnap.data());
      if (parsedData.success) {
        return parsedData.data;
      } else {
        // This case handles situations where the data in Firestore is malformed.
        // It returns default settings to prevent the app from crashing.
        console.warn("Firestore settings data is invalid, returning defaults.", parsedData.error);
        return defaultSettings; 
      }
    } else {
      // If the document doesn't exist, return the default settings.
      return defaultSettings;
    }
  } catch (error: any) {
    console.error("Error getting settings:", error.message);
    // On error, return default settings to ensure app stability.
    return defaultSettings;
  }
}

/**
 * Updates the application settings in Firestore and writes API keys to .env.local.
 * It performs a deep merge to only update the provided fields.
 * @param {AppSettings} newSettings - The new settings values to save.
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation.
 */
export async function updateSettings(newSettings: Partial<AppSettings>): Promise<{ success: boolean; message: string }> {
  try {
    const currentSettings = await getSettings();
    
    // Use lodash's merge for a safe, deep merge. This correctly handles nested objects.
    const mergedSettings = merge({}, currentSettings, newSettings);

    // BUG FIX: If the referral program is being disabled, ensure related numeric values
    // are reset to their default (0) to prevent Zod validation errors on subsequent saves.
    if (newSettings.referral && newSettings.referral.isReferralEnabled === false) {
      mergedSettings.referral.commissionRate = 0;
      mergedSettings.referral.cookieDuration = 0;
      mergedSettings.referral.payoutThreshold = 0;
    }
    
    // Validate the merged object before saving to ensure data integrity
    const validationResult = AppSettingsSchema.safeParse(mergedSettings);
    if (!validationResult.success) {
      throw new z.ZodError(validationResult.error.issues);
    }

    // Save the fully merged and validated object to Firestore
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
    await docRef.set(validationResult.data, { merge: true }); // Use the validated data
    
    // Handle environment variable updates separately
    const geminiApiKey = mergedSettings.general?.apiKeys?.gemini;
    if (geminiApiKey && geminiApiKey.trim() !== '') {
      const envLocalPath = path.resolve(process.cwd(), '.env.local');
      let envContent = '';
      try {
        envContent = await fs.readFile(envLocalPath, 'utf-8');
      } catch (e: any) {
        if (e.code !== 'ENOENT') throw e;
      }

      const key = 'GEMINI_API_KEY';
      const value = geminiApiKey;

      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
      
      await fs.writeFile(envLocalPath, envContent.trim());
    }

    return { success: true, message: 'Settings updated successfully.' };
  } catch (error: any) {
    console.error("Error updating settings:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: error.message || 'An unknown error occurred while updating settings.' };
  }
}

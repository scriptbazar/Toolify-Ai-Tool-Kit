

'use server';

/**
 * @fileOverview Manages application settings in Firestore.
 *
 * - getSettings - Retrieves the entire settings document.
 * - updateSettings - Updates the settings document with new values.
 */

import { z } from 'zod';
import { getAdminDb, getSettingsData } from '@/lib/firebase-admin';
import { AppSettingsSchema, type AppSettings } from './settings-management.types';
import { cache } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { placeholderImages } from '@/lib/placeholder-images';


const SETTINGS_COLLECTION = 'settings';
const MAIN_SETTINGS_DOC_ID = 'main';

const defaultFaqSettings = {
    contactFaqs: [],
    pricingFaqs: [],
    affiliateFaqs: [],
    requestToolFaqs: [
      {
        id: 'faq_req_1',
        icon: 'Send' as const,
        question: 'How do I request a new tool?',
        answer: 'It\'s simple! Just fill out the form with your name, email, the name of the tool you\'d like, and a brief description of what it should do. You can even use our AI to help generate the description. Once you\'re done, click "Submit Request".'
      },
      {
        id: 'faq_req_2',
        icon: 'Workflow' as const,
        question: 'What happens after I submit a request?',
        answer: 'Our team reviews every request to assess its feasibility, usefulness, and potential impact. If your idea is selected, it will be added to our development pipeline. We prioritize tools that are in high demand and align with our platform\'s goals.'
      },
      {
        id: 'faq_req_3',
        icon: 'Clock' as const,
        question: 'How long does it take for a requested tool to be developed?',
        answer: 'The development time varies based on the tool\'s complexity. A simple tool might take a few weeks, while a more complex one could take several months. We focus on quality and can\'t always provide a fixed timeline.'
      },
      {
        id: 'faq_req_4',
        icon: 'CircleDollarSign' as const,
        question: 'Is there a fee for requesting or using a new tool?',
        answer: 'Requesting a tool is completely free! We value our community\'s input. Once a tool is developed, it will be available on our platform under either a Free or Pro plan, depending on its features.'
      },
      {
        id: 'faq_req_5',
        icon: 'Mail' as const,
        question: 'Will I be notified about the status of my request?',
        answer: 'Yes! If your tool request is chosen for development, we will notify you via the email you provided. You\'ll also receive an update when the tool goes live on our platform.'
      },
      {
        id: 'faq_req_6',
        icon: 'Lightbulb' as const,
        question: 'What kind of tools can I request?',
        answer: 'You can request any kind of online utility that you believe would be a valuable addition. Whether it\'s for text manipulation, image editing, development, or an AI-powered feature, we\'re open to all innovative ideas.'
      },
      {
        id: 'faq_req_7',
        icon: 'Sparkles' as const,
        question: 'Do I get any credit if my tool idea is selected?',
        answer: 'We love to recognize our community contributors! With your permission, we often feature a "Suggested by" credit on the tool\'s page. We may also offer you a special discount on our Pro plan as a thank you.'
      },
      {
        id: 'faq_req_8',
        icon: 'PlusCircle' as const,
        question: 'Can I submit more than one tool request?',
        answer: 'Absolutely! Feel free to submit as many ideas as you have. Please use a separate form for each request so we can track each idea effectively.'
      },
      {
        id: 'faq_req_9',
        icon: 'MessageSquare' as const,
        question: 'How is this different from creating a support ticket?',
        answer: 'Requesting a tool is for new ideas and features that don\'t exist yet. A support ticket is for reporting issues with existing tools or for help with your account.'
      },
      {
        id: 'faq_req_10',
        icon: 'Users' as const,
        question: 'What if someone else has already requested the same tool?',
        answer: 'That often happens, and it helps us know that the tool is in high demand! We track all requests. If the tool is built, we do our best to notify everyone who initially suggested it.'
      }
    ],
};


const defaultSettings = AppSettingsSchema.parse({ 
  page: { pages: [
    {
      id: 'about-us',
      slug: 'about-us',
      title: 'About Us',
      icon: 'Users',
      content: ``,
    },
    {
      id: 'contact-us',
      slug: 'contact-us',
      title: 'Contact Us',
      icon: 'Mail',
      content: '<p>Contact form coming soon. For now, please reach out to us at contact@toolifyai.com.</p>',
    },
    {
      id: 'privacy-policy',
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      icon: 'Shield',
      content: ``,
    },
    {
      id: 'terms-conditions',
      slug: 'terms-conditions',
      title: 'Terms & Conditions',
      icon: 'Gavel',
      content: ``,
    },
    {
      id: 'dmca',
      slug: 'dmca',
      title: 'DMCA',
      icon: 'Gavel',
      content: ``,
    },
  ] },
  plan: { plans: [
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
  ] },
  footer: {
    showLogo: true,
    description: "ToolifyAI is your go-to hub for powerful, easy-to-use online utilities that simplify everyday tasks. Whether you need converters, analyzers, or creative tools, ToolifyAI connects you to everything in one place.",
    topToolsTitle: 'Top Tools',
    quickLinksTitle: 'Quick Links',
    hostingLinksTitle: 'Best Hostings',
    moreToolsTitle: 'More Tools',
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
  },
  homepage: {
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
    {
      id: 'feat5',
      icon: 'Gem' as const,
      title: 'High-quality Output',
      description: 'Get crisp, clear, and accurate results without compromising on quality.',
    },
    {
      id: 'feat6',
      icon: 'MousePointerClick' as const,
      title: 'User-friendly Interface',
      description: 'Our tools are designed to be intuitive and easy to use for everyone, regardless of technical skill.',
    },
    {
      id: 'feat7',
      icon: 'Bot' as const,
      title: 'AI-Powered Tools',
      description: 'Leverage the power of artificial intelligence to automate tasks and unlock new creative possibilities.',
    },
    {
      id: 'feat8',
      icon: 'ShieldCheck' as const,
      title: 'Secure & Reliable',
      description: 'Your data is always safe and protected with our robust security measures and reliable infrastructure.',
    },
  ],
  },
  referral: {
    isReferralEnabled: true,
    commissionRate: 20,
    cookieDuration: 30,
    payoutThreshold: 50,
    isMultiLevel: false,
    referralProgramDescription: 'Earn a commission for every new paying customer you refer. Payments are made monthly via PayPal.',
  },
  faqs: defaultFaqSettings,
  sidebar: {
    toolSidebar: {
        showPopularTools: true,
        showRecentPosts: true,
    },
    blogSidebar: {
        showPopularTools: true,
        showRecentPosts: true,
    }
  },
  placeholderImages: placeholderImages,
});

/**
 * Retrieves the application settings from Firestore.
 * If no settings exist, it returns the default values defined in the schema.
 * This function is cached to prevent excessive database reads.
 * @returns {Promise<AppSettings>} The application settings.
 */
export const getSettings = cache(async (): Promise<AppSettings> => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, MAIN_SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const parsedData = AppSettingsSchema.safeParse(docSnap.data());
            if (parsedData.success) {
                return parsedData.data;
            } else {
                console.warn("Firestore settings data is invalid, returning defaults.", parsedData.error);
                return defaultSettings;
            }
        } else {
            console.log("No settings document found, creating one with default values.");
            await setDoc(docRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error: any) {
        console.error("Error getting settings:", error.message);
        // On client-side errors (e.g., network), it's better to return defaults than crash.
        // For server-side, this indicates a more serious problem.
        if (typeof window === 'undefined') { // Server-side check
            // Use the server-only function as a fallback to get data directly
            try {
                return await getSettingsData();
            } catch (adminError: any) {
                 console.error("Fallback to admin fetch also failed:", adminError.message);
                 return defaultSettings;
            }
        }
        return defaultSettings;
    }
});


/**
 * Updates the application settings in Firestore.
 * It performs a deep merge to only update the provided fields.
 * @param {Partial<AppSettings>} newSettings - The new settings values to save.
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation.
 */
export async function updateSettings(newSettings: Partial<AppSettings>): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb) {
      return { success: false, message: 'Database not initialized.' };
  }
  try {
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
    const currentDoc = await docRef.get();
    const currentSettings = currentDoc.exists ? currentDoc.data() : {};
    
    // Create the new settings state by taking the current settings
    // and overwriting them with the partial new settings.
    const mergedSettings = {
      ...currentSettings,
      ...newSettings,
    };
    
    // Validate the merged object before saving to ensure data integrity
    const validationResult = AppSettingsSchema.safeParse(mergedSettings);
    if (!validationResult.success) {
      throw new z.ZodError(validationResult.error.issues);
    }

    // Save the fully merged and validated object to Firestore
    await docRef.set(validationResult.data, { merge: true });
    
    return { success: true, message: 'Settings updated successfully.' };
  } catch (error: any) {
    console.error("Error updating settings:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: error.message || 'An unknown error occurred while updating settings.' };
  }
}

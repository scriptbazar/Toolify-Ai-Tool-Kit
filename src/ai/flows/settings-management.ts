

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

const SETTINGS_COLLECTION = 'settings';
const MAIN_SETTINGS_DOC_ID = 'main';

const defaultFaqSettings = {
    contactFaqs: [],
    pricingFaqs: [],
    affiliateFaqs: [],
};


const defaultSettings = AppSettingsSchema.parse({ 
  page: { pages: [
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
      content: `
        <div class="space-y-6">
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Your privacy is important to us. It is ToolifyAI's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
          
          <h2 class="text-2xl font-bold border-b pb-2">1. Information We Collect</h2>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
          <ul class="list-disc list-inside space-y-2">
              <li><strong>Log data:</strong> When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.</li>
              <li><strong>Personal Information:</strong> We may ask for personal information, such as your name and email address, when you register for an account or contact us.</li>
              <li><strong>Usage Data:</strong> We collect information about how you use our tools and services. This helps us understand which features are popular and how we can improve our platform.</li>
          </ul>

          <h2 class="text-2xl font-bold border-b pb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
           <ul class="list-disc list-inside space-y-2">
              <li>Provide, operate, and maintain our website and tools.</li>
              <li>Improve, personalize, and expand our website and services.</li>
              <li>Understand and analyze how you use our website.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
              <li>Send you emails and prevent fraud.</li>
          </ul>

          <h2 class="text-2xl font-bold border-b pb-2">3. Cookies</h2>
          <p>We use "cookies" to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site. This helps us serve you content based on preferences you have specified.</p>

          <h2 class="text-2xl font-bold border-b pb-2">4. Security</h2>
          <p>We take security seriously. We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>

          <h2 class="text-2xl font-bold border-b pb-2">5. Your Rights</h2>
          <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. You have the right to access, update, or delete the information we have on you. If you wish to exercise these rights, please contact us.</p>
        </div>
      `,
    },
    {
      id: 'terms-conditions',
      slug: 'terms-conditions',
      title: 'Terms & Conditions',
      content: `
        <div class="space-y-6">
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the ToolifyAI website (the "Service") operated by ToolifyAI ("us", "we", or "our").</p>
          
          <h2 class="text-2xl font-bold border-b pb-2">1. Agreement to Terms</h2>
          <p>By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>

          <h2 class="text-2xl font-bold border-b pb-2">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials on ToolifyAI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul class="list-disc list-inside space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on ToolifyAI's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 class="text-2xl font-bold border-b pb-2">3. Disclaimer</h2>
          <p>The materials on ToolifyAI's website are provided on an 'as is' basis. ToolifyAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

          <h2 class="text-2xl font-bold border-b pb-2">4. Limitations</h2>
          <p>In no event shall ToolifyAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ToolifyAI's website, even if ToolifyAI or a ToolifyAI authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          
          <h2 class="text-2xl font-bold border-b pb-2">5. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
        </div>
      `,
    },
    {
      id: 'dmca',
      slug: 'dmca',
      title: 'DMCA',
      content: `
        <div class="space-y-6">
           <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          <p>ToolifyAI respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond promptly to notices of alleged copyright infringement that are duly reported to our Designated Copyright Agent.</p>

          <h2 class="text-2xl font-bold border-b pb-2">1. Notification of Copyright Infringement</h2>
          <p>If you are a copyright owner and you believe that your work has been copied in a way that constitutes copyright infringement, please provide our Copyright Agent with the following information in writing:</p>
           <ul class="list-disc list-inside space-y-2">
              <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material.</li>
              <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an email address.</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          </ul>

          <h2 class="text-2xl font-bold border-b pb-2">2. Counter-Notification</h2>
          <p>If you believe that your material has been removed or disabled by mistake or misidentification, you may file a counter-notification with us by submitting written notification to our Copyright Agent that includes substantially the following:</p>
           <ul class="list-disc list-inside space-y-2">
              <li>Your physical or electronic signature.</li>
              <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access to it was disabled.</li>
              <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled.</li>
              <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which the address is located.</li>
          </ul>

          <h2 class="text-2xl font-bold border-b pb-2">3. Contact Information</h2>
          <p>Our Designated Copyright Agent to receive notifications of claimed infringement can be reached at: <strong>dmca@toolifyai.com</strong></p>
        </div>
      `,
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
 * @param {Partial<AppSettings>} newSettings - The new settings values to save.
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation.
 */
export async function updateSettings(newSettings: Partial<AppSettings>): Promise<{ success: boolean; message: string }> {
  try {
    const currentSettings = await getSettings();
    
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
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(MAIN_SETTINGS_DOC_ID);
    // Using `set` instead of `update` to handle array deletions correctly.
    // `merge: true` is crucial to avoid overwriting unrelated settings fields.
    await docRef.set(validationResult.data, { merge: true });
    
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

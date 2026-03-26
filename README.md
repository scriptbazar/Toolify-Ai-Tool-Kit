# 🚀 Toolify AI Tool Kit

**Toolify AI Tool Kit** is a state-of-the-art, high-performance web application suite built with **Next.js 14**, **Firebase**, and advanced **AI integrations**. Designed as a comprehensive solution for digital creators, developers, and businesses, it offers over **170+ professional tools** ranging from AI content generation to complex financial calculations and document management.

---

## 🏗️ Architecture Overview

Toolify is built on a robust, dual-panel architecture ensuring a seamless experience for both administrators and end-users.

### 🛡️ Separate Admin Panel
A high-control administrative dashboard for managing the entire ecosystem:
- **User Management:** Full control over user accounts, roles, and status.
- **Tools Management:** Dynamic control over tool visibility, categories, and slugs.
- **Real-time Analytics:** Track traffic, tool usage, and user growth.
- **Revenue Management:** Oversight of payment history (Stripe, PayPal, Razorpay).
- **Affiliate Management:** Monitor and manage the affiliate program performance.
- **Support & Tickets:** Integrated system to resolve user queries and issues.
- **Content Control:** Manage blogs, announcements, and on-site advertisements.
- **Email System:** Built-in tools for communication and user notifications.

### 👤 User Dashboard
A personalized workspace for end-users to manage their interactions:
- **Usage Statistics:** Detailed history of tools used and activity logs.
- **Subscription Management:** Manage plans, billing history, and upgrades.
- **My Favorites:** Quick access to frequently used tools.
- **Media Library:** Centralized storage for processed files and generated content.
- **Ticket Support:** Create and track support requests.
- **Affiliate Program:** Personalized dashboard for tracking referrals and earnings.
- **Community Chat:** Connect and interact with other users.

---

## ✨ Core Feature Categories

### 🤖 AI-Powered Suite
Powered by **Google Genkit** and **Gemini API**:
- **AI Writing Assistant:** Blog posts, emails, and social media content.
- **Image Recognition:** Advanced OCR and object detection via Cloud Vision.
- **AI Utility flows:** Custom-built logic for automated tasks.

### 📄 Professional PDF Tools
- **Manipulation:** Merge, Split, Rotate, and Reorder pages.
- **Optimization:** High-fidelity compression.
- **security:** Password protection and digital signing.
- **Conversion:** PDF to Office formats and high-quality image extraction.

### 🖼️ Image Processing Lab
- **Editing:** Precision cropping, resizing, and rotation.
- **Optimization:** Web-optimized compression for PNG/JPG/WebP.
- **Branding:** Batch watermarking and metadata (Exif) management.
- **Aesthetics:** Background removal and color palette extraction.

### 🔢 Calculation & Dev Utilities
- **Financial:** GST, SIP, EMI, Mutual Funds, and TDS calculators.
- **Academic:** Performance calculators (GPA/CGPA) and age metrics.
- **Developer Tools:** JSON/SQL formatters, QR/Barcode generators, and Base64 converters.
- **Network:** Speed testing and HTTP status code verification.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Rendering optimization)
- **Programming:** [TypeScript](https://www.typescriptlang.org/) (Type-safe codebase)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Backend Service:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Cloud Storage, Admin SDK)
- **AI Infrastructure:** [Google Genkit](https://github.com/firebase/genkit) & [Google Generative AI](https://ai.google.dev/)
- **Payment Gateways:** Integrated Stripe, PayPal, and Razorpay.
- **Visuals:** Lucide React Icons, Recharts for analytics visualization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v20.x** or later.
- A Firebase project with Firestore and Auth enabled.
- API keys for Google Gemini, Cloud Vision, and Payment providers.

### Installation

1. **Clone the project:**
   ```bash
   git clone https://github.com/yourusername/toolify-ai-tool-kit.git
   cd toolify-ai-tool-kit
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Configuration:**
   Copy `.env.example` to `.env` and populate:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx

   # AI Config
   GOOGLE_GENAI_API_KEY=xxx

   # Payment Configs
   STRIPE_SECRET_KEY=xxx
   RAZORPAY_KEY_ID=xxx
   PAYPAL_CLIENT_ID=xxx
   ```

4. **Launch Development Environment:**
   ```bash
   npm run dev
   ```

---

## 🌍 SEO & Performance
Toolify is engineered for speed and search engine visibility:
- **Dynamic Meta Tags:** Every tool and blog post has unique SEO-optimized headers.
- **Semantic HTML5:** Ensuring maximum accessibility and crawlability.
- **Image Optimization:** Automatic WebP serving and lazy loading.

---

## 🤝 Contributing & Support
Made with ❤️ by [script Bazar](mailto:scriptbazar76@gmail.com).

For commercial inquiries or feature requests, please open an issue or reach out via email.

---
© 2024 Toolify AI Tool Kit. All Rights Reserved.

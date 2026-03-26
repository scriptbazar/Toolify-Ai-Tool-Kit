# 🚀 Toolify AI Tool Kit

**Toolify AI Tool Kit** is a comprehensive, high-performance web application built with **Next.js 14**, **Firebase**, and **AI integrations**. It serves as a one-stop destination for over **170+ digital tools** across various categories like PDF management, image processing, financial calculations, development utilities, and AI-powered content generation.

---

## ✨ Key Features

### 🤖 AI-Powered Tools
Leveraging **Google Gemini** and **Genkit**, Toolify provides advanced AI capabilities:
- AI Content Generation
- Smart Image Recognition
- AI Writing Assistant

### 📄 PDF Suite
A complete set of tools to manage your documents:
- **Merge & Split:** Combine multiple PDFs or extract specific pages.
- **Compress:** Reduce file size without losing quality.
- **Sign & Protect:** Add digital signatures and encrypt with passwords.
- **Convert:** PDF to JPG, Word to PDF, Excel to PDF, and more.

### 🖼️ Image Toolkit
Professional-grade image processing tools:
- **Resizer & Cropper:** Adjust dimensions for social media or printing.
- **Compressor:** Optimize images for faster web loading.
- **Converter:** Support for PNG, JPG, WebP, SVG, and ICO.
- **Watermark:** Protect your photos with custom watermarks.
- **Background & Color:** Extract color palettes or remove backgrounds.

### 🔢 Calculators & Financial Tools
- **Financial:** GST, SIP, Loan (EMI), Mutual Fund, HRA, and TDS calculators.
- **Academic:** GPA to CGPA, Marks to Percentage, and Age calculators.
- **Health:** BMI and Fuel Cost calculators.

### 💻 Development & SEO Utilities
- **Code Formatters:** JSON, SQL, and HTML/CSS/JS minifiers.
- **Generators:** QR Code, Barcode, Robots.txt, and XML Sitemap generators.
- **Converters:** Base64, Binary, Hex, and ASCII converters.
- **Network:** Internet Speed Test, Redirect Checker, and Status Code checker.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Backend:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK)
- **AI Engine:** [Google Genkit](https://github.com/firebase/genkit)
- **Payments:** Stripe, PayPal, and Razorpay integration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or later)
- Firebase Account
- Google Cloud Project (for Genkit/Gemini API)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/toolify-ai-tool-kit.git
   cd toolify-ai-tool-kit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   GOOGLE_GENAI_API_KEY=your_gemini_key
   # Add other keys for Stripe, PayPal, etc.
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🏗️ Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & API)
├── components/      # Reusable UI & Tool Components
├── ai/             # Genkit Flows & AI Logic
├── firebase/       # Client & Admin SDK Config
├── lib/            # Utility functions & Shared logic
└── hooks/          # Custom React hooks
```

---

## 🌍 SEO & Meta Optimization

Every tool page is pre-optimized for SEO with dynamic meta tags, titles, and descriptions, ensuring visibility on search engines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or new tool ideas.

---
Created with ❤️ by [script Bazar](scriptbazar76@gmail.com)



'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { type Tool, ToolSchema, UpsertToolInputSchema, type ToolRequest, ToolRequestSchema } from './tool-management.types';
import { z } from 'zod';

const TOOLS_COLLECTION = 'tools';
const TOOL_REQUESTS_COLLECTION = 'toolRequests';

const initialTools: Omit<Tool, 'id' | 'slug' | 'createdAt'>[] = [
    { name: 'Case Converter', description: 'Easily convert text between different letter cases like uppercase, lowercase, title case, and more with a single click.', icon: 'CaseSensitive', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Word Counter', description: 'Count words, characters, sentences, paragraphs, and reading time for any text to meet your writing requirements.', icon: 'Calculator', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Lorem Ipsum Generator', description: 'Generate customizable placeholder text in various lengths and formats for your design and development projects.', icon: 'FileText', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Password Generator', description: 'Create strong, secure, and highly customizable passwords with options for length, characters, and complexity.', icon: 'KeyRound', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'JSON Formatter', description: 'Format, validate, and beautify your JSON data for improved readability and easier debugging.', icon: 'Braces', category: 'dev', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'BMI Calculator', description: 'Calculate your Body Mass Index (BMI) to quickly assess your weight status and overall health.', icon: 'HeartPulse', category: 'calculator', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Text to Speech', description: 'Convert written text into natural-sounding spoken audio in a variety of voices and languages.', icon: 'Volume2', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Speech to Text', description: 'Accurately transcribe audio files and spoken words into written text with our advanced speech recognition tool.', icon: 'Voicemail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Merger', description: 'Combine multiple PDF files into a single, organized document, perfect for reports and presentations.', icon: 'FilePlus2', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active' },
    { name: 'Unlock PDF', description: 'Easily remove password protection and restrictions from your PDF files to allow editing and printing.', icon: 'Unlock', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Lock PDF', description: 'Protect your sensitive PDF files with a strong password and set permissions for printing, copying, and editing.', icon: 'Lock', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Unit Converter', description: 'Convert between various units of measurement for length, mass, temperature, and more with this versatile tool.', icon: 'Ruler', category: 'calculator', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Color Picker', description: 'Pick colors from an interactive color wheel or your screen to get HEX, RGB, and HSL codes instantly.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Text Repeater', description: 'Repeat a piece of text multiple times with optional new lines, perfect for testing or creative purposes.', icon: 'Repeat', category: 'text', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Prompt Generator', description: 'Generate creative and detailed prompts for AI models based on your topic to get better results.', icon: 'Lightbulb', category: 'ai', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'AI Blog Post Writer', description: 'Generate a complete, SEO-friendly blog post on any topic, complete with headings and paragraphs.', icon: 'PenSquare', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Content Summarizer', description: 'Summarize long articles, documents, or complex texts into concise, easy-to-read key points.', icon: 'AlignLeft', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Code Assistant', description: 'Get expert help with writing, debugging, and explaining code snippets in any programming language.', icon: 'Code', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Email Composer', description: 'Generate professional and effective emails for various purposes based on your provided key points and tone.', icon: 'Mail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Image Generator', description: 'Create stunning, unique, and high-quality images from simple text descriptions using advanced AI models.', icon: 'ImageIcon', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Product Description Writer', description: 'Craft persuasive and engaging descriptions for your e-commerce products to boost sales and SEO.', icon: 'ShoppingCart', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Story Generator', description: 'Craft compelling and imaginative short stories in various genres from a simple prompt or topic.', icon: 'BookOpen', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Tweet Generator', description: 'Generate engaging tweets and thread ideas for your social media, complete with relevant hashtags.', icon: 'Twitter', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Voice Cloning', description: 'Create a digital clone of your voice from a short audio sample and generate speech in your own accent.', icon: 'Voicemail', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Story Visualizer', description: 'Analyze your story scene-by-scene and generate powerful, descriptive image prompts for each visual moment.', icon: 'Clapperboard', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Code Generator', description: 'Generate high-quality code snippets in any language with detailed setup instructions and explanations.', icon: 'Terminal', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Rewriter', description: 'Rewrite your text to improve clarity, change the tone, fix grammar, or adjust the length as needed.', icon: 'FilePenLine', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Add Watermark to PDF', description: 'Add a text or image watermark to your PDF documents to protect and brand your files.', icon: 'Fingerprint', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Age Calculator', description: 'Calculate your exact age in years, months, and days from your date of birth instantly.', icon: 'Gift', category: 'calculator', plan: 'Free', isNew: false, status: 'Active' },
    { name: 'Amazon Shipping Label Cropper', description: 'Effortlessly crop Amazon FBA labels from 8.5x11 inch to a perfect 4x6 inch format for thermal printers.', icon: 'FileUp', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Myntra Shipping Label Cropper', description: 'Quickly convert your standard Myntra shipping labels into a thermal printer-friendly 4x6 inch format.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Flipkart Shipping Label Cropper', description: 'Crop your Flipkart shipping labels from a full page to a 4x6 inch size in seconds, ideal for thermal printing.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Meesho Shipping Label Cropper', description: 'Optimize your Meesho shipping process by cropping default labels to a 4x6 inch format for your thermal printer.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Base64 Converter', description: 'Encode your text and data into Base64 format or decode Base64 strings back to their original form.', icon: 'Package', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'CSS Minifier', description: 'Minify your CSS code to reduce file size, remove comments, and improve your website\'s loading times.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Discount Calculator', description: 'Easily calculate the final price after a discount and see exactly how much money you save.', icon: 'BadgePercent', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Date Calculator', description: 'Calculate the duration between two dates or find a future/past date by adding or subtracting days, months, and years.', icon: 'CalendarDays', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Compress PDF', description: 'Reduce the file size of your PDF documents without sacrificing quality, making them easier to share.', icon: 'FileArchive', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Excel to PDF', description: 'Convert your Microsoft Excel spreadsheets (.xls, .xlsx) into professional-looking PDF documents.', icon: 'FileSpreadsheet', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Reverse Text', description: 'Reverse your text in various ways, including reversing all characters, reversing words only, or reversing letter order in words.', icon: 'ArrowLeftRight', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Remove Extra Spaces', description: 'Clean up your text by automatically removing unnecessary spaces, tabs, and line breaks.', icon: 'Eraser', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Find and Replace', description: 'Quickly find and replace specific words or phrases within a body of text with case-sensitive options.', icon: 'SearchCode', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Random Word Generator', description: 'Generate random words for creative writing, brainstorming sessions, games, or vocabulary practice.', icon: 'Shuffle', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Rotate Image', description: 'Rotate an image by 90, 180, or 270 degrees to get the perfect orientation for your needs.', icon: 'RotateCw', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PNG to JPG', description: 'Convert your PNG images to the universally compatible JPG format, with options to control quality.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'JPG to PNG', description: 'Convert your JPG images to the PNG format, perfect for when you need transparency support.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image to Base64', description: 'Convert an image file into a Base64 string that can be easily embedded in HTML or CSS.', icon: 'Code', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Resizer', description: 'Resize your images by specifying new dimensions in pixels or by a percentage of the original size.', icon: 'Scaling', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Background Remover', description: 'Automatically remove the background from any image with a single click using advanced AI.', icon: 'Scissors', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AdMob Revenue Calculator', description: 'Estimate your potential AdMob earnings based on DAU, impressions, eCPM, and other key metrics.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'AdSense Revenue Calculator', description: 'Estimate your potential AdSense earnings based on page views, Click-Through Rate (CTR), and Cost Per Click (CPC).', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'IFSC Code to Bank Details', description: 'Get complete bank branch details instantly from an Indian Financial System Code (IFSC).', icon: 'Banknote', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'GST Calculator', description: 'Calculate the Goods and Services Tax (GST) for any amount with customizable tax slabs.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Color Extractor', description: 'Extract a complete color palette from an uploaded image to use in your design projects.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Cropper', description: 'Crop your images to your desired dimensions with an easy-to-use visual cropping tool.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Compressor', description: 'Reduce the file size of your JPG and PNG images while maintaining the best possible quality.', icon: 'FileArchive', category: 'image', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Image Text Extractor', description: 'Extract all text from an image using Optical Character Recognition (OCR) technology.', icon: 'ScanText', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Image Converter', description: 'Convert your images between a wide variety of formats like PNG, JPG, WEBP, and more.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image to PDF', description: 'Convert your JPG, PNG, and other image files into a single, easy-to-share PDF document.', icon: 'FileImage', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PDF Signer', description: 'Sign your PDF documents electronically by drawing your signature or uploading an image of it.', icon: 'PenSquare', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Rotate PDF', description: 'Rotate all pages or specific pages in your PDF document to the correct orientation.', icon: 'RotateCw', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Marks to Percentage Calculator', description: 'Convert your exam marks or grades into a standardized percentage score quickly and easily.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'SRM to CGPA Calculator', description: 'Calculate your Cumulative Grade Point Average (CGPA) specifically for SRM University students.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'CGPA to Marks Calculator', description: 'Convert your CGPA score into an equivalent total marks or percentage based on your university\'s formula.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'GPA to Percentage Converter', description: 'Convert your Grade Point Average (GPA) into a percentage to understand your academic standing.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'GPA to CGPA Calculator', description: 'Calculate your Cumulative Grade Point Average (CGPA) from your semester-wise or yearly GPA scores.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Percentage to CGPA Converter', description: 'Convert your overall percentage into a CGPA score on various scales (e.g., 4.0, 10.0).', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'CGPA to GPA Converter', description: 'Convert your Cumulative Grade Point Average (CGPA) back to a standard GPA score.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PDF Splitter', description: 'Split a large PDF file into multiple smaller files or extract a specific range of pages into a new document.', icon: 'Split', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Page Reorder', description: 'Visually rearrange the pages of your PDF document into a new order with a simple drag-and-drop interface.', icon: 'Shuffle', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Page Counter', description: 'Quickly and accurately count the total number of pages in any PDF file without opening it.', icon: 'ListOrdered', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PDF Page Numberer', description: 'Add customizable page numbers to your PDF documents, with options for position, format, and style.', icon: 'Hash', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Page Remover', description: 'Delete one or more specific pages from a PDF document to create a new, refined file.', icon: 'FileMinus', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF Organizer', description: 'Visually rearrange, delete, rotate, and organize pages from multiple PDF files into one new document.', icon: 'Layers', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Website Screenshot', description: 'Take a full-page, high-resolution screenshot of any website by simply entering its URL.', icon: 'MonitorSmartphone', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'What Is My Browser', description: 'Get detailed information about your web browser, operating system, screen size, and more.', icon: 'Globe', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Negative Marking Calculator', description: 'Calculate your final score in exams that use a negative marking scheme for incorrect answers.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'YouTube Channel Banner Downloader', description: 'Download the high-quality banner image (channel art) from any YouTube channel.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'YouTube Channel Logo Downloader', description: 'Download the high-resolution profile picture or logo from any YouTube channel.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'YouTube Video Description Extractor', description: 'Extract and view the full, formatted text description of any YouTube video.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'YouTube Video Title Extractor', description: 'Quickly extract the complete title from any YouTube video by pasting its URL.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'YouTube Video Thumbnail Downloader', description: 'Download thumbnails from any YouTube video in all available resolutions (HD, SD, etc.).', icon: 'Image', category: 'video', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'YouTube Region Restriction Checker', description: 'Check if a YouTube video is blocked or restricted in any country around the world.', icon: 'Globe', category: 'video', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Google Drive Direct Link Generator', description: 'Convert your Google Drive sharing links into permanent, direct download links for easy sharing.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Dropbox Direct Link Generator', description: 'Convert your Dropbox sharing links into permanent, direct download links that start downloading immediately.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'OneDrive Direct Link Generator', description: 'Convert your OneDrive sharing links into permanent, direct download links for seamless file sharing.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'NSDL PAN Card Photo and Signature Resizer', description: 'Resize your photo and signature to the exact dimensions and file size required for NSDL PAN card applications.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'UTI PAN Card Photo and Signature Resizer', description: 'Resize your photo and signature to meet the specific requirements for UTI PAN card applications online.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PRN to PDF', description: 'Convert PRN files, commonly generated by the "Print to File" option, into standard PDF documents.', icon: 'FileText', category: 'pdf', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Text Encryption & Decryption', description: 'Encrypt and decrypt text using various algorithms like AES and TripleDES for secure communication.', icon: 'Lock', category: 'dev', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Password Strength Checker', description: 'Check the strength and security of your password against common patterns and vulnerabilities.', icon: 'CheckCheck', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'SHA256 Hash Generator', description: 'Generate a secure SHA-256 hash for any text string, commonly used for data integrity checks.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Universal Hash Generator', description: 'Generate various types of cryptographic hashes for your text, including MD5, SHA1, SHA512, and more.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'AES Encryption & Decryption', description: 'Encrypt and decrypt your files using the Advanced Encryption Standard (AES) for maximum security.', icon: 'Key', category: 'dev', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Universal File Converter', description: 'Convert your files from one format to another across a wide range of categories like documents, images, and more.', icon: 'FileCog', category: 'dev', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Image Shape Converter', description: 'Convert your images into various creative shapes like circles, stars, hearts, and more.', icon: 'Shapes', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Morse to Text Translator', description: 'Translate Morse code signals (dots and dashes) into plain, readable text.', icon: 'MessageSquare', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Text to Morse Code', description: 'Translate plain text into universally recognized Morse code signals.', icon: 'MessageSquare', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Cryptocurrency Converter', description: 'Convert between different cryptocurrencies and traditional fiat currencies with real-time rates.', icon: 'Bitcoin', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Barcode Generator', description: 'Generate various types of barcodes, such as UPC, EAN, and Code 128, for your products or inventory.', icon: 'Barcode', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Currency Converter', description: 'Convert between different world currencies with up-to-date exchange rates for your travel or business needs.', icon: 'Coins', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Credit Card Interest Calculator', description: 'Calculate the interest on your credit card balance to better understand and manage your debt.', icon: 'CreditCard', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'UUID Generator', description: 'Generate universally unique identifiers (UUIDs) in various versions for your application needs.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Image Metadata Viewer', description: 'View detailed EXIF and other metadata from your images, such as camera settings, location, and date.', icon: 'Camera', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'AI Image Quality Enhancer', description: 'Upscale and enhance the quality, resolution, and details of your images using powerful AI algorithms.', icon: 'Sparkles', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI Web Content Summarizer', description: 'Summarize and explain the content of any public website or article by simply providing a URL.', icon: 'Globe', category: 'ai', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Binary to Text', description: 'Convert binary code (0s and 1s) back into plain, readable text characters.', icon: 'Binary', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Text to Binary', description: 'Convert plain text characters into their binary code representation.', icon: 'Binary', category: 'text', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Flip Image', description: 'Flip an image horizontally or vertically to create a mirrored version of your original picture.', icon: 'FlipHorizontal', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'ICO Converter', description: 'Convert your images (PNG, JPG) to the ICO format, perfect for creating website favicons.', icon: 'FileHeart', category: 'image', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Word to PDF', description: 'Convert your Microsoft Word documents (.doc, .docx) into professional PDF files while preserving formatting.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PPT to PDF', description: 'Convert your PowerPoint presentations (.ppt, .pptx) into shareable PDF documents.', icon: 'FileBadge2', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF to Word', description: 'Convert your PDF files back into editable Microsoft Word documents to easily make changes.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'PDF to JPG', description: 'Convert each page of a PDF document into high-quality JPG images.', icon: 'FileImage', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Meta Tag Generator', description: 'Create essential meta tags (title, description, keywords) to improve your website\'s search engine optimization (SEO).', icon: 'Tags', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Robots.txt Generator', description: 'Generate a robots.txt file to guide search engine crawlers on which parts of your site to index or ignore.', icon: 'Bot', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'XML Sitemap Generator', description: 'Create an XML sitemap for your website to help search engines like Google better discover and index all your pages.', icon: 'FileCode', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Favicon Checker', description: 'Check if a website has a favicon installed and preview how it looks in a browser tab.', icon: 'Image', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Keyword Density Checker', description: 'Analyze the keyword density of your text content to optimize for SEO and avoid keyword stuffing.', icon: 'Key', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'SERP Checker', description: 'Check the real-time search engine results page (SERP) for a given keyword in a specific location.', icon: 'Search', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Redirect Checker', description: 'Check the full redirect chain and status code (301, 302, etc.) of any URL to diagnose SEO issues.', icon: 'Link', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Schema Generator', description: 'Generate structured data markup (JSON-LD) for your website to improve how search engines understand your content.', icon: 'Code', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Title Tag Checker', description: 'Check the length (in characters and pixels) of your title tags to ensure they don\'t get truncated in search results.', icon: 'Text', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Website Word Counter', description: 'Count the total number of words on any webpage by simply entering its URL.', icon: 'FileSearch', category: 'seo', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Fuel Cost Calculator', description: 'Calculate the total fuel cost for a trip based on distance, fuel efficiency, and price per liter.', icon: 'Fuel', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'GPA Calculator', description: 'Calculate your Grade Point Average (GPA) based on your course credits and grades.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Loan Calculator', description: 'Calculate your monthly loan payments, total payment, and total interest for mortgages, car loans, or personal loans.', icon: 'Landmark', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Percentage Calculator', description: 'Easily calculate percentages, find what a percentage of a number is, or determine percentage change.', icon: 'Percent', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Time Zone Converter', description: 'Convert times between different time zones around the world to coordinate meetings and events.', icon: 'Clock', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Unix Timestamp Converter', description: 'Convert Unix timestamps to human-readable dates and vice-versa for development and data analysis.', icon: 'Timer', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'HTML Minifier', description: 'Minify your HTML code to reduce file size, remove whitespace, and improve website loading performance.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'JavaScript Minifier', description: 'Minify your JavaScript code to decrease file size and speed up your website or application.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'SQL Formatter', description: 'Format and beautify your SQL queries to make them more readable and easier to debug.', icon: 'Database', category: 'dev', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'YouTube Video Downloader', description: 'Download YouTube videos in various qualities and formats, including MP4 and MP3.', icon: 'Youtube', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'X (Twitter) Video Downloader', description: 'Download videos from posts on X (formerly Twitter) by simply pasting the post URL.', icon: 'Twitter', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Instagram Video Downloader', description: 'Download videos and reels from public Instagram posts directly to your device.', icon: 'Instagram', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Threads Video Downloader', description: 'Download videos from Threads posts by providing the URL of the post.', icon: 'AtSign', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'LinkedIn Video Downloader', description: 'Download videos from public LinkedIn posts to save for offline viewing or sharing.', icon: 'Linkedin', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Pinterest Video Downloader', description: 'Download videos from Pinterest pins to save your favorite ideas and tutorials.', icon: 'BookImage', category: 'video', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'AI SEO Keyword Generator', description: 'Get a comprehensive list of primary, secondary, and long-tail keywords for any topic to boost your search engine ranking.', icon: 'Key', category: 'seo', plan: 'Pro', isNew: true, status: 'Active' },
];

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

/**
 * Fetches all tools from Firestore.
 * If the collection is empty, it populates it with initial tools.
 * It also performs a one-time cleanup of duplicate tools.
 */
export async function getTools(): Promise<Tool[]> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot fetch tools.");
    return [];
  }

  const toolsRef = adminDb.collection(TOOLS_COLLECTION);
  let toolsFromDb: Tool[] = [];
  
  try {
      const snapshot = await toolsRef.get();
      toolsFromDb = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString();
          return ToolSchema.parse({ id: doc.id, ...data, createdAt });
      });
  } catch (error) {
      console.error("Error fetching tools from Firestore, might need schema update:", error);
      // Continue with an empty list to allow initialization logic to run
  }

  // Use a Map to ensure all tools from the initial list are present and unique by name.
  const toolMap = new Map<string, Tool>();

  // Add initial tools to the map first to establish the "source of truth"
  for (const toolData of initialTools) {
      if (!toolMap.has(toolData.name)) {
          const slug = generateSlug(toolData.name);
          toolMap.set(toolData.name, ToolSchema.parse({
              id: slug,
              slug: slug,
              createdAt: new Date().toISOString(),
              ...toolData,
          }));
      }
  }
  
  // If the database is not in sync with the code's source of truth (initialTools),
  // we will force a re-sync.
  const dbToolNames = new Set(toolsFromDb.map(t => t.name));
  const initialToolNames = new Set(initialTools.map(t => t.name));
  
  // Check if every tool in the initial list is present in the database.
  const isDbMissingTools = ![...initialToolNames].every(name => dbToolNames.has(name));

  if (toolsFromDb.length === 0 || toolsFromDb.length < initialTools.length || isDbMissingTools) {
      console.log(`[SYNC] Database requires synchronization. DB count: ${toolsFromDb.length}, Code count: ${initialTools.length}.`);
      const batch = adminDb.batch();
      
      // Clear existing tools to ensure a clean slate
      toolsFromDb.forEach(tool => {
        batch.delete(toolsRef.doc(tool.id));
      });
      
      // Add all unique tools from the initial list
      for (const tool of toolMap.values()) {
          const docRef = toolsRef.doc(tool.slug);
          batch.set(docRef, { ...tool, createdAt: FieldValue.serverTimestamp() });
      }
      
      await batch.commit();
      console.log("[SYNC] Database synchronized successfully.");
      
      // Re-fetch to return the correct, synchronized list
      const newSnapshot = await toolsRef.get();
      const finalTools = newSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString();
        return ToolSchema.parse({ id: doc.id, ...data, createdAt });
      });
      
      return finalTools.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // If no sync was needed, just return the tools from DB.
  return toolsFromDb.sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Adds or updates a tool in Firestore.
 * @param {Partial<Tool>} toolData - The data for the tool. If an ID is provided, it updates; otherwise, it adds.
 * @returns {Promise<{ success: boolean; message: string; toolId?: string }>}
 */
export async function upsertTool(toolData: Partial<Tool>): Promise<{ success: boolean; message: string; toolId?: string }> {
  try {
    const adminDb = getAdminDb();
    const { id, ...data } = toolData;
    
    if (data.name) {
      data.slug = generateSlug(data.name);
    }
    
    // Validate data before saving
    const validatedData = UpsertToolInputSchema.parse(data);

    if (id) {
      const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(id);
      await toolRef.update(validatedData);
      return { success: true, message: 'Tool updated successfully.', toolId: id };
    } else {
      if (!data.slug) throw new Error("Slug is required for a new tool.");
      const docRef = adminDb.collection(TOOLS_COLLECTION).doc(data.slug);
      await docRef.set({ ...validatedData, createdAt: FieldValue.serverTimestamp() });
      return { success: true, message: 'Tool added successfully.', toolId: docRef.id };
    }
  } catch (error: any) {
    console.error("Error upserting tool:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}


/**
 * Deletes a tool from Firestore.
 * @param {string} toolId - The ID of the tool to delete.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deleteTool(toolId: string): Promise<{ success: boolean; message: string }> {
    const adminDb = getAdminDb();
    if (!toolId) {
        return { success: false, message: 'Tool ID is required.' };
    }
    try {
        const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(toolId);
        const doc = await toolRef.get();
        if (!doc.exists) {
            return { success: false, message: 'Tool not found.' };
        }
        
        await toolRef.delete();

        // Log the component file path for manual deletion
        const toolName = doc.data()?.name || toolId;
        const componentName = toolName.replace(/\s+/g, '');
        const componentPath = `src/components/tools/${componentName}.tsx`;
        console.log(`ACTION REQUIRED: Tool '${toolName}' deleted from database. Please manually delete the component file: ${componentPath}`);

        return { success: true, message: 'Tool deleted successfully.' };
    } catch (error: any) {
        console.error(`Error deleting tool ${toolId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Fetches the favorite tools for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Tool[]>} A list of the user's favorite tools.
 */
export async function getFavoriteTools(userId: string): Promise<Tool[]> {
  try {
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists()) {
      return [];
    }

    const userData = userDocSnap.data();
    const favoriteSlugs: string[] = userData?.favorites || [];

    if (favoriteSlugs.length === 0) {
      return [];
    }

    const allTools = await getTools();
    const userFavorites = allTools.filter(tool => favoriteSlugs.includes(tool.slug));
    
    return userFavorites;
  } catch (error) {
    console.error(`Error fetching favorite tools for user ${userId}:`, error);
    return [];
  }
}

const RequestToolInputSchema = ToolRequestSchema.pick({
    name: true,
    email: true,
    toolName: true,
    description: true,
});
type RequestToolInput = {
    name: string;
    email: string;
    toolName: string;
    description: string;
};

export async function requestNewTool(input: RequestToolInput): Promise<{ success: boolean; message: string }> {
    try {
        const adminDb = getAdminDb();
        const validatedInput = RequestToolInputSchema.parse(input);
        await adminDb.collection(TOOL_REQUESTS_COLLECTION).add({
            ...validatedInput,
            status: 'pending',
            requestedAt: FieldValue.serverTimestamp(),
        });
        return { success: true, message: "Your tool request has been submitted successfully!" };
    } catch (error: any) {
        console.error("Error submitting tool request:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Fetches all tool requests from Firestore.
 */
export async function getToolRequests(): Promise<ToolRequest[]> {
    try {
        const adminDb = getAdminDb();
        const snapshot = await adminDb.collection(TOOL_REQUESTS_COLLECTION).orderBy('requestedAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                requestedAt: (data.requestedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as ToolRequest;
        });
    } catch (error) {
        console.error("Error fetching tool requests:", error);
        return [];
    }
}

/**
 * Updates the status of a tool request.
 */
export async function updateToolRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean, message: string }> {
    try {
        const adminDb = getAdminDb();
        const requestRef = adminDb.collection(TOOL_REQUESTS_COLLECTION).doc(requestId);
        await requestRef.update({ status });
        return { success: true, message: 'Request status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}


const GenerateToolDescriptionInputSchema = z.object({
  toolName: z.string().describe('The name of the tool to generate a description for.'),
});

const GenerateToolDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed, user-friendly description of what the tool does.'),
});

export async function generateToolDescription(input: z.infer<typeof GenerateToolDescriptionInputSchema>): Promise<z.infer<typeof GenerateToolDescriptionOutputSchema>> {
  const prompt = `Generate a concise and user-friendly description for a web tool called "${input.toolName}". The description should be a single sentence, starting with a verb, and clearly explain the tool's primary function. For example, for a "Case Converter" tool, a good description would be "Convert text between different letter cases (e.g., uppercase, lowercase, title case)."`;

  // This would be a call to a Genkit flow in a real app
  // For now, we simulate a simple response.
  const generatedDesc = `A new, amazing tool that helps you with ${input.toolName}.`;

  return { description: generatedDesc };
}


    

    

    

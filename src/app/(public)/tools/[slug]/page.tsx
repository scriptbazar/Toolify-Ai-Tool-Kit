

import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { WordCounter } from '@/components/tools/WordCounter';
import { LoremIpsumGenerator } from '@/components/tools/LoremIpsumGenerator';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { BmiCalculator } from '@/components/tools/BmiCalculator';
import { TextToSpeech } from '@/components/tools/TextToSpeech';
import { PdfMerger } from '@/components/tools/PdfMerger';
import { UnitConverter } from '@/components/tools/UnitConverter';
import { ColorPicker } from '@/components/tools/ColorPicker';
import { TextRepeater } from '@/components/tools/TextRepeater';
import { PromptGenerator } from '@/components/tools/PromptGenerator';
import { AiBlogPostWriter } from '@/components/tools/AiBlogPostWriter';
import { AiContentSummarizer } from '@/components/tools/AiContentSummarizer';
import { AiCodeAssistant } from '@/components/tools/AiCodeAssistant';
import { AiEmailComposer } from '@/components/tools/AiEmailComposer';
import { AiImageGenerator } from '@/components/tools/AiImageGenerator';
import { AiProductDescriptionWriter } from '@/components/tools/AiProductDescriptionWriter';
import { AiStoryGenerator } from '@/components/tools/AiStoryGenerator';
import { AiTweetGenerator } from '@/components/tools/AiTweetGenerator';
import { AddWatermarkToPdf } from '@/components/tools/AddWatermarkToPdf';
import { AgeCalculator } from '@/components/tools/AgeCalculator';
import { AmazonShippingLabelCropper } from '@/components/tools/AmazonShippingLabelCropper';
import { MyntraShippingLabelCropper } from '@/components/tools/MyntraShippingLabelCropper';
import { FlipkartShippingLabelCropper } from '@/components/tools/FlipkartShippingLabelCropper';
import { MeeshoShippingLabelCropper } from '@/components/tools/MeeshoShippingLabelCropper';
import { Base64Converter } from '@/components/tools/Base64Converter';
import { BinaryConverter } from '@/components/tools/BinaryConverter';
import { CssMinifier } from '@/components/tools/CssMinifier';
import { DiscountCalculator } from '@/components/tools/DiscountCalculator';
import { DateCalculator } from '@/components/tools/DateCalculator';
import { CompressPdf } from '@/components/tools/CompressPdf';
import { ExcelToPdf } from '@/components/tools/ExcelToPdf';
import { TextToBinary } from '@/components/tools/TextToBinary';
import { ReverseText } from '@/components/tools/ReverseText';
import { RemoveExtraSpaces } from '@/components/tools/RemoveExtraSpaces';
import { FindAndReplace } from '@/components/tools/FindAndReplace';
import { RandomWordGenerator } from '@/components/tools/RandomWordGenerator';
import { RotateImage } from '@/components/tools/RotateImage';
import { PngToJpg } from '@/components/tools/PngToJpg';
import { JpgToPng } from '@/components/tools/JpgToPng';
import { ImageToBase64 } from '@/components/tools/ImageToBase64';
import { ImageResizer } from '@/components/tools/ImageResizer';
import { FlipImage } from '@/components/tools/FlipImage';
import { IcoConverter } from '@/components/tools/IcoConverter';
import { ImageCompressor } from '@/components/tools/ImageCompressor';
import { ImageCropper } from '@/components/tools/ImageCropper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { notFound } from 'next/navigation';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/tools/ReviewForm';
import { getReviews } from '@/ai/flows/review-management';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPosts } from '@/ai/flows/blog-management';
import Link from 'next/link';
import { PdfSplitter } from '@/components/tools/PdfSplitter';
import { WordToPdf } from '@/components/tools/WordToPdf';
import { RotatePdf } from '@/components/tools/RotatePdf';
import { PptToPdf } from '@/components/tools/PptToPdf';
import { PdfToWord } from '@/components/tools/PdfToWord';
import { PdfToJpg } from '@/components/tools/PdfToJpg';
import { MetaTagGenerator } from '@/components/tools/MetaTagGenerator';
import { RobotsTxtGenerator } from '@/components/tools/RobotsTxtGenerator';
import { XmlSitemapGenerator } from '@/components/tools/XmlSitemapGenerator';
import { FaviconChecker } from '@/components/tools/FaviconChecker';
import { KeywordDensityChecker } from '@/components/tools/KeywordDensityChecker';
import { SerpChecker } from '@/components/tools/SerpChecker';
import { RedirectChecker } from '@/components/tools/RedirectChecker';
import { SchemaGenerator } from '@/components/tools/SchemaGenerator';
import { TitleTagChecker } from '@/components/tools/TitleTagChecker';
import { WebsiteWordCounter } from '@/components/tools/WebsiteWordCounter';
import { FuelCostCalculator } from '@/components/tools/FuelCostCalculator';
import { GpaCalculator } from '@/components/tools/GpaCalculator';
import { LoanCalculator } from '@/components/tools/LoanCalculator';
import { PercentageCalculator } from '@/components/tools/PercentageCalculator';
import { TimeZoneConverter } from '@/components/tools/TimeZoneConverter';
import { UnixTimestampConverter } from '@/components/tools/UnixTimestampConverter';
import { HtmlMinifier } from '@/components/tools/HtmlMinifier';
import { JavascriptMinifier } from '@/components/tools/JavascriptMinifier';
import { SqlFormatter } from '@/components/tools/SqlFormatter';
import { UuidGenerator } from '@/components/tools/UuidGenerator';
import { YoutubeVideoDownloader } from '@/components/tools/YoutubeVideoDownloader';
import { XVideoDownloader } from '@/components/tools/XVideoDownloader';
import { InstagramVideoDownloader } from '@/components/tools/InstagramVideoDownloader';
import { ThreadsVideoDownloader } from '@/components/tools/ThreadsVideoDownloader';

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

const toolComponents: { [key: string]: React.ComponentType } = {
  'case-converter': CaseConverter,
  'word-counter': WordCounter,
  'lorem-ipsum-generator': LoremIpsumGenerator,
  'password-generator': PasswordGenerator,
  'json-formatter': JsonFormatter,
  'bmi-calculator': BmiCalculator,
  'text-to-speech': TextToSpeech,
  'pdf-merger': PdfMerger,
  'unit-converter': UnitConverter,
  'color-picker': ColorPicker,
  'text-repeater': TextRepeater,
  'prompt-generator': PromptGenerator,
  'ai-blog-post-writer': AiBlogPostWriter,
  'ai-content-summarizer': AiContentSummarizer,
  'ai-code-assistant': AiCodeAssistant,
  'ai-email-composer': AiEmailComposer,
  'ai-image-generator': AiImageGenerator,
  'ai-product-description-writer': AiProductDescriptionWriter,
  'ai-story-generator': AiStoryGenerator,
  'ai-tweet-generator': AiTweetGenerator,
  'add-watermark-to-pdf': AddWatermarkToPdf,
  'age-calculator': AgeCalculator,
  'amazon-shipping-label-cropper': AmazonShippingLabelCropper,
  'myntra-shipping-label-cropper': MyntraShippingLabelCropper,
  'flipkart-shipping-label-cropper': FlipkartShippingLabelCropper,
  'meesho-shipping-label-cropper': MeeshoShippingLabelCropper,
  'base64-encoder-decoder': Base64Converter,
  'binary-to-text': BinaryConverter,
  'css-minifier': CssMinifier,
  'discount-calculator': DiscountCalculator,
  'date-calculator': DateCalculator,
  'compress-pdf': CompressPdf,
  'excel-to-pdf': ExcelToPdf,
  'text-to-binary': TextToBinary,
  'reverse-text': ReverseText,
  'remove-extra-spaces': RemoveExtraSpaces,
  'find-and-replace': FindAndReplace,
  'random-word-generator': RandomWordGenerator,
  'rotate-image': RotateImage,
  'png-to-jpg': PngToJpg,
  'jpg-to-png': JpgToPng,
  'image-to-base64': ImageToBase64,
  'image-resizer': ImageResizer,
  'flip-image': FlipImage,
  'ico-converter': IcoConverter,
  'image-compressor': ImageCompressor,
  'image-cropper': ImageCropper,
  'pdf-splitter': PdfSplitter,
  'word-to-pdf': WordToPdf,
  'rotate-pdf': RotatePdf,
  'ppt-to-pdf': PptToPdf,
  'pdf-to-word': PdfToWord,
  'pdf-to-jpg': PdfToJpg,
  'meta-tag-generator': MetaTagGenerator,
  'robots-txt-generator': RobotsTxtGenerator,
  'xml-sitemap-generator': XmlSitemapGenerator,
  'favicon-checker': FaviconChecker,
  'keyword-density-checker': KeywordDensityChecker,
  'serp-checker': SerpChecker,
  'redirect-checker': RedirectChecker,
  'schema-generator': SchemaGenerator,
  'title-tag-checker': TitleTagChecker,
  'website-word-counter': WebsiteWordCounter,
  'fuel-cost-calculator': FuelCostCalculator,
  'gpa-calculator': GpaCalculator,
  'loan-calculator': LoanCalculator,
  'percentage-calculator': PercentageCalculator,
  'time-zone-converter': TimeZoneConverter,
  'unix-timestamp-converter': UnixTimestampConverter,
  'html-minifier': HtmlMinifier,
  'javascript-minifier': JavascriptMinifier,
  'sql-formatter': SqlFormatter,
  'uuid-generator': UuidGenerator,
  'youtube-video-downloader': YoutubeVideoDownloader,
  'x-video-downloader': XVideoDownloader,
  'instagram-video-downloader': InstagramVideoDownloader,
  'threads-video-downloader': ThreadsVideoDownloader,
};

const SidebarWidget = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="p-4">
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {children}
        </CardContent>
    </Card>
);

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const awaitedParams = await Promise.resolve(params);
  const allTools = await getTools();
  const tool = allTools.find((t) => t.slug === awaitedParams.slug);
  const settings = await getSettings();
  
  if (!tool) {
    notFound();
  }

  const allReviews = await getReviews();
  const toolReviews = allReviews.filter(r => r.toolId === tool.slug && r.status === 'approved');

  const ToolComponent = toolComponents[tool.slug];
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  
  const sidebarSettings = settings.sidebar?.toolSidebar;
  const popularTools = allTools.filter(t => t.status === 'Active' && t.slug !== tool.slug).slice(0, 20);
  const recentPosts = (await getPosts()).filter(p => p.status === 'Published').slice(0, 10);

  const detailedDescriptions: Record<string, { title: string; features: string[]; howTo: string[]; why: string; }> = {
    // Text Tools
    'case-converter': {
        title: '✨ About the Case Converter Tool',
        features: ['Sentence case: Automatically capitalizes the first letter of each sentence.', 'lowercase: Converts all characters to lowercase.', 'UPPERCASE: Transforms all characters to uppercase.', 'Title Case: Capitalizes the first letter of every word.', 'Real-time word and character count.'],
        howTo: ['Enter or paste text into the input area.', 'Click a conversion button (e.g., "Sentence Case").', 'Use the copy button to get the formatted text.'],
        why: 'Our Case Converter provides a clean, intuitive interface that ensures a seamless user experience. With its variety of conversion options, you can format your text exactly how you need it in seconds.'
    },
    'word-counter': {
        title: '✨ About the Word Counter Tool',
        features: ['Word Count: Instantly see the total number of words.', 'Character Count: Get the total character count, including and excluding spaces.', 'Sentence and Paragraph Count: Analyze the structure of your text.', 'Reading Time Estimation: Get an estimate of how long it will take to read your text.'],
        howTo: ['Paste your text into the text area.', 'The counts for words, characters, sentences, and paragraphs will update automatically as you type.'],
        why: 'Perfect for writers, students, and professionals who need to meet specific length requirements. It provides a quick and accurate analysis of your text, helping you refine your writing.'
    },
    'lorem-ipsum-generator': {
        title: '✨ About the Lorem Ipsum Generator',
        features: ['Generate by Paragraphs: Specify the number of paragraphs you need.', 'Generate by Words: Create text with a specific word count.', 'Generate by Bytes: Generate text of a certain byte size.', 'Standard Lorem Ipsum: Uses the standard placeholder text for realistic mockups.'],
        howTo: ['Choose the type of generation (paragraphs, words, etc.).', 'Enter the desired amount.', 'Click "Generate".', 'Copy the generated text for your design mockups or templates.'],
        why: 'A must-have for designers and developers. Quickly generate placeholder text to fill layouts and prototypes, allowing you to focus on the design without being distracted by meaningful content.'
    },
    'text-repeater': {
        title: '✨ About the Text Repeater Tool',
        features: ['Repeat Any Text: Enter any string to duplicate.', 'Set Repetition Count: Specify how many times the text should be repeated.', 'Add New Lines: Optionally add a line break after each repetition.', 'Instant Results: Get your repeated text immediately.', 'One-Click Copy: Easily copy the generated text.'],
        howTo: ['Enter the text to repeat.', 'Specify the repetition count.', 'Check "Add new line" if needed.', 'Click "Repeat Text".', 'Use the copy button to grab the result.'],
        why: 'Saves you manual effort and time. Whether for testing, data entry, or creative purposes, this tool handles bulk text generation effortlessly.'
    },
    'reverse-text': {
        title: '✨ About the Reverse Text Tool',
        features: ['Reverse Entire Text: Flips the entire block of text.', 'Reverse by Word: Reverses the order of words while keeping letters intact.', 'Reverse Each Word\'s Letters: Flips the letters of each word individually.', 'Simple Interface: Get your reversed text in one click.'],
        howTo: ['Paste the text you want to reverse.', 'Choose the reversal method (e.g., "Reverse Entire Text").', 'The result appears instantly, ready to be copied.'],
        why: 'A fun and useful tool for creating unique text effects, data scrambling, or just for creative text manipulation. It\'s fast, simple, and effective for various text reversal needs.'
    },
    'remove-extra-spaces': {
        title: '✨ About the Remove Extra Spaces Tool',
        features: ['Removes multiple spaces between words.', 'Deletes leading and trailing spaces.', 'Removes tab characters.', 'Option to also remove all line breaks to create a single line of text.'],
        howTo: ['Paste your text into the input area.', 'Click the "Remove Extra Spaces" button.', 'The cleaned-up text will be available for you to copy.'],
        why: 'Instantly clean up your text by removing unnecessary spaces, tabs, and line breaks. This tool is perfect for tidying up data copied from websites, PDFs, or other sources, ensuring clean and consistent formatting.'
    },
    'text-to-binary': {
        title: '✨ About the Text to Binary Converter',
        features: ['Accurate Conversion: Converts text characters to their 8-bit binary representation (ASCII/UTF-8).', 'Space Separated: Binary codes for each character are separated by spaces for readability.', 'Fast and Efficient: Handles large blocks of text quickly.'],
        howTo: ['Enter the text you wish to convert.', 'The tool will automatically convert it to binary code as you type.', 'Click the copy button to use the binary output.'],
        why: 'A handy tool for students, developers, and puzzle enthusiasts. Easily convert any text into binary code for educational purposes, data encoding, or creating coded messages.'
    },
    'binary-to-text': {
        title: '✨ About the Binary to Text Converter',
        features: ['Handles 8-bit binary codes.', 'Supports space-separated binary strings.', 'Automatic Conversion: Translates binary to human-readable text in real-time.', 'Error Handling: Ignores non-binary characters.'],
        howTo: ['Paste the binary code into the input area.', 'The corresponding text will appear in the output box automatically.', 'Copy the resulting text.'],
        why: 'Quickly decode binary messages or data back into plain text. This tool is the perfect companion to the Text to Binary converter, useful for data analysis, programming, and educational exercises.'
    },
    'find-and-replace': {
        title: '✨ About the Find and Replace Tool',
        features: ['Find Text: Quickly locate specific words or phrases.', 'Replace Text: Replace one or all occurrences of the found text.', 'Case Sensitive Option: Choose whether your search should be case-sensitive.', 'Efficient Processing: Handles large amounts of text with ease.'],
        howTo: ['Paste your text into the main text area.', 'Enter the text to find in the "Find" field.', 'Enter the replacement text in the "Replace" field.', 'Click "Replace All" to perform the operation.'],
        why: 'Save time on manual editing. This tool is essential for writers, editors, and programmers who need to make bulk changes to a document or code file quickly and accurately.'
    },
    'random-word-generator': {
        title: '✨ About the Random Word Generator',
        features: ['Generate Multiple Words: Specify the number of random words to generate.', 'Word Length Control: Set minimum and maximum length for the generated words.', 'Extensive Dictionary: Pulls from a large dictionary of English words.', 'Perfect for Games: Useful for Pictionary, charades, or creative writing prompts.'],
        howTo: ['Enter the number of words you want to generate.', 'Optionally, set the desired word length.', 'Click the "Generate" button.', 'A list of random words will be displayed.'],
        why: 'A versatile tool for creativity and games. Whether you need inspiration for a story, a random topic for an article, or words for a game, this generator provides them instantly.'
    },

    // Developer Tools
    'password-generator': {
        title: '✨ About the Password Generator',
        features: ['Customizable Length: Create passwords from 6 to 32 characters.', 'Character Type Selection: Include uppercase, lowercase, numbers, and symbols.', 'Secure Generation: Creates cryptographically strong random passwords.', 'One-Click Copy: Instantly copy the generated password.'],
        howTo: ['Adjust the slider to set your desired password length.', 'Check the boxes for the character types you want to include.', 'Click the refresh button to generate a new password.', 'Click the copy button to securely copy it.'],
        why: 'Enhance your online security by creating strong, unique passwords for all your accounts. Our tool makes it easy to generate complex passwords that are difficult to crack.'
    },
    'json-formatter': {
        title: '✨ About the JSON Formatter & Validator',
        features: ['Beautify/Format: Converts compact or messy JSON into a readable, indented format.', 'Validate: Instantly checks if your JSON is well-formed and valid.', 'Error Highlighting: Pinpoints syntax errors to help you debug quickly (feature in development).', 'Minify: Compacts JSON to save space.'],
        howTo: ['Paste your JSON data into the text area.', 'Click "Format JSON".', 'If the JSON is valid, it will be beautified. If not, an error will be shown.'],
        why: 'An essential tool for developers working with APIs. Quickly format, validate, and debug JSON data to ensure it\'s correct and easy to read, saving you valuable development time.'
    },
    'html-minifier': {
        title: '✨ About the HTML Minifier',
        features: ['Removes unnecessary whitespace, comments, and line breaks.', 'Reduces file size significantly.', 'Improves website loading speed.', 'Option to keep or remove certain elements.'],
        howTo: ['Paste your HTML code into the input box.', 'Click the "Minify HTML" button.', 'Copy the optimized code from the output box.'],
        why: 'Optimize your website for better performance. Minifying HTML reduces the amount of data that needs to be transferred, resulting in faster page loads and a better user experience.'
    },
    'css-minifier': {
        title: '✨ About the CSS Minifier',
        features: ['Removes comments, whitespace, and unnecessary characters.', 'Optimizes CSS for production environments.', 'Reduces CSS file size for faster load times.', 'Helps improve your site\'s performance metrics.'],
        howTo: ['Paste your CSS code into the input area.', 'Click "Minify CSS".', 'Copy the minified stylesheet for use in your project.'],
        why: 'Speed up your website by reducing the size of your CSS files. Minified CSS is downloaded and parsed faster by browsers, leading to a snappier, more responsive website.'
    },
    'javascript-minifier': {
        title: '✨ About the JavaScript Minifier',
        features: ['Removes whitespace, comments, and shortens variable names.', 'Reduces script file size for quicker downloads.', 'Improves script execution time.', 'Essential for production deployment.'],
        howTo: ['Paste your JavaScript code into the tool.', 'Click the "Minify JS" button.', 'The optimized, production-ready code will be generated.'],
        why: 'A crucial step in web development. Minifying your JavaScript files can drastically improve your site\'s loading and execution speed, which is vital for user retention and SEO.'
    },
    'url-encoder-decoder': {
        title: '✨ About the URL Encoder/Decoder',
        features: ['URL Encoding: Converts special characters into a format that can be transmitted over the internet (%-encoding).', 'URL Decoding: Translates encoded URLs back into their original, human-readable form.', 'Handles a wide range of characters.', 'Two-way conversion.'],
        howTo: ['Enter a string or URL into the text area.', 'Click "Encode" to convert it for URL use, or "Decode" to revert an encoded string.', 'Copy the result.'],
        why: 'Easily encode and decode strings for use in URLs. This is essential for passing data in query parameters and ensuring that your URLs are valid and work correctly across all browsers.'
    },
    'base64-encoder-decoder': {
        title: '✨ About the Base64 Encoder/Decoder',
        features: ['Encode to Base64: Convert any text or data into a Base64 string.', 'Decode from Base64: Convert a Base64 string back to its original data.', 'UTF-8 Support: Works with a wide range of characters.', 'Ideal for data URIs and simple data transmission.'],
        howTo: ['Paste your text or Base64 string into the input field.', 'Click "Encode" or "Decode" to perform the respective action.', 'The result will appear in the output field.'],
        why: 'A standard tool for web developers. Base64 is commonly used to embed binary data (like images) directly into code (like HTML or CSS) or to transmit data that might otherwise be corrupted.'
    },
    'unix-timestamp-converter': {
        title: '✨ About the Unix Timestamp Converter',
        features: ['Timestamp to Date: Convert a Unix timestamp (seconds since epoch) to a human-readable date.', 'Date to Timestamp: Convert a specific date and time into a Unix timestamp.', 'Supports milliseconds.', 'Real-time conversion.'],
        howTo: ['Enter a timestamp to see the human-readable date.', 'Or, use the date picker to select a date and get the corresponding timestamp.'],
        why: 'An indispensable tool for developers working with time-based data. Quickly convert between machine-readable timestamps and human-readable dates for debugging, data analysis, and logging.'
    },
    'uuid-generator': {
        title: '✨ About the UUID Generator',
        features: ['Generate UUIDs: Create universally unique identifiers.', 'Version 4 Support: Generates random v4 UUIDs.', 'Bulk Generation: Create multiple UUIDs at once.', 'One-Click Copy: Easily copy generated UUIDs to your clipboard.'],
        howTo: ['Specify the number of UUIDs you want to generate.', 'Click the "Generate" button.', 'The list of unique identifiers will be displayed.'],
        why: 'Perfect for developers who need unique IDs for database keys, session identifiers, or any other purpose. Avoids collisions and ensures every item has a distinct identifier.'
    },
    'sql-formatter': {
        title: '✨ About the SQL Formatter',
        features: ['Beautify SQL: Formats complex queries into a readable, indented structure.', 'Supports various SQL dialects (MySQL, PostgreSQL, etc.).', 'Customizable formatting options (indentation, keyword casing).', 'Helps in understanding and debugging long queries.'],
        howTo: ['Paste your messy or unformatted SQL query.', 'Select your SQL dialect and formatting preferences.', 'Click "Format SQL".', 'Copy the clean, beautifully formatted query.'],
        why: 'Improve the readability and maintainability of your SQL code. A well-formatted query is easier to debug, review, and share with team members.'
    },

    // AI Tools
    'prompt-generator': {
        title: '✨ About the Prompt Generator',
        features: ['Topic-Based Generation: Provide a topic and get a structured, creative prompt.', 'Multiple Styles: Generate prompts for different needs (e.g., creative writing, technical questions, brainstorming).', 'Customizable Detail Level: Get simple or highly detailed and constrained prompts.', 'One-Click Copy: Easily copy the generated prompt to use in other AI tools.'],
        howTo: ['Enter your main topic or keyword (e.g., "space exploration", "healthy breakfast ideas").', 'Choose the desired style or complexity.', 'Click "Generate Prompt".', 'Use the generated prompt with AI image generators, writers, or chatbots.'],
        why: 'Unlock the full potential of your AI tools. A well-crafted prompt is the key to getting high-quality results. This tool helps you create detailed and effective prompts, saving you time and improving your AI-generated content.'
    },
    'ai-blog-post-writer': {
        title: '✨ About the AI Blog Post Writer',
        features: ['Topic-Based Generation: Provide a topic and get a full blog post.', 'Keyword Integration: Suggest keywords for better SEO focus.', 'Multiple Tones: Choose from various writing styles (professional, casual, etc.).', 'Structured Output: Generates titles, intros, body, and conclusions.'],
        howTo: ['Enter the main topic or title for your blog post.', 'Optionally, provide keywords to include.', 'Select a tone of voice.', 'Click "Generate Post" and let the AI do the writing.'],
        why: 'Overcome writer\'s block and generate high-quality content in minutes. This tool is perfect for bloggers, marketers, and businesses looking to scale their content creation efforts.'
    },
    'ai-image-generator': {
        title: '✨ About the AI Image Generator',
        features: ['Text-to-Image: Create stunning, unique images from text descriptions.', 'Multiple Styles: Generate images in various artistic styles (photorealistic, cartoon, etc.).', 'High-Resolution Output: Download high-quality images for your projects.', 'Fast Generation: Get your images in seconds.'],
        howTo: ['Write a descriptive prompt of the image you want to create (e.g., "An astronaut riding a horse on the moon, photorealistic").', 'Select an art style.', 'Click "Generate Image".'],
        why: 'Unleash your creativity and generate custom visuals for any need. Perfect for marketing materials, blog posts, social media, or just for fun, without needing any artistic skills.'
    },
    'ai-email-composer': {
        title: '✨ About the AI Email Composer',
        features: ['Purpose-Driven: Generates emails based on your goals (e.g., sales, inquiry, follow-up).', 'Tone Adjustment: Tailor the email\'s tone to be formal, friendly, or persuasive.', 'Key Point Inclusion: Provide bullet points and let the AI craft a professional email around them.', 'Subject Line Suggestions: Get catchy and effective subject lines.'],
        howTo: ['Enter the purpose or key points of your email.', 'Choose the desired tone.', 'Click "Compose Email".', 'The AI will generate a professional email body and subject, ready to be sent.'],
        why: 'Save time and write more effective emails. Our AI helps you craft clear, concise, and professional messages for any situation, improving your communication and response rates.'
    },
    'ai-chatbot': {
        title: '✨ About the AI Chatbot',
        features: ['Natural Conversation: Engage in human-like conversations on any topic.', 'Knowledge Base: Trained on a vast amount of information to answer questions.', 'Creative Partner: Helps with brainstorming, writing, and problem-solving.', 'Context-Aware: Remembers previous parts of the conversation.'],
        howTo: ['Simply type your question or message in the chat box.', 'Press Enter to send.', 'Continue the conversation with the AI assistant.'],
        why: 'Your personal AI assistant, available 24/7. Get instant answers, brainstorm ideas, practice a new language, or just have a fun conversation. It\'s a powerful tool for learning and creativity.'
    },
    'text-to-speech': {
        title: '✨ About the Text to Speech Tool',
        features: ['Natural Voices: Convert text into lifelike speech.', 'Multiple Languages & Accents: Choose from a wide variety of voices.', 'Adjustable Speed & Pitch: Customize the audio output.', 'Downloadable Audio: Save the generated speech as an MP3 file.'],
        howTo: ['Paste the text you want to convert.', 'Select a voice and adjust the settings.', 'Click "Generate Audio".', 'Listen to the preview and download the audio file.'],
        why: 'Make your content more accessible and engaging. Create voiceovers for videos, listen to articles on the go, or provide audio options for your users with our high-quality text-to-speech engine.'
    },
    'ai-content-summarizer': {
        title: '✨ About the AI Content Summarizer',
        features: ['Summarize Long Texts: Condense articles, reports, or documents into key points.', 'Adjustable Length: Choose between a short summary or a more detailed one.', 'URL Support: Paste a URL to summarize an article directly from the web.', 'Extraction or Abstraction: Get key sentences or a newly generated summary.'],
        howTo: ['Paste the text or the URL of the article you want to summarize.', 'Select the desired summary length.', 'Click "Summarize".', 'Get the concise summary in seconds.'],
        why: 'Quickly understand the main points of long documents. This tool is perfect for students, researchers, and busy professionals who need to digest a lot of information efficiently.'
    },
    'ai-story-generator': {
        title: '✨ About the AI Story Generator',
        features: ['Genre Selection: Choose from genres like fantasy, sci-fi, mystery, and more.', 'Character & Plot Prompts: Provide a simple prompt to guide the story.', 'Creative & Unpredictable: Generates unique and imaginative story narratives.', 'Continue Story: Let the AI continue a story you\'ve already started.'],
        howTo: ['Enter a simple prompt, like "A detective finds a mysterious clock".', 'Choose a genre and story length.', 'Click "Generate Story".', 'The AI will craft a unique narrative based on your input.'],
        why: 'Kickstart your creative writing process. This tool helps you overcome writer\'s block by providing instant story ideas and fully-fledged narratives, making it a great partner for authors and hobbyists.'
    },
    'ai-tweet-generator': {
        title: '✨ About the AI Tweet Generator',
        features: ['Topic-Based: Generate tweets based on a topic or keyword.', 'Hashtag Suggestions: Get relevant and trending hashtags.', 'Multiple Variations: Generate several tweet options to choose from.', 'Tone of Voice: Create tweets that are witty, professional, or informative.'],
        howTo: ['Enter your topic or the main message of your tweet.', 'Select a tone.', 'Click "Generate Tweets".', 'Choose your favorite from the generated options and post it.'],
        why: 'Boost your social media presence. Effortlessly create engaging, relevant, and timely tweets that capture attention and drive engagement on X (formerly Twitter).'
    },
    'ai-product-description-writer': {
        title: '✨ About the AI Product Description Writer',
        features: ['Feature-to-Benefit Conversion: Turns product features into compelling benefits.', 'Target Audience Tone: Adjusts the writing style for your specific customer base.', 'SEO-Friendly: Incorporates keywords naturally.', 'Generates multiple unique descriptions.'],
        howTo: ['Enter your product name and key features.', 'Describe your target audience.', 'Provide any keywords you want to include.', 'Click "Generate Descriptions" to get persuasive copy.'],
        why: 'Sell more products with better copy. This AI tool crafts persuasive, SEO-optimized product descriptions that highlight benefits and convert browsers into buyers for your e-commerce store.'
    },
    'ai-code-assistant': {
        title: '✨ About the AI Code Assistant',
        features: ['Generate Code: Describe what you want in plain English and get code snippets.', 'Explain Code: Paste code to get a detailed explanation of what it does.', 'Debug Code: Describe an error and get suggestions on how to fix it.', 'Multi-Language Support: Works with Python, JavaScript, Java, and more.'],
        howTo: ['Select a language and an action (Generate, Explain, Debug).', 'Provide your code or description.', 'Click "Execute" and let the AI assist you.'],
        why: 'Your personal coding pair programmer. Speed up your development workflow, learn new languages, and debug complex problems faster with an AI that understands code.'
    },

    // PDF Tools
    'pdf-merger': {
        title: '✨ About the PDF Merger Tool',
        features: ['Combine Multiple PDFs: Merge two or more PDF files into one.', 'Drag-and-Drop Reordering: Easily arrange the files in your desired order before merging.', 'Secure Processing: Files are processed securely and deleted after a short period.', 'No Quality Loss: Maintains the original quality of your documents.'],
        howTo: ['Upload the PDF files you want to merge.', 'Drag and drop the files to set their order.', 'Click the "Merge PDFs" button.', 'Download your single, combined PDF file.'],
        why: 'Easily organize your documents. Combine reports, invoices, or presentations into a single, easy-to-share PDF file without needing expensive software.'
    },
    'pdf-to-word': {
        title: '✨ About the PDF to Word Converter',
        features: ['High-Fidelity Conversion: Preserves original layout, images, and text formatting.', 'Editable Output: Get a fully editable .docx file.', 'OCR for Scanned PDFs: Converts scanned PDFs into editable text (Pro feature).', 'Fast and Secure: Your files are converted quickly and are kept private.'],
        howTo: ['Upload your PDF file.', 'The conversion will start automatically.', 'Download the editable Word document once it\'s ready.'],
        why: 'Stop retyping documents. This tool lets you convert any PDF into an editable Microsoft Word file, saving you hours of manual work and ensuring formatting is kept intact.'
    },
    'pdf-splitter': {
        title: '✨ About the PDF Splitter Tool',
        features: ['Split by Page Ranges: Extract specific page ranges (e.g., 2-5, 8).', 'Extract All Pages: Convert each page of the PDF into a separate PDF file.', 'Visual Page Selector: Click on the pages you want to extract.', 'Secure and Fast: Split your PDFs in seconds in a secure environment.'],
        howTo: ['Upload the PDF you want to split.', 'Choose your split method (e.g., "Extract pages").', 'Select the pages or enter the page numbers.', 'Click "Split PDF" and download your new file(s).'],
        why: 'Get just the pages you need. Easily extract specific pages or split a large PDF into smaller, more manageable files for sharing or archiving.'
    },
    'compress-pdf': {
        title: '✨ About the Compress PDF Tool',
        features: ['High Compression: Significantly reduce PDF file size.', 'Quality Control: Choose between basic and strong compression levels.', 'Batch Processing: Compress multiple files at once.', 'Maintains Readability: Balances file size and quality for optimal results.'],
        howTo: ['Upload the PDF file you want to compress.', 'Select your desired compression level.', 'Click "Compress PDF".', 'Download the optimized, smaller PDF file.'],
        why: 'Make your PDFs easier to email and share. Our tool reduces file size without a major loss in quality, making storage and transmission of your documents much more efficient.'
    },
    'pdf-to-jpg': {
        title: '✨ About the PDF to JPG Converter',
        features: ['High-Quality Conversion: Convert PDF pages to high-resolution JPG images.', 'Extract All Pages or Select Pages: Choose to convert the entire document or only specific pages.', 'Zip Download: All generated JPGs are bundled into a convenient zip file.', 'Fast and Free: Quickly convert your documents.'],
        howTo: ['Upload your PDF.', 'Select the pages you want to convert (or all pages).', 'Click "Convert to JPG".', 'Download the zip file containing your images.'],
        why: 'Easily turn your PDF pages into images. This is perfect for sharing document previews on social media, in presentations, or on websites where images are preferred.'
    },
    'word-to-pdf': {
        title: '✨ About the Word to PDF Converter',
        features: ['Accurate Conversion: Preserves fonts, images, and formatting of your .docx file.', 'Universal Compatibility: Create a PDF that looks the same on any device.', 'Secure and Reliable: Your original file is protected.', 'Simple Drag-and-Drop Interface.'],
        howTo: ['Upload or drag and drop your Microsoft Word (.docx) file.', 'The conversion process will begin instantly.', 'Download your newly created PDF.'],
        why: 'Create professional, shareable PDFs from your Word documents. Converting to PDF ensures your formatting is locked and the document is viewable by anyone, regardless of their software.'
    },
    'excel-to-pdf': {
        title: '✨ About the Excel to PDF Converter',
        features: ['Preserves Formatting: Converts spreadsheets while maintaining tables, charts, and cell formatting.', 'Page Orientation: Choose between portrait and landscape orientation.', 'Fit to Page: Option to scale the worksheet to fit on a single PDF page.', 'High-Quality Output: Creates a professional-looking PDF.'],
        howTo: ['Upload your Microsoft Excel (.xlsx) file.', 'Adjust orientation and scaling options as needed.', 'Click "Convert to PDF".', 'Download your perfectly formatted PDF.'],
        why: 'Share your spreadsheets in a clean, professional, and uneditable format. Ideal for reports, invoices, and data summaries that need to be presented clearly and consistently.'
    },
    'ppt-to-pdf': {
        title: '✨ About the PPT to PDF Converter',
        features: ['High-Fidelity Conversion: Retains the design, layout, and formatting of your PowerPoint slides.', 'Easy Sharing: PDFs are easier to share and view than .pptx files.', 'Print-Ready: Creates a document that is perfect for printing.', 'Fast and Simple: Convert your presentations in a single click.'],
        howTo: ['Upload your PowerPoint (.pptx) presentation.', 'The conversion will happen automatically in the background.', 'Download your presentation as a high-quality PDF.'],
        why: 'Make your presentations universally accessible. Converting a PowerPoint to PDF ensures that anyone can view it exactly as you designed it, without needing Microsoft Office.'
    },
    'rotate-pdf': {
        title: '✨ About the Rotate PDF Tool',
        features: ['Rotate Single or All Pages: Apply rotation to specific pages or the entire document.', '90, 180, 270 Degrees: Rotate left, right, or upside down.', 'Permanent Change: The rotation is saved directly into the PDF file.', 'Visual Interface: See a preview of your pages as you work.'],
        howTo: ['Upload your PDF file.', 'Hover over a page and click the rotate icons to turn it.', 'Apply changes to all pages if needed.', 'Click "Save Changes" to download the rotated PDF.'],
        why: 'Quickly fix incorrectly scanned documents or change the orientation of your PDF pages. Our tool makes it simple to adjust your PDF to the correct viewing angle permanently.'
    },
    'add-watermark-to-pdf': {
        title: '✨ About the Add Watermark Tool',
        features: ['Text and Image Watermarks: Add your name, logo, or a status like "Confidential".', 'Customizable Appearance: Control the transparency, rotation, and position of your watermark.', 'Apply to All Pages: Easily add the watermark to every page of the document.', 'Secure Processing: Your files are safe with us.'],
        howTo: ['Upload your PDF.', 'Choose to add a text or image watermark.', 'Customize the watermark\'s text, font, size, rotation, and opacity.', 'Position the watermark on the page preview.', 'Click "Add Watermark" to process and download the file.'],
        why: 'Protect your documents and assert ownership. Adding a watermark is a great way to brand your work, mark it as a draft, or label it as confidential before sharing.'
    },

    // Image Tools
    'color-picker': {
        title: '✨ About the Color Picker Tool',
        features: ['Interactive Color Wheel: Visually select any color.', 'HEX, RGB, HSL Values: Get the color codes in multiple formats.', 'Eyedropper Tool: Pick a color from anywhere on your screen (browser dependent).', 'One-Click Copy: Instantly copy any color value.'],
        howTo: ['Use the color wheel to select a color.', 'Or, use the eyedropper tool to pick a color from an image or your screen.', 'The HEX, RGB, and HSL values will be displayed, ready to be copied.'],
        why: 'An essential tool for designers and developers. Quickly find and get the exact color codes you need for your web design, graphic design, or digital art projects.'
    },
    'image-resizer': {
        title: '✨ About the Image Resizer Tool',
        features: ['Resize by Pixels or Percentage: Scale your images with precision.', 'Maintain Aspect Ratio: Option to lock the aspect ratio to avoid distortion.', 'Multiple Image Support: Resize several images at once.', 'Supports JPG, PNG, WEBP formats.'],
        howTo: ['Upload one or more images.', 'Enter the new dimensions (in pixels or percentage).', 'Choose whether to maintain the aspect ratio.', 'Click "Resize Images" and download your resized files.'],
        why: 'Quickly resize images for your website, social media, or email newsletters. Properly sized images load faster and fit perfectly in your layouts.'
    },
    'image-compressor': {
        title: '✨ About the Image Compressor',
        features: ['Significant Size Reduction: Make your image files smaller.', 'Quality Control: Adjust the compression level to balance size and quality.', 'Supports JPG & PNG: Optimize the most common web image formats.', 'Batch Processing: Compress multiple images simultaneously.'],
        howTo: ['Upload the images you want to compress.', 'Use the slider to set the desired quality/compression level.', 'Click "Compress".', 'Download your optimized images, individually or as a zip file.'],
        why: 'Improve your website\'s performance by reducing image file sizes. Compressed images load much faster, leading to a better user experience and improved SEO rankings.'
    },
    'png-to-jpg': {
        title: '✨ About the PNG to JPG Converter',
        features: ['Fast Conversion: Quickly convert your PNG files to the widely supported JPG format.', 'Adjustable Quality: Control the compression level of the output JPG.', 'Handles Transparency: Automatically fills transparent backgrounds with a color of your choice (e.g., white).', 'Bulk Conversion: Convert multiple PNGs at once.'],
        howTo: ['Upload your PNG image(s).', 'Set the desired JPG quality.', 'Click "Convert".', 'Download your new JPG file(s).'],
        why: 'Reduce the file size of your images. JPGs are generally smaller than PNGs, making them a better choice for photographs and complex images on the web.'
    },
    'jpg-to-png': {
        title: '✨ About the JPG to PNG Converter',
        features: ['High-Quality Conversion: Convert JPGs to PNG format.', 'Transparency Support: Option to make a specific color transparent, ideal for creating logos with transparent backgrounds.', 'Lossless Format: PNG is a lossless format, which can be better for graphics with sharp lines.', 'Simple and Fast: Convert your images in seconds.'],
        howTo: ['Upload your JPG image.', 'Optionally, select a color to make transparent.', 'Click "Convert to PNG".', 'Download your new PNG image.'],
        why: 'Convert your images to a format that supports transparency. This is perfect for logos, icons, and other graphics that need to be placed over different backgrounds.'
    },
    'image-to-base64': {
        title: '✨ About the Image to Base64 Encoder',
        features: ['Embed Images in Code: Generates a Base64 string that can be used directly in HTML or CSS.', 'Reduces HTTP Requests: Embedding images can speed up initial page load by reducing the number of server requests.', 'Supports various image types (JPG, PNG, GIF).', 'Generates Data URI: Creates a ready-to-use Data URI (e.g., `data:image/png;base64,...`).'],
        howTo: ['Upload your image file.', 'The tool will instantly generate the Base64 Data URI.', 'Click the copy button to copy the entire string.'],
        why: 'A developer-focused tool for optimizing web performance. Embedding small images as Base64 strings can reduce latency and make your website load faster, especially for mobile users.'
    },
    'flip-image': {
        title: '✨ About the Flip Image Tool',
        features: ['Flip Horizontally: Mirror your image along the vertical axis.', 'Flip Vertically: Mirror your image along the horizontal axis.', 'Instant Preview: See the result before you download.', 'Supports JPG, PNG, and other common formats.'],
        howTo: ['Upload your image.', 'Click "Flip Horizontal" or "Flip Vertical".', 'The flipped image will be displayed.', 'Download your modified image.'],
        why: 'A simple but powerful tool for creative effects or correcting image orientation. Quickly mirror your images with a single click.'
    },
    'image-cropper': {
        title: '✨ About the Image Cropper Tool',
        features: ['Freeform Cropping: Drag the handles to crop to any size.', 'Aspect Ratio Presets: Crop your image to standard aspect ratios (e.g., 16:9, 1:1, 4:3).', 'Visual and Intuitive: Easy-to-use cropping interface.', 'High-Quality Output: The cropped image maintains its original quality.'],
        howTo: ['Upload your image.', 'A cropping box will appear. Drag the corners and edges to adjust it.', 'Alternatively, select a predefined aspect ratio.', 'Click "Crop Image" to download the result.'],
        why: 'Frame your images perfectly. The Image Cropper allows you to remove unwanted parts of an image and focus on the subject, making it ideal for profile pictures, thumbnails, and banners.'
    },
    'ico-converter': {
        title: '✨ About the ICO Converter',
        features: ['Create Favicons: Convert any image (JPG, PNG) into a favicon.ico file.', 'Multiple Sizes: Generates an ICO file containing multiple standard sizes (16x16, 32x32, 48x48).', 'Browser Compatibility: Creates favicons that work across all modern browsers.', 'Simple Upload Process.'],
        howTo: ['Upload your source image (preferably a square PNG).', 'Click "Convert to ICO".', 'Download the generated favicon.ico file.', 'Upload it to the root directory of your website.'],
        why: 'A must-have for any website owner. A favicon is the small icon that appears in browser tabs, and this tool makes it incredibly easy to create one from your existing logo or graphic.'
    },

    // SEO Tools
    'meta-tag-generator': {
        title: '✨ About the Meta Tag Generator',
        features: ['Generate Title & Description: Create SEO-friendly title and meta description tags.', 'Character Count: Shows real-time character counts to stay within optimal lengths.', 'SERP Preview: See how your meta tags will look on a Google search results page.', 'Easy to copy HTML code.'],
        howTo: ['Enter your desired Site Title and Meta Description.', 'The SERP preview will update in real-time.', 'Copy the generated HTML code and paste it into the `<head>` section of your website.'],
        why: 'Improve your website\'s click-through rate from search engines. Well-crafted meta tags are crucial for attracting users and provide context to search engines about your page content.'
    },
    'robots-txt-generator': {
        title: '✨ About the Robots.txt Generator',
        features: ['Default Rules: Start with default allow/disallow rules.', 'Custom Rules: Add custom rules for specific user-agents (bots) and directories.', 'Sitemap Link: Easily include a link to your XML sitemap.', 'Generates a ready-to-use robots.txt file.'],
        howTo: ['Start with the default rules provided.', 'Add new rules to allow or disallow specific bots from crawling parts of your site.', 'Enter the URL to your sitemap.', 'Copy the generated text and save it as `robots.txt` in your site\'s root directory.'],
        why: 'Control how search engines crawl and index your website. A properly configured robots.txt file can prevent duplicate content issues and ensure that bots are spending their "crawl budget" on your most important pages.'
    },
    'xml-sitemap-generator': {
        title: '✨ About the XML Sitemap Generator',
        features: ['Crawl Website: Enter your website\'s URL to start crawling.', 'Set Priorities and Frequencies: Optionally guide search engines on the importance and update frequency of pages.', 'Generates Compliant XML: Creates a sitemap that follows standard protocols.', 'Handles large websites.'],
        howTo: ['Enter the full URL of your website.', 'Click "Generate Sitemap".', 'The tool will crawl your site and generate an XML sitemap.', 'Download the sitemap.xml file and upload it to your website\'s root directory.'],
        why: 'Help search engines discover and index all the pages on your website. An XML sitemap is particularly important for large sites, new sites, or sites with complex structures.'
    },
    'keyword-density-checker': {
        title: '✨ About the Keyword Density Checker',
        features: ['Analyze Text: Paste your content to analyze keyword frequencies.', 'Shows 1, 2, and 3-word keyword densities.', 'Data Visualization: Displays results in a clear table.', 'Helps avoid keyword stuffing while ensuring target keywords are present.'],
        howTo: ['Paste the text content of your webpage into the text area.', 'Click "Check Density".', 'The tool will display tables showing the frequency and density of your most used keywords.'],
        why: 'Optimize your content for target keywords. This tool helps you understand if you are using your main keywords appropriately, without over-optimizing, which can be penalized by search engines.'
    },
    'serp-checker': {
        title: '✨ About the SERP Checker',
        features: ['Check Rankings: Enter a keyword and domain to check its ranking.', 'Location-Specific: Choose a country to see localized search results.', 'Device-Specific: Check rankings on both mobile and desktop.', 'See Top 100 Results: Scrapes and displays the top 100 search results for a given query.'],
        howTo: ['Enter the keyword you want to check.', 'Enter your domain name.', 'Select the desired country and device.', 'Click "Check SERP".'],
        why: 'Track your SEO performance and spy on competitors. Understanding where you rank for important keywords is fundamental to any SEO strategy.'
    },
    'redirect-checker': {
        title: '✨ About the Redirect Checker',
        features: ['Trace Redirect Chains: Follow a URL through multiple redirects (301, 302, etc.).', 'View HTTP Status Codes: See the status code for each step in the chain.', 'Identify Redirect Loops: Detect problematic redirect loops that can harm SEO.', 'Analyze multiple URLs at once.'],
        howTo: ['Enter one or more URLs into the text area (one per line).', 'Click "Check Redirects".', 'The tool will display the full redirect path and final status code for each URL.'],
        why: 'Diagnose technical SEO issues. Redirects are common, but incorrect implementation, long chains, or loops can negatively impact user experience and search engine rankings. This tool helps you find and fix them.'
    },
    'website-word-counter': {
        title: '✨ About the Website Word Counter',
        features: ['Count Words on Live Page: Enter any URL to get the total word count.', 'Fast Analysis: Quickly fetches and analyzes the content of a webpage.', 'Ignores Boilerplate: Intelligently tries to count only the main content of the page.', 'Useful for Competitor Analysis.'],
        howTo: ['Enter the full URL of the webpage you want to analyze.', 'Click "Count Words".', 'The tool will display the total word count of the page\'s main text content.'],
        why: 'A valuable tool for content strategists and SEOs. Quickly analyze the content length of competitor pages to understand what it takes to rank, or audit your own pages for thin content.'
    },
    'title-tag-checker': {
        title: '✨ About the Title Tag Checker',
        features: ['Length Analysis: Checks if your title tag is within the optimal pixel and character length for Google.', 'SERP Preview: Shows how your title will likely appear in search results.', 'Real-time feedback as you type.', 'Easy to use.'],
        howTo: ['Enter your proposed title tag into the input field.', 'The tool will instantly show you a preview and warn you if it\'s too long.'],
        why: 'Optimize one of the most important on-page SEO factors. A well-written and properly sized title tag can significantly improve your click-through rate from search results.'
    },
    'favicon-checker': {
        title: '✨ About the Favicon Checker',
        features: ['Checks for Favicon: Enter your website URL to see if a favicon is detected.', 'Displays Preview: Shows a preview of the found favicon.', 'Checks Multiple Paths: Looks for `favicon.ico` in the root and in the HTML head.', 'Provides Implementation Tips.'],
        howTo: ['Enter your website\'s URL.', 'Click "Check Favicon".', 'The tool will report if a favicon was found and display it.'],
        why: 'Ensure your website looks professional in browser tabs and bookmarks. A favicon is a small but important part of your site\'s branding and user experience.'
    },
    'schema-generator': {
        title: '✨ About the Schema Generator',
        features: ['Multiple Schema Types: Create schema for Articles, FAQs, Events, Products, and more.', 'Form-Based: Fill out a simple form to generate the JSON-LD schema markup.', 'Error-Free Code: Generates valid and compliant structured data.', 'Copy-and-Paste: Easily copy the generated script to your website.'],
        howTo: ['Select the type of schema you want to create (e.g., "FAQ Page").', 'Fill in the corresponding form fields.', 'The JSON-LD code will be generated automatically.', 'Copy the code and paste it into the `<head>` or `<body>` of your page.'],
        why: 'Enhance your search engine listings with rich snippets. Correctly implemented schema can help you get star ratings, FAQ dropdowns, and other eye-catching features in search results, boosting visibility and clicks.'
    },

    // Calculators & Converters
    'bmi-calculator': {
        title: '✨ About the BMI Calculator',
        features: ['Metric and Imperial Units: Use either cm/kg or ft/in/lbs.', 'Clear Results: Instantly see your BMI value.', 'BMI Categories: Understand what your BMI means with standard categories (Underweight, Normal, Overweight).', 'Simple and Fast: No unnecessary steps.'],
        howTo: ['Select your preferred unit system.', 'Enter your height and weight.', 'Click "Calculate BMI".', 'Your BMI and corresponding category will be displayed.'],
        why: 'A quick and easy tool to check your Body Mass Index. It provides a general indicator of whether your weight is healthy for your height, based on WHO standards.'
    },
    'unit-converter': {
        title: '✨ About the Unit Converter',
        features: ['Multiple Categories: Convert length, mass, temperature, volume, and more.', 'Extensive Unit Selection: Includes a wide range of common metric and imperial units.', 'Real-time Conversion: Results update as you type.', 'Swap Units: Easily swap the "from" and "to" units with one click.'],
        howTo: ['Select the conversion category (e.g., "Length").', 'Choose the "from" and "to" units.', 'Enter the value you want to convert.', 'The converted value will appear instantly.'],
        why: 'A versatile and comprehensive tool for all your conversion needs. Whether for school, work, or daily life, get accurate conversions between various units in an instant.'
    },
    'age-calculator': {
        title: '✨ About the Age Calculator',
        features: ['Calculate Age from Birthdate: Enter your date of birth to find your exact age.', 'Detailed Results: Shows your age in years, months, and days.', 'Calculates Time Until Next Birthday.', 'Easy-to-use date picker.'],
        howTo: ['Select your date of birth using the calendar.', 'Your age and other details will be calculated and displayed automatically.'],
        why: 'Find out your exact age down to the day, or calculate the age of anyone else. It\'s a fun and simple tool for birthdays, anniversaries, and planning.'
    },
    'percentage-calculator': {
        title: '✨ About the Percentage Calculator',
        features: ['Multiple Functions: Calculate "what is X% of Y?", "X is what percent of Y?", and percentage increase/decrease.', 'Simple Inputs: Clear input fields for each calculation type.', 'Instant Answers: Get results immediately after entering values.', 'Practical for everyday use.'],
        howTo: ['Choose the type of percentage calculation you need.', 'Enter your numbers into the respective fields.', 'The result is calculated and displayed automatically.'],
        why: 'Take the guesswork out of percentages. This tool is perfect for calculating discounts, tips, taxes, and other common percentage-based problems quickly and accurately.'
    },
    'discount-calculator': {
        title: '✨ About the Discount Calculator',
        features: ['Calculate Savings: See exactly how much money you save.', 'Final Price: Instantly get the final price after the discount is applied.', 'Simple and Clear: Just enter the original price and the discount percentage.', 'Helpful for shoppers.'],
        howTo: ['Enter the original price of the item.', 'Enter the discount percentage.', 'The tool will show you the final price and the amount you saved.'],
        why: 'An essential tool for savvy shoppers. Quickly calculate the final price of an item during a sale to see if it\'s a good deal and to manage your budget.'
    },
    'loan-calculator': {
        title: '✨ About the Loan Calculator',
        features: ['Calculate Monthly Payments: Estimate your monthly loan repayments (principal + interest).', 'Amortization Schedule: See a breakdown of how your payments are applied over time (Pro feature).', 'Total Interest Paid: Understand the total cost of borrowing.', 'Adjust loan amount, interest rate, and term.'],
        howTo: ['Enter the total loan amount.', 'Enter the annual interest rate.', 'Enter the loan term in years or months.', 'The calculator will show your estimated monthly payment and total interest.'],
        why: 'Make informed financial decisions. Before taking out a loan for a car, home, or personal expense, use this tool to understand the true cost and see how different terms can affect your payments.'
    },
    'time-zone-converter': {
        title: '✨ About the Time Zone Converter',
        features: ['Multiple Time Zones: Compare the time in several cities or time zones at once.', 'Searchable Locations: Easily find the cities you need.', 'Interactive Slider: Drag a slider to see how the time changes across all selected zones.', 'Daylight Saving Aware.'],
        howTo: ['Add the cities or time zones you want to compare.', 'Use the time slider to adjust the time for one location.', 'The times for all other locations will update automatically.'],
        why: 'An indispensable tool for global teams, international travelers, and anyone scheduling meetings across different time zones. Eliminate confusion and schedule with confidence.'
    },
    'gpa-calculator': {
        title: '✨ About the GPA Calculator',
        features: ['Customizable Grading Scale: Works with different grading systems (A=4.0, A+=4.3, etc.).', 'Add Multiple Courses: Enter the grade and credits for each of your courses.', 'Calculates Unweighted GPA: Provides your Grade Point Average on a standard scale.', 'Simple and clear interface.'],
        howTo: ['Enter your course names, their credit hours, and the grade you received.', 'Add as many courses as you need.', 'The calculator will display your total credits and calculated GPA automatically.'],
        why: 'A must-have for students. Keep track of your academic performance, see how new grades will affect your overall GPA, and set goals for the semester.'
    },
    'fuel-cost-calculator': {
        title: '✨ About the Fuel Cost Calculator',
        features: ['Trip Cost Estimation: Calculate the total fuel cost for a journey.', 'Uses Key Metrics: Based on trip distance, your vehicle\'s fuel efficiency, and the price of fuel.', 'Metric and Imperial Units: Works with liters/100km or miles per gallon (MPG).', 'Plan your travel budget.'],
        howTo: ['Enter the distance of your trip.', 'Enter your car\'s average fuel consumption.', 'Enter the current price of fuel per liter or gallon.', 'The tool will estimate the total fuel cost for your trip.'],
        why: 'Budget your road trips and daily commutes more effectively. This calculator helps you understand and plan for one of the biggest expenses of driving.'
    },
    'date-calculator': {
        title: '✨ About the Date Calculator',
        features: ['Add or Subtract from a Date: Find a future or past date by adding or subtracting days, weeks, months, or years.', 'Calculate Duration: Find the number of days, weeks, and months between two dates.', 'Easy-to-use calendars for date selection.', 'Accurate and fast.'],
        howTo: ['Select a start date.', 'Choose whether to add or subtract time, or calculate the duration between two dates.', 'Enter the values.', 'The resulting date or duration will be displayed.'],
        why: 'A handy tool for project planning, event scheduling, and counting down to important dates. Quickly perform date-related calculations without manual counting.'
    },

    // Ecommerce Tools
    'amazon-shipping-label-cropper': {
        title: '✨ About the Amazon FBA Label Cropper',
        features: ['One-Click Cropping: Automatically crops standard 8.5x11 inch PDF labels.', '4x6 Inch Output: Perfectly formatted for thermal printers (like Zebra, Rollo).', 'Time-Saving: Eliminates the need for manual screenshotting or editing.', 'Cost-Effective: Reduces label waste by using the correct size.'],
        howTo: ['Upload your Amazon FBA shipping label PDF (the one with two labels on a page).', 'Click the "Crop Label" button.', 'The tool will generate a new PDF with each label on a separate 4x6 inch page.', 'Download and print on your thermal printer.'],
        why: 'Streamline your Amazon FBA shipping process. This tool saves you time and money by instantly converting your shipping labels into the correct format for thermal printers, eliminating wasted labels and manual effort.'
    },
    'flipkart-shipping-label-cropper': {
        title: '✨ About the Flipkart Label Cropper',
        features: ['Effortless Conversion: Converts Flipkart\'s default PDF labels to a 4x6 inch format.', 'Thermal Printer Ready: Ideal for all popular 4x6 thermal shipping label printers.', 'Improves Workflow: Speeds up your packing and dispatch process significantly.', 'No More Wasted Paper: Print labels efficiently without using a full A4 sheet.'],
        howTo: ['Upload the shipping label PDF you downloaded from your Flipkart seller account.', 'Click the "Crop Flipkart Label" button.', 'A new PDF, perfectly sized to 4x6 inches, will be generated.', 'Download your print-ready label.'],
        why: 'A must-have tool for any serious Flipkart seller. Stop wasting time and resources on manually adjusting labels. Get perfect, scannable 4x6 inch labels in one click and make your packing process faster and more professional.'
    },
    'meesho-shipping-label-cropper': {
        title: '✨ About the Meesho Label Cropper',
        features: ['One-Click Solution: Instantly crops standard Meesho shipping labels.', 'Perfect 4x6 Format: Creates labels ready for any 4x6 inch thermal printer.', 'Reduces Costs: Save on label sheets by printing on cost-effective thermal labels.', 'User-Friendly: Simple upload-and-crop interface requires no technical skill.'],
        howTo: ['Download your shipping label from the Meesho Supplier Panel.', 'Upload the PDF file to our tool.', 'Click the "Crop Meesho Label" button.', 'Download the generated 4x6 inch PDF and print it.'],
        why: 'Optimize your Meesho order fulfillment. This tool helps you quickly prepare shipping labels in the most efficient format, reducing your packing time and material costs, and helping you ship orders faster.'
    },
    'myntra-shipping-label-cropper': {
        title: '✨ About the Myntra Label Cropper',
        features: ['Myntra-Specific: Designed specifically for Myntra seller shipping labels.', '4x6 Thermal Format: Converts labels to the industry-standard 4x6 inch size.', 'Professional Labels: Creates clean, professional-looking labels for your packages.', 'Saves Time: Automates the previously manual task of resizing labels.'],
        howTo: ['Upload your Myntra shipping label PDF.', 'Click the "Crop Myntra Label" button.', 'Your new, perfectly cropped 4x6 inch label will be ready for download.', 'Print the downloaded PDF on your thermal printer.'],
        why: 'Ship your Myntra orders more efficiently. This tool is designed to save you valuable time during the packing process, ensuring your labels are always the right size and look professional, enhancing your brand image.'
    },
  }

  const toolDesc = detailedDescriptions[tool.slug];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <AdPlaceholder adSlotId="toolpage-banner-top" adSettings={settings.advertisement ?? null} className="mb-6" />
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-center gap-4">
              <Icon className="h-10 w-10 text-primary" />
              <CardTitle className="text-3xl font-bold">{tool.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 text-center">{tool.description}</p>
              
              <div className="min-h-[300px] rounded-lg bg-muted/50 p-4 sm:p-8">
                {ToolComponent ? <ToolComponent /> : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-lg text-muted-foreground">
                      Tool interface coming soon!
                    </p>
                  </div>
                )}
              </div>
              <AdPlaceholder adSlotId="toolpage-in-description" adSettings={settings.advertisement ?? null} className="my-6" />

              {toolDesc && (
                <div className="prose prose-sm dark:prose-invert max-w-none mt-8 pt-6 border-t">
                    <h2 className="text-2xl font-bold">{toolDesc.title}</h2>
                    <p>{toolDesc.why}</p>
                    
                    <h3 className="text-xl font-semibold mt-6">🔑 Key Features:</h3>
                    <ul>
                       {toolDesc.features.map((feature, i) => <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />)}
                    </ul>

                    <h3 className="text-xl font-semibold mt-6">🚀 How to Use:</h3>
                    <ol>
                         {toolDesc.howTo.map((step, i) => <li key={i} dangerouslySetInnerHTML={{ __html: step }} />)}
                    </ol>
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="mt-8">
              <CardHeader>
                  <CardTitle>Reviews for {tool.name}</CardTitle>
                  <CardDescription>See what other users are saying about this tool.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ReviewForm toolId={tool.slug} toolName={tool.name} />
                  <Separator className="my-8" />
                  <div className="space-y-6">
                      {toolReviews.length > 0 ? toolReviews.map(review => (
                          <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.authorAvatar} alt={review.authorName} />
                                    <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{review.authorName}</p>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                            ))}
                                        </div>
                                    </div>
                                     <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                                </div>
                          </div>
                      )) : (
                          <p className="text-muted-foreground text-center">No reviews for this tool yet. Be the first to leave one!</p>
                      )}
                  </div>
              </CardContent>
          </Card>
        </div>
         <aside className="w-full lg:w-64 xl:w-80 mt-8 lg:mt-0 space-y-6">
            <AdPlaceholder adSlotId="toolpage-sidebar" adSettings={settings.advertisement ?? null} />
             {sidebarSettings?.showPopularTools && popularTools.length > 0 && (
                <SidebarWidget title="Popular Tools">
                    <ul className="space-y-2">
                        {popularTools.map(t => {
                            const ToolIcon = (Icons as any)[t.icon] || Icons.HelpCircle;
                            return (
                            <li key={t.id}>
                                <Link href={`/tools/${t.slug}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted">
                                    <ToolIcon className="h-5 w-5" />
                                    <span>{t.name}</span>
                                </Link>
                            </li>
                        )})}
                    </ul>
                </SidebarWidget>
            )}
            {sidebarSettings?.showRecentPosts && recentPosts.length > 0 && (
                 <SidebarWidget title="Recent Posts">
                     <ul className="space-y-3">
                        {recentPosts.map(post => (
                            <li key={post.id}>
                                <Link href={`/blog/${post.slug}`} className="group">
                                    <p className="font-medium text-sm group-hover:text-primary transition-colors leading-tight">{post.title}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(post.publishedAt!).toLocaleDateString()}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </SidebarWidget>
            )}
        </aside>
      </div>
      <AdPlaceholder adSlotId="toolpage-banner-bottom" adSettings={settings.advertisement ?? null} className="mt-6" />
    </div>
  );
}

    
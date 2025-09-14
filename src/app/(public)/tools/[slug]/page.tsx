
'use client';

import { useState, useEffect } from 'react';
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { WordCounter } from '@/components/tools/WordCounter';
import { LoremIpsumGenerator } from '@/components/tools/LoremIpsumGenerator';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { BmiCalculator } from '@/components/tools/BmiCalculator';
import { TextToSpeech } from '@/components/tools/TextToSpeech';
import { SpeechToText } from '@/components/tools/SpeechToText';
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
import { AiVoiceCloning } from '@/components/tools/AiVoiceCloning';
import { AiStoryVisualizer } from '@/components/tools/AiStoryVisualizer';
import { AddWatermarkToPdf } from '@/components/tools/AddWatermarkToPdf';
import { AgeCalculator } from '@/components/tools/AgeCalculator';
import { AmazonShippingLabelCropper } from '@/components/tools/AmazonShippingLabelCropper';
import { MyntraShippingLabelCropper } from '@/components/tools/MyntraShippingLabelCropper';
import { FlipkartShippingLabelCropper } from '@/components/tools/FlipkartShippingLabelCropper';
import { MeeshoShippingLabelCropper } from '@/components/tools/MeeshoShippingLabelCropper';
import { Base64Converter } from '@/components/tools/Base64Converter';
import { CssMinifier } from '@/components/tools/CssMinifier';
import { DiscountCalculator } from '@/components/tools/DiscountCalculator';
import { DateCalculator } from '@/components/tools/DateCalculator';
import { CompressPdf } from '@/components/tools/CompressPdf';
import { ExcelToPdf } from '@/components/tools/ExcelToPdf';
import { ReverseText } from '@/components/tools/ReverseText';
import { RemoveExtraSpaces } from '@/components/tools/RemoveExtraSpaces';
import { FindAndReplace } from '@/components/tools/FindAndReplace';
import { RandomWordGenerator } from '@/components/tools/RandomWordGenerator';
import { RotateImage } from '@/components/tools/RotateImage';
import { PngToJpg } from '@/components/tools/PngToJpg';
import { JpgToPng } from '@/components/tools/JpgToPng';
import { ImageToBase64 } from '@/components/tools/ImageToBase64';
import { ImageResizer } from '@/components/tools/ImageResizer';
import { ImageBackgroundRemover } from '@/components/tools/ImageBackgroundRemover';
import { AdMobRevenueCalculator } from '@/components/tools/AdMobRevenueCalculator';
import { AdSenseRevenueCalculator } from '@/components/tools/AdSenseRevenueCalculator';
import { IFSCodetoBankDetails } from '@/components/tools/IFSCCodeToBankDetails';
import { GSTCalculator } from '@/components/tools/GSTCalculator';
import { ImageColorExtractor } from '@/components/tools/ImageColorExtractor';
import { ImageCropper } from '@/components/tools/ImageCropper';
import { ImageCompressor } from '@/components/tools/ImageCompressor';
import { ImageTextExtractor } from '@/components/tools/ImageTextExtractor';
import { ImageConverter } from '@/components/tools/ImageConverter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/tools/ReviewForm';
import { getReviews } from '@/ai/flows/review-management';
import { Star, Construction, Sparkles, ArrowLeft, Loader2, ListOrdered, CheckCircle2, ShieldCheck, Zap, MousePointerClick, DownloadCloud, BrainCircuit, Cpu } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { LinkedinVideoDownloader } from '@/components/tools/LinkedinVideoDownloader';
import { PinterestVideoDownloader } from '@/components/tools/PinterestVideoDownloader';
import { UnlockPdf } from '@/components/tools/UnlockPdf';
import { LockPdf } from '@/components/tools/LockPdf';
import { PdfPageReorder } from '@/components/tools/PdfPageReorder';
import { PdfPageCounter } from '@/components/tools/PdfPageCounter';
import { PdfPageNumberer } from '@/components/tools/PdfPageNumberer';
import { PdfPageRemover } from '@/components/tools/PdfPageRemover';
import { PdfOrganizer } from '@/components/tools/PdfOrganizer';
import { WebsiteScreenshot } from '@/components/tools/WebsiteScreenshot';
import { WhatIsMyBrowser } from '@/components/tools/WhatIsMyBrowser';
import { NegativeMarkingCalculator } from '@/components/tools/NegativeMarkingCalculator';
import { YouTubeChannelBannerDownloader } from '@/components/tools/YouTubeChannelBannerDownloader';
import { YouTubeChannelLogoDownloader } from '@/components/tools/YouTubeChannelLogoDownloader';
import { YouTubeVideoDescriptionExtractor } from '@/components/tools/YouTubeVideoDescriptionExtractor';
import { YouTubeVideoTitleExtractor } from '@/components/tools/YouTubeVideoTitleExtractor';
import { YouTubeVideoThumbnailDownloader } from '@/components/tools/YouTubeVideoThumbnailDownloader';
import { YouTubeRegionRestrictionChecker } from '@/components/tools/YouTubeRegionRestrictionChecker';
import { GoogleDriveDirectLinkGenerator } from '@/components/tools/GoogleDriveDirectLinkGenerator';
import { DropboxDirectLinkGenerator } from '@/components/tools/DropboxDirectLinkGenerator';
import { OneDriveDirectLinkGenerator } from '@/components/tools/OneDriveDirectLinkGenerator';
import { NSDLPANCardPhotoAndSignatureResizer } from '@/components/tools/NSDLPANCardPhotoAndSignatureResizer';
import { UTIPANCardPhotoAndSignatureResizer } from '@/components/tools/UTIPANCardPhotoAndSignatureResizer';
import { PRNToPDF } from '@/components/tools/PRNToPDF';
import { ImageToPdf } from '@/components/tools/ImageToPdf';
import { PdfSigner } from '@/components/tools/PdfSigner';
import { MarksToPercentageCalculator } from '@/components/tools/MarksToPercentageCalculator';
import { SrmToCgpaCalculator } from '@/components/tools/SrmToCgpaCalculator';
import { CgpaToMarksCalculator } from '@/components/tools/CgpaToMarksCalculator';
import { GpaToPercentageConverter } from '@/components/tools/GpaToPercentageConverter';
import { GpaToCgpaCalculator } from '@/components/tools/GpaToCgpaCalculator';
import { PercentageToCgpaConverter } from '@/components/tools/PercentageToCgpaConverter';
import { CgpaToGpaConverter } from '@/components/tools/CgpaToGpaConverter';
import { TextEncryptionDecryption } from '@/components/tools/TextEncryptionDecryption';
import { PasswordStrengthChecker } from '@/components/tools/PasswordStrengthChecker';
import { Sha256HashGenerator } from '@/components/tools/Sha256HashGenerator';
import { UniversalHashGenerator } from '@/components/tools/UniversalHashGenerator';
import { AesEncryptionDecryption } from '@/components/tools/AesEncryptionDecryption';
import { UniversalFileConverter } from '@/components/tools/UniversalFileConverter';
import { ImageShapeConverter } from '@/components/tools/ImageShapeConverter';
import { MorseToTextTranslator } from '@/components/tools/MorseToTextTranslator';
import { TextToMorseCode } from '@/components/tools/TextToMorseCode';
import { CryptocurrencyConverter } from '@/components/tools/CryptocurrencyConverter';
import { BarcodeGenerator } from '@/components/tools/BarcodeGenerator';
import { CurrencyConverter } from '@/components/tools/CurrencyConverter';
import { CreditCardInterestCalculator } from '@/components/tools/CreditCardInterestCalculator';
import { ImageMetadataViewer } from '@/components/tools/ImageMetadataViewer';
import { AiCodeGenerator } from '@/components/tools/AiCodeGenerator';
import { Button } from '@/components/ui/button';
import { AiRewriter } from '@/components/tools/AiRewriter';
import { ImageQualityEnhancer } from '@/components/tools/ImageQualityEnhancer';
import { AiWebContentSummarizer } from '@/components/tools/AiWebContentSummarizer';
import { type Tool } from '@/ai/flows/tool-management.types';
import { type Review } from '@/ai/flows/review-management.types';
import { type Post } from '@/ai/flows/blog-management.types';
import { type AppSettings } from '@/ai/flows/settings-management.types';
import { FlipImage } from '@/components/tools/FlipImage';
import { IcoConverter } from '@/components/tools/IcoConverter';
import { BinaryConverter } from '@/components/tools/BinaryConverter';
import { Logo } from '@/components/common/Logo';
import { AiSeoKeywordGenerator } from '@/components/tools/AiSeoKeywordGenerator';


const toolComponents: { [key: string]: React.ComponentType } = {
  'case-converter': CaseConverter,
  'word-counter': WordCounter,
  'lorem-ipsum-generator': LoremIpsumGenerator,
  'password-generator': PasswordGenerator,
  'json-formatter': JsonFormatter,
  'bmi-calculator': BmiCalculator,
  'text-to-speech': TextToSpeech,
  'speech-to-text': SpeechToText,
  'pdf-merger': PdfMerger,
  'unlock-pdf': UnlockPdf,
  'lock-pdf': LockPdf,
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
  'ai-voice-cloning': AiVoiceCloning,
  'ai-story-visualizer': AiStoryVisualizer,
  'ai-code-generator': AiCodeGenerator,
  'ai-rewriter': AiRewriter,
  'ai-image-quality-enhancer': ImageQualityEnhancer,
  'ai-web-content-summarizer': AiWebContentSummarizer,
  'add-watermark-to-pdf': AddWatermarkToPdf,
  'age-calculator': AgeCalculator,
  'amazon-shipping-label-cropper': AmazonShippingLabelCropper,
  'myntra-shipping-label-cropper': MyntraShippingLabelCropper,
  'flipkart-shipping-label-cropper': FlipkartShippingLabelCropper,
  'meesho-shipping-label-cropper': MeeshoShippingLabelCropper,
  'base64-converter': Base64Converter,
  'css-minifier': CssMinifier,
  'discount-calculator': DiscountCalculator,
  'date-calculator': DateCalculator,
  'compress-pdf': CompressPdf,
  'excel-to-pdf': ExcelToPdf,
  'reverse-text': ReverseText,
  'remove-extra-spaces': RemoveExtraSpaces,
  'find-and-replace': FindAndReplace,
  'random-word-generator': RandomWordGenerator,
  'rotate-image': RotateImage,
  'png-to-jpg': PngToJpg,
  'jpg-to-png': JpgToPng,
  'image-to-base64': ImageToBase64,
  'image-resizer': ImageResizer,
  'image-background-remover': ImageBackgroundRemover,
  'admob-revenue-calculator': AdMobRevenueCalculator,
  'adsense-revenue-calculator': AdSenseRevenueCalculator,
  'ifsc-code-to-bank-details': IFSCodetoBankDetails,
  'gst-calculator': GSTCalculator,
  'image-color-extractor': ImageColorExtractor,
  'image-cropper': ImageCropper,
  'image-compressor': ImageCompressor,
  'image-text-extractor': ImageTextExtractor,
  'image-converter': ImageConverter,
  'pdf-splitter': PdfSplitter,
  'pdf-page-reorder': PdfPageReorder,
  'pdf-page-counter': PdfPageCounter,
  'pdf-page-numberer': PdfPageNumberer,
  'pdf-page-remover': PdfPageRemover,
  'pdf-organizer': PdfOrganizer,
  'website-screenshot': WebsiteScreenshot,
  'what-is-my-browser': WhatIsMyBrowser,
  'negative-marking-calculator': NegativeMarkingCalculator,
  'youtube-channel-banner-downloader': YouTubeChannelBannerDownloader,
  'youtube-channel-logo-downloader': YouTubeChannelLogoDownloader,
  'youtube-video-description-extractor': YouTubeVideoDescriptionExtractor,
  'youtube-video-title-extractor': YouTubeVideoTitleExtractor,
  'youtube-video-thumbnail-downloader': YouTubeVideoThumbnailDownloader,
  'youtube-region-restriction-checker': YouTubeRegionRestrictionChecker,
  'google-drive-direct-link-generator': GoogleDriveDirectLinkGenerator,
  'dropbox-direct-link-generator': DropboxDirectLinkGenerator,
  'onedrive-direct-link-generator': OneDriveDirectLinkGenerator,
  'nsdl-pan-card-photo-and-signature-resizer': NSDLPANCardPhotoAndSignatureResizer,
  'uti-pan-card-photo-and-signature-resizer': UTIPANCardPhotoAndSignatureResizer,
  'prn-to-pdf': PRNToPDF,
  'image-to-pdf': ImageToPdf,
  'pdf-signer': PdfSigner,
  'rotate-pdf': RotatePdf,
  'marks-to-percentage-calculator': MarksToPercentageCalculator,
  'srm-to-cgpa-calculator': SrmToCgpaCalculator,
  'cgpa-to-marks-calculator': CgpaToMarksCalculator,
  'gpa-to-percentage-converter': GpaToPercentageConverter,
  'gpa-to-cgpa-calculator': GpaToCgpaCalculator,
  'percentage-to-cgpa-converter': PercentageToCgpaConverter,
  'cgpa-to-gpa-converter': CgpaToGpaConverter,
  'text-encryption-decryption': TextEncryptionDecryption,
  'password-strength-checker': PasswordStrengthChecker,
  'sha256-hash-generator': Sha256HashGenerator,
  'universal-hash-generator': UniversalHashGenerator,
  'aes-encryption-decryption': AesEncryptionDecryption,
  'universal-file-converter': UniversalFileConverter,
  'image-shape-converter': ImageShapeConverter,
  'morse-to-text-translator': MorseToTextTranslator,
  'text-to-morse-code': TextToMorseCode,
  'cryptocurrency-converter': CryptocurrencyConverter,
  'barcode-generator': BarcodeGenerator,
  'currency-converter': CurrencyConverter,
  'credit-card-interest-calculator': CreditCardInterestCalculator,
  'uuid-generator': UuidGenerator,
  'image-metadata-viewer': ImageMetadataViewer,
  'binary-to-text': BinaryConverter,
  'text-to-binary': BinaryConverter,
  'flip-image': FlipImage,
  'ico-converter': IcoConverter,
  'word-to-pdf': WordToPdf,
  'ppt-to-pdf': PptToPdf,
  'pdf-to-word': PdfToWord,
  'pdf-to-jpg': PdfToJpg,
  'meta-tag-generator': MetaTagGenerator,
  'robots.txt-generator': RobotsTxtGenerator,
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
  'youtube-video-downloader': YoutubeVideoDownloader,
  'x-video-downloader': XVideoDownloader,
  'instagram-video-downloader': InstagramVideoDownloader,
  'threads-video-downloader': ThreadsVideoDownloader,
  'linkedin-video-downloader': LinkedinVideoDownloader,
  'pinterest-video-downloader': PinterestVideoDownloader,
  'ai-seo-keyword-generator': AiSeoKeywordGenerator,
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

const ToolStatusDisplay = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-muted/50 rounded-lg">
        <Icon className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

export default function ToolPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [tool, setTool] = useState<Tool | null | undefined>(undefined);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [toolReviews, setToolReviews] = useState<Review[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [toolsData, settingsData, reviewsData, postsData] = await Promise.all([
                    getTools(),
                    getSettings(),
                    getReviews(slug),
                    getPosts()
                ]);

                setAllTools(toolsData);
                const currentTool = toolsData.find(t => t.slug === slug);
                setTool(currentTool);
                
                if (!currentTool || currentTool.status === 'Disabled') {
                    notFound();
                    return;
                }

                setSettings(settingsData);
                setToolReviews(reviewsData);
                setAllPosts(postsData);
            } catch (error) {
                console.error("Failed to load tool page data:", error);
                setTool(null); // Set to null to indicate an error or not found
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [slug]);

  if (loading) {
      return (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 bg-background">
            <Logo className="h-16 w-16 animate-pulse" />
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-lg">Loading Tool...</p>
            </div>
        </div>
      );
  }
  
  if (tool === null) {
      notFound();
      return;
  }
  
  if (tool === undefined) {
      return (
         <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 bg-background">
            <Logo className="h-16 w-16 animate-pulse" />
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-lg">Loading Tool...</p>
            </div>
        </div>
      );
  }


  const ToolComponent = toolComponents[tool.slug];
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  
  const sidebarSettings = settings?.sidebar?.toolSidebar;
  const popularTools = allTools.filter(t => t.status === 'Active' && t.slug !== tool.slug).slice(0, 20);
  const recentPosts = allPosts.filter(p => p.status === 'Published').slice(0, 10);

  const renderToolContent = () => {
    switch(tool.status) {
        case 'Maintenance':
            return <ToolStatusDisplay icon={Construction} title="Under Maintenance" description="This tool is currently undergoing maintenance to improve its features. Please check back later." />;
        case 'Coming Soon':
            return <ToolStatusDisplay icon={Sparkles} title="Coming Soon!" description="Our team is hard at work on this new tool. It will be available shortly!" />;
        default:
            return ToolComponent ? <ToolComponent /> : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-lg text-muted-foreground">
                        Tool interface coming soon!
                    </p>
                </div>
            );
    }
  }


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/tools">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Tools
        </Link>
      </Button>
      <AdPlaceholder adSlotId="toolpage-banner-top" adSettings={settings?.advertisement ?? null} className="mb-6" />
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
                {renderToolContent()}
              </div>
              <AdPlaceholder adSlotId="toolpage-in-description" adSettings={settings?.advertisement ?? null} className="my-6" />
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered /> How to Use {tool.name}?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(tool.howToUse && tool.howToUse.length > 0) ? (
                    tool.howToUse.map((step, index) => (
                         <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">{index + 1}</div>
                            <div className="flex-1">
                                <p className="text-muted-foreground">{step}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                         <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">1</div>
                            <div className="flex-1">
                                <h3 className="font-semibold">📥 Provide Input</h3>
                                <p className="text-muted-foreground">Paste your text, upload your file, or enter the required data in the designated fields.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">2</div>
                             <div className="flex-1">
                                <h3 className="font-semibold">⚙️ Configure Settings</h3>
                                <p className="text-muted-foreground">Adjust any available options, such as language, format, or quality, to tailor the output to your needs.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">3</div>
                             <div className="flex-1">
                                <h3 className="font-semibold">🚀 Process Your Request</h3>
                                <p className="text-muted-foreground">Click the primary action button (e.g., "Generate", "Convert", "Calculate") to start the process.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">4</div>
                            <div className="flex-1">
                                <h3 className="font-semibold">✨ Get Your Results</h3>
                                <p className="text-muted-foreground">Your result will be displayed instantly. You can then copy it to your clipboard or download it as a file.</p>
                            </div>
                        </div>
                    </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles /> Features of {tool.name}
              </CardTitle>
            </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="p-4 bg-background">
                  <h3 className="font-semibold flex items-center gap-2">⚡ Instant Results</h3>
                  <p className="text-sm text-muted-foreground mt-1">Get what you need in seconds, without any unnecessary waiting or complex steps.</p>
               </Card>
               <Card className="p-4 bg-background">
                  <h3 className="font-semibold flex items-center gap-2">👍 Easy to Use</h3>
                  <p className="text-sm text-muted-foreground mt-1">Our intuitive interface makes it easy for anyone to use, regardless of technical skill.</p>
               </Card>
               <Card className="p-4 bg-background">
                  <h3 className="font-semibold flex items-center gap-2">🔒 Secure & Private</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your data is processed securely and is never stored on our servers.</p>
               </Card>
               <Card className="p-4 bg-background">
                  <h3 className="font-semibold flex items-center gap-2">✨ High-Quality Output</h3>
                  <p className="text-sm text-muted-foreground mt-1">Our tools provide accurate, reliable, and high-quality results every time.</p>
               </Card>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 /> Why Choose Our Tools?
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="p-4 bg-background">
                 <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="text-primary"/>Secure & Reliable</h3>
                 <p className="text-sm text-muted-foreground mt-1">Your data privacy is our priority. All tools run securely, and we never store your input data.</p>
               </Card>
                <Card className="p-4 bg-background">
                 <h3 className="font-semibold flex items-center gap-2"><Zap className="text-primary"/>Blazing Fast</h3>
                 <p className="text-sm text-muted-foreground mt-1">Get your results instantly without any unnecessary delays. Our tools are optimized for speed.</p>
               </Card>
                <Card className="p-4 bg-background">
                 <h3 className="font-semibold flex items-center gap-2"><MousePointerClick className="text-primary"/>User-Friendly Interface</h3>
                 <p className="text-sm text-muted-foreground mt-1">No complicated setups. Our tools are designed to be intuitive and easy for everyone.</p>
               </Card>
               <Card className="p-4 bg-background">
                 <h3 className="font-semibold flex items-center gap-2"><Cpu className="text-primary"/>AI-Powered</h3>
                 <p className="text-sm text-muted-foreground mt-1">Many of our tools leverage cutting-edge AI to provide smarter, more accurate, and creative results.</p>
               </Card>
               <Card className="p-4 bg-background">
                 <h3 className="font-semibold flex items-center gap-2"><DownloadCloud className="text-primary"/>No Installation Needed</h3>
                 <p className="text-sm text-muted-foreground mt-1">All our tools run directly in your browser. There is nothing to download or install on your device.</p>
               </Card>
               <Card className="p-4 bg-background">
                 <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="text-primary"/>Constantly Evolving</h3>
                 <p className="text-sm text-muted-foreground mt-1">We are always adding new tools and improving existing ones based on user feedback and new technology.</p>
               </Card>
            </CardContent>
          </Card>
          
          <AdPlaceholder adSlotId="toolpage-banner-bottom" adSettings={settings?.advertisement ?? null} className="my-6" />

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
            <AdPlaceholder adSlotId="toolpage-sidebar" adSettings={settings?.advertisement ?? null} />
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
    </div>
  );
}

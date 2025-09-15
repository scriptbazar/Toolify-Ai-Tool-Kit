

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as Icons from 'lucide-react';
import { notFound } from 'next/navigation';
import { addUserActivity } from '@/ai/flows/user-activity';
import { useAuth } from '@/hooks/use-auth';
import type { Tool } from '@/ai/flows/tool-management.types';
import type { Review } from '@/ai/flows/review-management.types';
import type { Post } from '@/ai/flows/blog-management.types';
import type { AppSettings } from '@/ai/flows/settings-management.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/tools/ReviewForm';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle2, Cpu, DownloadCloud, ListOrdered, MousePointerClick, ShieldCheck, Sparkles, Star, Zap, BrainCircuit, Construction } from 'lucide-react';
import dynamic from 'next/dynamic';

const toolComponents: { [key: string]: React.ComponentType } = {
  'case-converter': dynamic(() => import('@/components/tools/CaseConverter').then(mod => mod.CaseConverter)),
  'word-counter': dynamic(() => import('@/components/tools/WordCounter').then(mod => mod.WordCounter)),
  'lorem-ipsum-generator': dynamic(() => import('@/components/tools/LoremIpsumGenerator').then(mod => mod.LoremIpsumGenerator)),
  'password-generator': dynamic(() => import('@/components/tools/PasswordGenerator').then(mod => mod.PasswordGenerator)),
  'json-formatter': dynamic(() => import('@/components/tools/JsonFormatter').then(mod => mod.JsonFormatter)),
  'bmi-calculator': dynamic(() => import('@/components/tools/BmiCalculator').then(mod => mod.BmiCalculator)),
  'text-to-speech': dynamic(() => import('@/components/tools/TextToSpeech').then(mod => mod.TextToSpeech)),
  'speech-to-text': dynamic(() => import('@/components/tools/SpeechToText').then(mod => mod.SpeechToText)),
  'pdf-merger': dynamic(() => import('@/components/tools/PdfMerger').then(mod => mod.PdfMerger)),
  'unit-converter': dynamic(() => import('@/components/tools/UnitConverter').then(mod => mod.UnitConverter)),
  'color-picker': dynamic(() => import('@/components/tools/ColorPicker').then(mod => mod.ColorPicker)),
  'text-repeater': dynamic(() => import('@/components/tools/TextRepeater').then(mod => mod.TextRepeater)),
  'prompt-generator': dynamic(() => import('@/components/tools/PromptGenerator').then(mod => mod.PromptGenerator)),
  'ai-blog-post-writer': dynamic(() => import('@/components/tools/AiBlogPostWriter').then(mod => mod.AiBlogPostWriter)),
  'ai-content-summarizer': dynamic(() => import('@/components/tools/AiContentSummarizer').then(mod => mod.AiContentSummarizer)),
  'ai-code-assistant': dynamic(() => import('@/components/tools/AiCodeAssistant').then(mod => mod.AiCodeAssistant)),
  'ai-email-composer': dynamic(() => import('@/components/tools/AiEmailComposer').then(mod => mod.AiEmailComposer)),
  'ai-image-generator': dynamic(() => import('@/components/tools/AiImageGenerator').then(mod => mod.AiImageGenerator)),
  'ai-product-description-writer': dynamic(() => import('@/components/tools/AiProductDescriptionWriter').then(mod => mod.AiProductDescriptionWriter)),
  'ai-story-generator': dynamic(() => import('@/components/tools/AiStoryGenerator').then(mod => mod.AiStoryGenerator)),
  'ai-tweet-generator': dynamic(() => import('@/components/tools/AiTweetGenerator').then(mod => mod.AiTweetGenerator)),
  'ai-voice-cloning': dynamic(() => import('@/components/tools/AiVoiceCloning').then(mod => mod.AiVoiceCloning)),
  'ai-story-visualizer': dynamic(() => import('@/components/tools/AiStoryVisualizer').then(mod => mod.AiStoryVisualizer)),
  'add-watermark-to-pdf': dynamic(() => import('@/components/tools/AddWatermarkToPdf').then(mod => mod.AddWatermarkToPdf)),
  'age-calculator': dynamic(() => import('@/components/tools/AgeCalculator').then(mod => mod.AgeCalculator)),
  'amazon-shipping-label-cropper': dynamic(() => import('@/components/tools/AmazonShippingLabelCropper').then(mod => mod.AmazonShippingLabelCropper)),
  'myntra-shipping-label-cropper': dynamic(() => import('@/components/tools/MyntraShippingLabelCropper').then(mod => mod.MyntraShippingLabelCropper)),
  'flipkart-shipping-label-cropper': dynamic(() => import('@/components/tools/FlipkartShippingLabelCropper').then(mod => mod.FlipkartShippingLabelCropper)),
  'meesho-shipping-label-cropper': dynamic(() => import('@/components/tools/MeeshoShippingLabelCropper').then(mod => mod.MeeshoShippingLabelCropper)),
  'base64-converter': dynamic(() => import('@/components/tools/Base64Converter').then(mod => mod.Base64Converter)),
  'binary-to-text': dynamic(() => import('@/components/tools/BinaryToText').then(mod => mod.BinaryToText)),
  'text-to-binary': dynamic(() => import('@/components/tools/TextToBinary').then(mod => mod.TextToBinary)),
  'css-minifier': dynamic(() => import('@/components/tools/CssMinifier').then(mod => mod.CssMinifier)),
  'discount-calculator': dynamic(() => import('@/components/tools/DiscountCalculator').then(mod => mod.DiscountCalculator)),
  'date-calculator': dynamic(() => import('@/components/tools/DateCalculator').then(mod => mod.DateCalculator)),
  'compress-pdf': dynamic(() => import('@/components/tools/CompressPdf').then(mod => mod.CompressPdf)),
  'excel-to-pdf': dynamic(() => import('@/components/tools/ExcelToPdf').then(mod => mod.ExcelToPdf)),
  'reverse-text': dynamic(() => import('@/components/tools/ReverseText').then(mod => mod.ReverseText)),
  'remove-extra-spaces': dynamic(() => import('@/components/tools/RemoveExtraSpaces').then(mod => mod.RemoveExtraSpaces)),
  'find-and-replace': dynamic(() => import('@/components/tools/FindAndReplace').then(mod => mod.FindAndReplace)),
  'random-word-generator': dynamic(() => import('@/components/tools/RandomWordGenerator').then(mod => mod.RandomWordGenerator)),
  'rotate-image': dynamic(() => import('@/components/tools/RotateImage').then(mod => mod.RotateImage)),
  'png-to-jpg': dynamic(() => import('@/components/tools/PngToJpg').then(mod => mod.PngToJpg)),
  'jpg-to-png': dynamic(() => import('@/components/tools/JpgToPng').then(mod => mod.JpgToPng)),
  'image-to-base64': dynamic(() => import('@/components/tools/ImageToBase64').then(mod => mod.ImageToBase64)),
  'image-resizer': dynamic(() => import('@/components/tools/ImageResizer').then(mod => mod.ImageResizer)),
  'image-background-remover': dynamic(() => import('@/components/tools/ImageBackgroundRemover').then(mod => mod.ImageBackgroundRemover)),
  'admob-revenue-calculator': dynamic(() => import('@/components/tools/AdMobRevenueCalculator').then(mod => mod.AdMobRevenueCalculator)),
  'adsense-revenue-calculator': dynamic(() => import('@/components/tools/AdSenseRevenueCalculator').then(mod => mod.AdSenseRevenueCalculator)),
  'ifsc-code-to-bank-details': dynamic(() => import('@/components/tools/IFSCCodeToBankDetails').then(mod => mod.IFSCCodetoBankDetails)),
  'gst-calculator': dynamic(() => import('@/components/tools/GSTCalculator').then(mod => mod.GSTCalculator)),
  'image-color-extractor': dynamic(() => import('@/components/tools/ImageColorExtractor').then(mod => mod.ImageColorExtractor)),
  'image-cropper': dynamic(() => import('@/components/tools/ImageCropper').then(mod => mod.ImageCropper)),
  'image-compressor': dynamic(() => import('@/components/tools/ImageCompressor').then(mod => mod.ImageCompressor)),
  'image-text-extractor': dynamic(() => import('@/components/tools/ImageTextExtractor').then(mod => mod.ImageTextExtractor)),
  'image-converter': dynamic(() => import('@/components/tools/ImageConverter').then(mod => mod.ImageConverter)),
  'pdf-splitter': dynamic(() => import('@/components/tools/PdfSplitter').then(mod => mod.PdfSplitter)),
  'word-to-pdf': dynamic(() => import('@/components/tools/WordToPdf').then(mod => mod.WordToPdf)),
  'ppt-to-pdf': dynamic(() => import('@/components/tools/PptToPdf').then(mod => mod.PptToPdf)),
  'rotate-pdf': dynamic(() => import('@/components/tools/RotatePdf').then(mod => mod.RotatePdf)),
  'pdf-to-word': dynamic(() => import('@/components/tools/PdfToWord').then(mod => mod.PdfToWord)),
  'pdf-to-jpg': dynamic(() => import('@/components/tools/PdfToJpg').then(mod => mod.PdfToJpg)),
  'meta-tag-generator': dynamic(() => import('@/components/tools/MetaTagGenerator').then(mod => mod.MetaTagGenerator)),
  'robots.txt-generator': dynamic(() => import('@/components/tools/RobotsTxtGenerator').then(mod => mod.RobotsTxtGenerator)),
  'xml-sitemap-generator': dynamic(() => import('@/components/tools/XmlSitemapGenerator').then(mod => mod.XmlSitemapGenerator)),
  'favicon-checker': dynamic(() => import('@/components/tools/FaviconChecker').then(mod => mod.FaviconChecker)),
  'keyword-density-checker': dynamic(() => import('@/components/tools/KeywordDensityChecker').then(mod => mod.KeywordDensityChecker)),
  'serp-checker': dynamic(() => import('@/components/tools/SerpChecker').then(mod => mod.SerpChecker)),
  'redirect-checker': dynamic(() => import('@/components/tools/RedirectChecker').then(mod => mod.RedirectChecker)),
  'schema-generator': dynamic(() => import('@/components/tools/SchemaGenerator').then(mod => mod.SchemaGenerator)),
  'title-tag-checker': dynamic(() => import('@/components/tools/TitleTagChecker').then(mod => mod.TitleTagChecker)),
  'website-word-counter': dynamic(() => import('@/components/tools/WebsiteWordCounter').then(mod => mod.WebsiteWordCounter)),
  'fuel-cost-calculator': dynamic(() => import('@/components/tools/FuelCostCalculator').then(mod => mod.FuelCostCalculator)),
  'gpa-calculator': dynamic(() => import('@/components/tools/GpaCalculator').then(mod => mod.GpaCalculator)),
  'loan-calculator': dynamic(() => import('@/components/tools/LoanCalculator').then(mod => mod.LoanCalculator)),
  'percentage-calculator': dynamic(() => import('@/components/tools/PercentageCalculator').then(mod => mod.PercentageCalculator)),
  'time-zone-converter': dynamic(() => import('@/components/tools/TimeZoneConverter').then(mod => mod.TimeZoneConverter)),
  'unix-timestamp-converter': dynamic(() => import('@/components/tools/UnixTimestampConverter').then(mod => mod.UnixTimestampConverter)),
  'html-minifier': dynamic(() => import('@/components/tools/HtmlMinifier').then(mod => mod.HtmlMinifier)),
  'javascript-minifier': dynamic(() => import('@/components/tools/JavascriptMinifier').then(mod => mod.JavascriptMinifier)),
  'sql-formatter': dynamic(() => import('@/components/tools/SqlFormatter').then(mod => mod.SqlFormatter)),
  'uuid-generator': dynamic(() => import('@/components/tools/UuidGenerator').then(mod => mod.UuidGenerator)),
  'youtube-video-downloader': dynamic(() => import('@/components/tools/YoutubeVideoDownloader').then(mod => mod.YoutubeVideoDownloader)),
  'x-video-downloader': dynamic(() => import('@/components/tools/XVideoDownloader').then(mod => mod.XVideoDownloader)),
  'instagram-video-downloader': dynamic(() => import('@/components/tools/InstagramVideoDownloader').then(mod => mod.InstagramVideoDownloader)),
  'threads-video-downloader': dynamic(() => import('@/components/tools/ThreadsVideoDownloader').then(mod => mod.ThreadsVideoDownloader)),
  'linkedin-video-downloader': dynamic(() => import('@/components/tools/LinkedinVideoDownloader').then(mod => mod.LinkedinVideoDownloader)),
  'pinterest-video-downloader': dynamic(() => import('@/components/tools/PinterestVideoDownloader').then(mod => mod.PinterestVideoDownloader)),
  'unlock-pdf': dynamic(() => import('@/components/tools/UnlockPdf').then(mod => mod.UnlockPdf)),
  'lock-pdf': dynamic(() => import('@/components/tools/LockPdf').then(mod => mod.LockPdf)),
  'pdf-page-reorder': dynamic(() => import('@/components/tools/PdfPageReorder').then(mod => mod.PdfPageReorder)),
  'pdf-page-counter': dynamic(() => import('@/components/tools/PdfPageCounter').then(mod => mod.PdfPageCounter)),
  'pdf-page-numberer': dynamic(() => import('@/components/tools/PdfPageNumberer').then(mod => mod.PdfPageNumberer)),
  'pdf-page-remover': dynamic(() => import('@/components/tools/PdfPageRemover').then(mod => mod.PdfPageRemover)),
  'pdf-organizer': dynamic(() => import('@/components/tools/PdfOrganizer').then(mod => mod.PdfOrganizer)),
  'website-screenshot': dynamic(() => import('@/components/tools/WebsiteScreenshot').then(mod => mod.WebsiteScreenshot)),
  'what-is-my-browser': dynamic(() => import('@/components/tools/WhatIsMyBrowser').then(mod => mod.WhatIsMyBrowser)),
  'negative-marking-calculator': dynamic(() => import('@/components/tools/NegativeMarkingCalculator').then(mod => mod.NegativeMarkingCalculator)),
  'youtube-channel-banner-downloader': dynamic(() => import('@/components/tools/YouTubeChannelBannerDownloader').then(mod => mod.YouTubeChannelBannerDownloader)),
  'youtube-channel-logo-downloader': dynamic(() => import('@/components/tools/YouTubeChannelLogoDownloader').then(mod => mod.YouTubeChannelLogoDownloader)),
  'youtube-video-description-extractor': dynamic(() => import('@/components/tools/YouTubeVideoDescriptionExtractor').then(mod => mod.YouTubeVideoDescriptionExtractor)),
  'youtube-video-title-extractor': dynamic(() => import('@/components/tools/YouTubeVideoTitleExtractor').then(mod => mod.YouTubeVideoTitleExtractor)),
  'youtube-video-thumbnail-downloader': dynamic(() => import('@/components/tools/YouTubeVideoThumbnailDownloader').then(mod => mod.YouTubeVideoThumbnailDownloader)),
  'youtube-region-restriction-checker': dynamic(() => import('@/components/tools/YouTubeRegionRestrictionChecker').then(mod => mod.YouTubeRegionRestrictionChecker)),
  'google-drive-direct-link-generator': dynamic(() => import('@/components/tools/GoogleDriveDirectLinkGenerator').then(mod => mod.GoogleDriveDirectLinkGenerator)),
  'dropbox-direct-link-generator': dynamic(() => import('@/components/tools/DropboxDirectLinkGenerator').then(mod => mod.DropboxDirectLinkGenerator)),
  'onedrive-direct-link-generator': dynamic(() => import('@/components/tools/OneDriveDirectLinkGenerator').then(mod => mod.OneDriveDirectLinkGenerator)),
  'nsdl-pan-card-photo-and-signature-resizer': dynamic(() => import('@/components/tools/NSDLPANCardPhotoAndSignatureResizer').then(mod => mod.NSDLPANCardPhotoAndSignatureResizer)),
  'uti-pan-card-photo-and-signature-resizer': dynamic(() => import('@/components/tools/UTIPANCardPhotoAndSignatureResizer').then(mod => mod.UTIPANCardPhotoAndSignatureResizer)),
  'prn-to-pdf': dynamic(() => import('@/components/tools/PRNToPDF').then(mod => mod.PRNToPDF)),
  'image-to-pdf': dynamic(() => import('@/components/tools/ImageToPdf').then(mod => mod.ImageToPdf)),
  'pdf-signer': dynamic(() => import('@/components/tools/PdfSigner').then(mod => mod.PdfSigner)),
  'marks-to-percentage-calculator': dynamic(() => import('@/components/tools/MarksToPercentageCalculator').then(mod => mod.MarksToPercentageCalculator)),
  'srm-to-cgpa-calculator': dynamic(() => import('@/components/tools/SrmToCgpaCalculator').then(mod => mod.SrmToCgpaCalculator)),
  'cgpa-to-marks-calculator': dynamic(() => import('@/components/tools/CgpaToMarksCalculator').then(mod => mod.CgpaToMarksCalculator)),
  'gpa-to-percentage-converter': dynamic(() => import('@/components/tools/GpaToPercentageConverter').then(mod => mod.GpaToPercentageConverter)),
  'gpa-to-cgpa-calculator': dynamic(() => import('@/components/tools/GpaToCgpaCalculator').then(mod => mod.GpaToCgpaCalculator)),
  'percentage-to-cgpa-converter': dynamic(() => import('@/components/tools/PercentageToCgpaConverter').then(mod => mod.PercentageToCgpaConverter)),
  'cgpa-to-gpa-converter': dynamic(() => import('@/components/tools/CgpaToGpaConverter').then(mod => mod.CgpaToGpaConverter)),
  'text-encryption-decryption': dynamic(() => import('@/components/tools/TextEncryptionDecryption').then(mod => mod.TextEncryptionDecryption)),
  'password-strength-checker': dynamic(() => import('@/components/tools/PasswordStrengthChecker').then(mod => mod.PasswordStrengthChecker)),
  'sha256-hash-generator': dynamic(() => import('@/components/tools/Sha256HashGenerator').then(mod => mod.Sha256HashGenerator)),
  'universal-hash-generator': dynamic(() => import('@/components/tools/UniversalHashGenerator').then(mod => mod.UniversalHashGenerator)),
  'aes-encryption-decryption': dynamic(() => import('@/components/tools/AesEncryptionDecryption').then(mod => mod.AesEncryptionDecryption)),
  'universal-file-converter': dynamic(() => import('@/components/tools/UniversalFileConverter').then(mod => mod.UniversalFileConverter)),
  'image-shape-converter': dynamic(() => import('@/components/tools/ImageShapeConverter').then(mod => mod.ImageShapeConverter)),
  'morse-to-text-translator': dynamic(() => import('@/components/tools/MorseToTextTranslator').then(mod => mod.MorseToTextTranslator)),
  'text-to-morse-code': dynamic(() => import('@/components/tools/TextToMorseCode').then(mod => mod.TextToMorseCode)),
  'cryptocurrency-converter': dynamic(() => import('@/components/tools/CryptocurrencyConverter').then(mod => mod.CryptocurrencyConverter)),
  'barcode-generator': dynamic(() => import('@/components/tools/BarcodeGenerator').then(mod => mod.BarcodeGenerator)),
  'currency-converter': dynamic(() => import('@/components/tools/CurrencyConverter').then(mod => mod.CurrencyConverter)),
  'credit-card-interest-calculator': dynamic(() => import('@/components/tools/CreditCardInterestCalculator').then(mod => mod.CreditCardInterestCalculator)),
  'image-metadata-viewer': dynamic(() => import('@/components/tools/ImageMetadataViewer').then(mod => mod.ImageMetadataViewer)),
  'ai-code-generator': dynamic(() => import('@/components/tools/AiCodeGenerator').then(mod => mod.AiCodeGenerator)),
  'ai-rewriter': dynamic(() => import('@/components/tools/AiRewriter').then(mod => mod.AiRewriter)),
  'image-quality-enhancer': dynamic(() => import('@/components/tools/ImageQualityEnhancer').then(mod => mod.ImageQualityEnhancer)),
  'ai-web-content-summarizer': dynamic(() => import('@/components/tools/AiWebContentSummarizer').then(mod => mod.AiWebContentSummarizer)),
  'flip-image': dynamic(() => import('@/components/tools/FlipImage').then(mod => mod.FlipImage)),
  'ico-converter': dynamic(() => import('@/components/tools/IcoConverter').then(mod => mod.IcoConverter)),
  'ai-seo-keyword-generator': dynamic(() => import('@/components/tools/AiSeoKeywordGenerator').then(mod => mod.AiSeoKeywordGenerator)),
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


interface ToolPageClientProps {
  tool: Tool;
  toolReviews: Review[];
  settings: AppSettings | null;
  popularTools: Tool[];
  recentPosts: Post[];
}

export function ToolPageClient({
  tool,
  toolReviews,
  settings,
  popularTools,
  recentPosts,
}: ToolPageClientProps) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      addUserActivity(user.uid, 'tool_usage', { name: tool.name, path: `/tools/${tool.slug}` });
    }
  }, [user, tool.name, tool.slug]);

  const ToolComponent = toolComponents[tool.slug];
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  const sidebarSettings = settings?.sidebar?.toolSidebar;

  const renderToolContent = () => {
    switch (tool.status) {
      case 'Maintenance':
        return <ToolStatusDisplay icon={Construction} title="Under Maintenance" description="This tool is currently undergoing maintenance to improve its features. Please check back later." />;
      case 'Coming Soon':
        return <ToolStatusDisplay icon={Sparkles} title="Coming Soon!" description="Our team is hard at work on this new tool. It will be available shortly!" />;
      default:
        return ToolComponent ? <ToolComponent /> : (
          <div className="flex h-full items-center justify-center">
            <p className="text-lg text-muted-foreground">Tool interface coming soon!</p>
          </div>
        );
    }
  };

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
                                <h3 className="font-semibold">Provide Input</h3>
                                <p className="text-muted-foreground">Paste your text, upload your file, or enter the required data in the designated fields.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">2</div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Configure Settings</h3>
                                <p className="text-muted-foreground">Adjust any available options, such as language, format, or quality, to tailor the output to your needs.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">3</div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Process Your Request</h3>
                                <p className="text-muted-foreground">Click the primary action button (e.g., "Generate", "Convert", "Calculate") to start the process.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">4</div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Get Your Results</h3>
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
            </CardContent>
          </Card>
          
          <AdPlaceholder adSlotId="toolpage-banner-bottom" adSettings={settings?.advertisement ?? null} className="my-6" />

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

    
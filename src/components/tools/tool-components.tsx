
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Tool } from '@/ai/flows/tool-management.types';
import type { Review } from '@/ai/flows/review-management.types';
import type { AdvertisementSettings } from '@/ai/flows/settings-management.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/tools/ReviewForm';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle2, Cpu, DownloadCloud, ListOrdered, Sparkles, Star, Zap, BrainCircuit, Construction, ShieldCheck, MousePointerClick } from 'lucide-react';
import { addUserActivity } from '@/ai/flows/user-activity';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

const toPascalCase = (slug: string) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

// Dynamically import components to avoid bundling all of them at once.
const dynamicToolComponents: { [key: string]: React.ComponentType<any> } = {
  AdMobRevenueCalculator: dynamic(() => import('./AdMobRevenueCalculator').then(mod => mod.AdMobRevenueCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  AdSenseRevenueCalculator: dynamic(() => import('./AdSenseRevenueCalculator').then(mod => mod.AdSenseRevenueCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  AgeCalculator: dynamic(() => import('./AgeCalculator').then(mod => mod.AgeCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  AmazonShippingLabelCropper: dynamic(() => import('./AmazonShippingLabelCropper').then(mod => mod.AmazonShippingLabelCropper), { loading: () => <Skeleton className="h-48 w-full" /> }),
  BarcodeGenerator: dynamic(() => import('./BarcodeGenerator').then(mod => mod.BarcodeGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  BarcodeScanner: dynamic(() => import('./BarcodeScanner').then(mod => mod.BarcodeScanner), { loading: () => <Skeleton className="h-48 w-full" /> }),
  Base64Converter: dynamic(() => import('./Base64Converter').then(mod => mod.Base64Converter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  BinaryToText: dynamic(() => import('./BinaryToText').then(mod => mod.BinaryToText), { loading: () => <Skeleton className="h-48 w-full" /> }),
  BmiCalculator: dynamic(() => import('./BmiCalculator').then(mod => mod.BmiCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CaseConverter: dynamic(() => import('./CaseConverter').then(mod => mod.CaseConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CgpaToGpaConverter: dynamic(() => import('./CgpaToGpaConverter').then(mod => mod.CgpaToGpaConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CgpaToMarksCalculator: dynamic(() => import('./CgpaToMarksCalculator').then(mod => mod.CgpaToMarksCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ColorPicker: dynamic(() => import('./ColorPicker').then(mod => mod.ColorPicker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CompressPdf: dynamic(() => import('./CompressPdf').then(mod => mod.CompressPdf), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CreditCardInterestCalculator: dynamic(() => import('./CreditCardInterestCalculator').then(mod => mod.CreditCardInterestCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CrontabGenerator: dynamic(() => import('./CrontabGenerator').then(mod => mod.CrontabGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CssMinifier: dynamic(() => import('./CssMinifier').then(mod => mod.CssMinifier), { loading: () => <Skeleton className="h-48 w-full" /> }),
  CurrencyConverter: dynamic(() => import('./CurrencyConverter').then(mod => mod.CurrencyConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  DateCalculator: dynamic(() => import('./DateCalculator').then(mod => mod.DateCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  DiscountCalculator: dynamic(() => import('./DiscountCalculator').then(mod => mod.DiscountCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  DropboxDirectLinkGenerator: dynamic(() => import('./DropboxDirectLinkGenerator').then(mod => mod.DropboxDirectLinkGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ExcelToPdf: dynamic(() => import('./ExcelToPdf').then(mod => mod.ExcelToPdf), { loading: () => <Skeleton className="h-48 w-full" /> }),
  FaviconChecker: dynamic(() => import('./FaviconChecker').then(mod => mod.FaviconChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  FindAndReplace: dynamic(() => import('./FindAndReplace').then(mod => mod.FindAndReplace), { loading: () => <Skeleton className="h-48 w-full" /> }),
  FindIfscCodeByBankAndCity: dynamic(() => import('./FindIfscCodeByBankAndCity').then(mod => mod.FindIfscCodeByBankAndCity), { loading: () => <Skeleton className="h-48 w-full" /> }),
  FlipkartShippingLabelCropper: dynamic(() => import('./FlipkartShippingLabelCropper').then(mod => mod.FlipkartShippingLabelCropper), { loading: () => <Skeleton className="h-48 w-full" /> }),
  FlipImage: dynamic(() => import('./FlipImage').then(mod => mod.FlipImage), { loading: () => <Skeleton className="h-48 w-full" /> }),
  FuelCostCalculator: dynamic(() => import('./FuelCostCalculator').then(mod => mod.FuelCostCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  GpaCalculator: dynamic(() => import('./GpaCalculator').then(mod => mod.GpaCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  GpaToCgpaCalculator: dynamic(() => import('./GpaToCgpaCalculator').then(mod => mod.GpaToCgpaCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  GpaToPercentageConverter: dynamic(() => import('./GpaToPercentageConverter').then(mod => mod.GpaToPercentageConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  GstCalculator: dynamic(() => import('./GSTCalculator').then(mod => mod.GSTCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  GoogleDriveDirectLinkGenerator: dynamic(() => import('./GoogleDriveDirectLinkGenerator').then(mod => mod.GoogleDriveDirectLinkGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  HtmlMinifier: dynamic(() => import('./HtmlMinifier').then(mod => mod.HtmlMinifier), { loading: () => <Skeleton className="h-48 w-full" /> }),
  HTMLToMarkdownConverter: dynamic(() => import('./HtmlToMarkdownConverter').then(mod => mod.HtmlToMarkdownConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  IcoConverter: dynamic(() => import('./IcoConverter').then(mod => mod.IcoConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  IfscCodeToBankDetails: dynamic(() => import('./IfscCodeToBankDetails').then(mod => mod.IfscCodeToBankDetails), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageColorExtractor: dynamic(() => import('./ImageColorExtractor').then(mod => mod.ImageColorExtractor), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageCompressor: dynamic(() => import('./ImageCompressor').then(mod => mod.ImageCompressor), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageConverter: dynamic(() => import('./ImageConverter').then(mod => mod.ImageConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageCropper: dynamic(() => import('./ImageCropper').then(mod => mod.ImageCropper), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageResizer: dynamic(() => import('./ImageResizer').then(mod => mod.ImageResizer), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageShapeConverter: dynamic(() => import('./ImageShapeConverter').then(mod => mod.ImageShapeConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageToBase64: dynamic(() => import('./ImageToBase64').then(mod => mod.ImageToBase64), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageWatermarkAdder: dynamic(() => import('./ImageWatermarkAdder').then(mod => mod.ImageWatermarkAdder), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageMetadataViewer: dynamic(() => import('./ImageMetadataViewer').then(mod => mod.ImageMetadataViewer), { loading: () => <Skeleton className="h-48 w-full" /> }),
  InterestCalculator: dynamic(() => import('./InterestCalculator').then(mod => mod.InterestCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  JavascriptMinifier: dynamic(() => import('./JavascriptMinifier').then(mod => mod.JavascriptMinifier), { loading: () => <Skeleton className="h-48 w-full" /> }),
  JsonFormatter: dynamic(() => import('./JsonFormatter').then(mod => mod.JsonFormatter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  KeywordDensityChecker: dynamic(() => import('./KeywordDensityChecker').then(mod => mod.KeywordDensityChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  LoanCalculator: dynamic(() => import('./LoanCalculator').then(mod => mod.LoanCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  LockPdf: dynamic(() => import('./LockPdf').then(mod => mod.LockPdf), { loading: () => <Skeleton className="h-48 w-full" /> }),
  LoremIpsumGenerator: dynamic(() => import('./LoremIpsumGenerator').then(mod => mod.LoremIpsumGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  MarksToPercentageCalculator: dynamic(() => import('./MarksToPercentageCalculator').then(mod => mod.MarksToPercentageCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  MeeshoShippingLabelCropper: dynamic(() => import('./MeeshoShippingLabelCropper').then(mod => mod.MeeshoShippingLabelCropper), { loading: () => <Skeleton className="h-48 w-full" /> }),
  MetaTagGenerator: dynamic(() => import('./MetaTagGenerator').then(mod => mod.MetaTagGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  MorseToTextTranslator: dynamic(() => import('./MorseToTextTranslator').then(mod => mod.MorseToTextTranslator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  MyntraShippingLabelCropper: dynamic(() => import('./MyntraShippingLabelCropper').then(mod => mod.MyntraShippingLabelCropper), { loading: () => <Skeleton className="h-48 w-full" /> }),
  NegativeMarkingCalculator: dynamic(() => import('./NegativeMarkingCalculator').then(mod => mod.NegativeMarkingCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  NSDLPANCardPhotoAndSignatureResizer: dynamic(() => import('./NSDLPANCardPhotoAndSignatureResizer').then(mod => mod.NSDLPANCardPhotoAndSignatureResizer), { loading: () => <Skeleton className="h-48 w-full" /> }),
  OneDriveDirectLinkGenerator: dynamic(() => import('./OneDriveDirectLinkGenerator').then(mod => mod.OneDriveDirectLinkGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PasswordGenerator: dynamic(() => import('./PasswordGenerator').then(mod => mod.PasswordGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PasswordStrengthChecker: dynamic(() => import('./PasswordStrengthChecker').then(mod => mod.PasswordStrengthChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfMerger: dynamic(() => import('./PdfMerger').then(mod => mod.PdfMerger), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfOrganizer: dynamic(() => import('./PdfOrganizer').then(mod => mod.PdfOrganizer), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfPageCounter: dynamic(() => import('./PdfPageCounter').then(mod => mod.PdfPageCounter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfPageNumberer: dynamic(() => import('./PdfPageNumberer').then(mod => mod.PdfPageNumberer), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfPageRemover: dynamic(() => import('./PdfPageRemover').then(mod => mod.PdfPageRemover), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfPageReorder: dynamic(() => import('./PdfPageReorder').then(mod => mod.PdfPageReorder), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfSigner: dynamic(() => import('./PdfSigner').then(mod => mod.PdfSigner), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfSplitter: dynamic(() => import('./PdfSplitter').then(mod => mod.PdfSplitter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfToJpg: dynamic(() => import('./PdfToJpg').then(mod => mod.PdfToJpg), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PdfToWord: dynamic(() => import('./PdfToWord').then(mod => mod.PdfToWord), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PercentageCalculator: dynamic(() => import('./PercentageCalculator').then(mod => mod.PercentageCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PercentageToCgpaConverter: dynamic(() => import('./PercentageToCgpaConverter').then(mod => mod.PercentageToCgpaConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PptToPdf: dynamic(() => import('./PptToPdf').then(mod => mod.PptToPdf), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PRNToPDF: dynamic(() => import('./PRNToPDF').then(mod => mod.PRNToPDF), { loading: () => <Skeleton className="h-48 w-full" /> }),
  QrCodeGenerator: dynamic(() => import('./QrCodeGenerator').then(mod => mod.QrCodeGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  QrCodeScanner: dynamic(() => import('./QrCodeScanner').then(mod => mod.QrCodeScanner), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RandomWordGenerator: dynamic(() => import('./RandomWordGenerator').then(mod => mod.RandomWordGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ReadabilityScoreChecker: dynamic(() => import('./ReadabilityScoreChecker').then(mod => mod.ReadabilityScoreChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RemoveExtraSpaces: dynamic(() => import('./RemoveExtraSpaces').then(mod => mod.RemoveExtraSpaces), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RedirectChecker: dynamic(() => import('./RedirectChecker').then(mod => mod.RedirectChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ReverseText: dynamic(() => import('./ReverseText').then(mod => mod.ReverseText), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RobotsTxtGenerator: dynamic(() => import('./RobotsTxtGenerator').then(mod => mod.RobotsTxtGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RotateImage: dynamic(() => import('./RotateImage').then(mod => mod.RotateImage), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RotatePdf: dynamic(() => import('./RotatePdf').then(mod => mod.RotatePdf), { loading: () => <Skeleton className="h-48 w-full" /> }),
  SchemaGenerator: dynamic(() => import('./SchemaGenerator').then(mod => mod.SchemaGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  SerpChecker: dynamic(() => import('./SerpChecker').then(mod => mod.SerpChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  Sha256HashGenerator: dynamic(() => import('./Sha256HashGenerator').then(mod => mod.Sha256HashGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  SrmToCgpaCalculator: dynamic(() => import('./SrmToCgpaCalculator').then(mod => mod.SrmToCgpaCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  SqlFormatter: dynamic(() => import('./SqlFormatter').then(mod => mod.SqlFormatter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TextRepeater: dynamic(() => import('./TextRepeater').then(mod => mod.TextRepeater), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TextToBinary: dynamic(() => import('./TextToBinary').then(mod => mod.TextToBinary), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TextToMorseCode: dynamic(() => import('./TextToMorseCode').then(mod => mod.TextToMorseCode), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TextEncryptionDecryption: dynamic(() => import('./TextEncryptionDecryption').then(mod => mod.TextEncryptionDecryption), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TextRecognizer: dynamic(() => import('./TextRecognizer').then(mod => mod.TextRecognizer), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TimeZoneConverter: dynamic(() => import('./TimeZoneConverter').then(mod => mod.TimeZoneConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TitleTagChecker: dynamic(() => import('./TitleTagChecker').then(mod => mod.TitleTagChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  UnixTimestampConverter: dynamic(() => import('./UnixTimestampConverter').then(mod => mod.UnixTimestampConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  UniversalHashGenerator: dynamic(() => import('./UniversalHashGenerator').then(mod => mod.UniversalHashGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  UnlockPdf: dynamic(() => import('./UnlockPdf').then(mod => mod.UnlockPdf), { loading: () => <Skeleton className="h-48 w-full" /> }),
  UuidGenerator: dynamic(() => import('./UuidGenerator').then(mod => mod.UuidGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  UTIPANCardPhotoAndSignatureResizer: dynamic(() => import('./UTIPANCardPhotoAndSignatureResizer').then(mod => mod.UTIPANCardPhotoAndSignatureResizer), { loading: () => <Skeleton className="h-48 w-full" /> }),
  WebsiteScreenshot: dynamic(() => import('./WebsiteScreenshot').then(mod => mod.WebsiteScreenshot), { loading: () => <Skeleton className="h-48 w-full" /> }),
  WebsiteWordCounter: dynamic(() => import('./WebsiteWordCounter').then(mod => mod.WebsiteWordCounter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  WhatIsMyBrowser: dynamic(() => import('./WhatIsMyBrowser').then(mod => mod.WhatIsMyBrowser), { loading: () => <Skeleton className="h-48 w-full" /> }),
  WordCounter: dynamic(() => import('./WordCounter').then(mod => mod.WordCounter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  WordToPdf: dynamic(() => import('./WordToPdf').then(mod => mod.WordToPdf), { loading: () => <Skeleton className="h-48 w-full" /> }),
  XmlSitemapGenerator: dynamic(() => import('./XmlSitemapGenerator').then(mod => mod.XmlSitemapGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  YouTubeChannelBannerDownloader: dynamic(() => import('./YouTubeChannelBannerDownloader').then(mod => mod.YouTubeChannelBannerDownloader), { loading: () => <Skeleton className="h-48 w-full" /> }),
  YouTubeChannelLogoDownloader: dynamic(() => import('./YouTubeChannelLogoDownloader').then(mod => mod.YouTubeChannelLogoDownloader), { loading: () => <Skeleton className="h-48 w-full" /> }),
  YouTubeRegionRestrictionChecker: dynamic(() => import('./YouTubeRegionRestrictionChecker').then(mod => mod.YouTubeRegionRestrictionChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  YouTubeVideoDescriptionExtractor: dynamic(() => import('./YouTubeVideoDescriptionExtractor').then(mod => mod.YouTubeVideoDescriptionExtractor), { loading: () => <Skeleton className="h-48 w-full" /> }),
  YouTubeVideoThumbnailDownloader: dynamic(() => import('./YouTubeVideoThumbnailDownloader').then(mod => mod.YouTubeVideoThumbnailDownloader), { loading: () => <Skeleton className="h-48 w-full" /> }),
  YouTubeVideoTitleExtractor: dynamic(() => import('./YouTubeVideoTitleExtractor').then(mod => mod.YouTubeVideoTitleExtractor), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ProfitLossCalculator: dynamic(() => import('./ProfitLossCalculator').then(mod => mod.ProfitLossCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  SIPCalculator: dynamic(() => import('./SIPCalculator').then(mod => mod.SIPCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  FDCalculator: dynamic(() => import('./FDCalculator').then(mod => mod.FDCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  MutualFundCalculator: dynamic(() => import('./MutualFundCalculator').then(mod => mod.MutualFundCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  SalesTaxCalculator: dynamic(() => import('./SalesTaxCalculator').then(mod => mod.SalesTaxCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  TDSCalculator: dynamic(() => import('./TDSCalculator').then(mod => mod.TDSCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  ImageAspectRatioCalculator: dynamic(() => import('./ImageAspectRatioCalculator').then(mod => mod.ImageAspectRatioCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  UrlEncoderDecoder: dynamic(() => import('./UrlEncoderDecoder').then(mod => mod.UrlEncoderDecoder), { loading: () => <Skeleton className="h-48 w-full" /> }),
  SpellingChecker: dynamic(() => import('./SpellingChecker').then(mod => mod.SpellingChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  WhatsChatUrlGenerator: dynamic(() => import('./WhatsChatUrlGenerator').then(mod => mod.WhatsChatUrlGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  WhatsAppGroupUrlGenerator: dynamic(() => import('./WhatsAppGroupUrlGenerator').then(mod => mod.WhatsAppGroupUrlGenerator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  InternetSpeedTester: dynamic(() => import('./InternetSpeedTester').then(mod => mod.InternetSpeedTester), { loading: () => <Skeleton className="h-48 w-full" /> }),
  PageSizeChecker: dynamic(() => import('./PageSizeChecker').then(mod => mod.PageSizeChecker), { loading: () => <Skeleton className="h-48 w-full" /> }),
  DeviceInformationDetector: dynamic(() => import('./DeviceInformationDetector').then(mod => mod.DeviceInformationDetector), { loading: () => <Skeleton className="h-48 w-full" /> }),
  NumbersToWord: dynamic(() => import('./NumbersToWord').then(mod => mod.NumbersToWord), { loading: () => <Skeleton className="h-48 w-full" /> }),
  EmojiRemover: dynamic(() => import('./EmojiRemover').then(mod => mod.EmojiRemover), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RomanToNumberConverter: dynamic(() => import('./RomanToNumberConverter').then(mod => mod.RomanToNumberConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  NumberToRomanConverter: dynamic(() => import('./NumberToRomanConverter').then(mod => mod.NumberToRomanConverter), { loading: () => <Skeleton className="h-48 w-full" /> }),
  RdCalculator: dynamic(() => import('./RdCalculator').then(mod => mod.RdCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  NpsCalculator: dynamic(() => import('./NpsCalculator').then(mod => mod.NpsCalculator), { loading: () => <Skeleton className="h-48 w-full" /> }),
  AesEncryptionDecryption: dynamic(() => import('./AesEncryptionAndDecryption').then(mod => mod.AesEncryptionDecryption), { loading: () => <Skeleton className="h-48 w-full" /> }),
};


const ToolStatusDisplay = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-muted/50 rounded-lg">
        <Icon className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

interface ToolComponentRendererProps {
  tool: Tool;
  toolReviews: Review[];
  adSettings: AdvertisementSettings | null;
  sidebar: React.ReactNode;
}

export function ToolComponentRenderer({ tool, toolReviews, adSettings, sidebar }: ToolComponentRendererProps) {
    const { user } = useAuth();
    
    useEffect(() => {
        if (user && tool) {
            addUserActivity(user.uid, 'tool_usage', { name: tool.name, path: `/tools/${tool.slug}` });
        }
    }, [user, tool]);
    
    const ToolComponent = dynamicToolComponents[toPascalCase(tool.slug)];

    const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;

    const renderToolContent = () => {
        switch (tool.status) {
            case 'Maintenance':
                return <ToolStatusDisplay icon={Construction} title="Under Maintenance" description="This tool is currently undergoing maintenance to improve its features. Please check back later." />;
            case 'Coming Soon':
                return <ToolStatusDisplay icon={Sparkles} title="Coming Soon!" description="Our team is hard at work on this new tool. It will be available shortly!" />;
            default:
                if (ToolComponent) {
                    return <ToolComponent />;
                }
                return <ToolStatusDisplay icon={Construction} title="Tool Not Found" description="The interface for this tool could not be loaded. It may be under development." />;
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
            <AdPlaceholder adSlotId="toolpage-banner-top" adSettings={adSettings} className="mb-6" />
            <div className="flex flex-col lg:flex-row lg:gap-8">
                <div className="flex-1 space-y-8">
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
                    <AdPlaceholder adSlotId="toolpage-in-description" adSettings={adSettings} className="my-6" />
                    </CardContent>
                </Card>
                
                {tool.howToUse && tool.howToUse.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListOrdered /> How to use {tool.name}?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tool.howToUse.map((step, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">{index + 1}</div>
                                        <p className="text-muted-foreground">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                <AdPlaceholder adSlotId="toolpage-banner-bottom" adSettings={adSettings} />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 /> Why Choose Our Tools?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="text-primary"/>Secure & Reliable</h3><p className="text-sm text-muted-foreground mt-1">Your data privacy is our priority. All tools run securely, and we never store your input data.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><Zap className="text-primary"/>Blazing Fast</h3><p className="text-sm text-muted-foreground mt-1">Get your results instantly without any unnecessary delays. Our tools are optimized for speed.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><MousePointerClick className="text-primary"/>User-Friendly Interface</h3><p className="text-sm text-muted-foreground mt-1">No complicated setups. Our tools are designed to be intuitive and easy for everyone.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><Cpu className="text-primary"/>AI-Powered</h3><p className="text-sm text-muted-foreground mt-1">Many of our tools leverage cutting-edge AI to provide smarter, more accurate, and creative results.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><DownloadCloud className="text-primary"/>No Installation Needed</h3><p className="text-sm text-muted-foreground mt-1">All our tools run directly in your browser. There is nothing to download or install on your device.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="text-primary"/>Constantly Evolving</h3><p className="text-sm text-muted-foreground mt-1">We are always adding new tools and improving existing ones based on user feedback and new technology.</p></Card>
                    </CardContent>
                </Card>
                
                <Card>
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
                {sidebar}
            </div>
        </div>
    );
}


'use client';

import { useEffect, useMemo } from 'react';
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

// Tool Components
import { AdMobRevenueCalculator } from './AdMobRevenueCalculator';
import { AdSenseRevenueCalculator } from './AdSenseRevenueCalculator';
import { AgeCalculator } from './AgeCalculator';
import { AmazonShippingLabelCropper } from './AmazonShippingLabelCropper';
import { BarcodeGenerator } from './BarcodeGenerator';
import { BarcodeScanner } from './BarcodeScanner';
import { Base64Converter } from './Base64Converter';
import { BinaryToText } from './BinaryToText';
import { BmiCalculator } from './BmiCalculator';
import { CaseConverter } from './CaseConverter';
import { CgpaToGpaConverter } from './CgpaToGpaConverter';
import { CgpaToMarksCalculator } from './CgpaToMarksCalculator';
import { ColorPicker } from './ColorPicker';
import { CompressPdf } from './CompressPdf';
import { CreditCardInterestCalculator } from './CreditCardInterestCalculator';
import { CrontabGenerator } from './CrontabGenerator';
import { CssMinifier } from './CssMinifier';
import { CurrencyConverter } from './CurrencyConverter';
import { DateCalculator } from './DateCalculator';
import { DiscountCalculator } from './DiscountCalculator';
import { DropboxDirectLinkGenerator } from './DropboxDirectLinkGenerator';
import { ExcelToPdf } from './ExcelToPdf';
import { FaviconChecker } from './FaviconChecker';
import { FindAndReplace } from './FindAndReplace';
import { FindIfscCodeByBankAndCity } from './FindIfscCodeByBankAndCity';
import { FlipkartShippingLabelCropper } from './FlipkartShippingLabelCropper';
import { FlipImage } from './FlipImage';
import { FuelCostCalculator } from './FuelCostCalculator';
import { GpaCalculator } from './GpaCalculator';
import { GpaToCgpaCalculator } from './GpaToCgpaCalculator';
import { GpaToPercentageConverter } from './GpaToPercentageConverter';
import { GstCalculator } from './GSTCalculator';
import { GoogleDriveDirectLinkGenerator } from './GoogleDriveDirectLinkGenerator';
import { HtmlMinifier } from './HtmlMinifier';
import { HTMLToMarkdownConverter } from './HtmlToMarkdownConverter';
import { IcoConverter } from './IcoConverter';
import { IfscCodeToBankDetails } from './IfscCodeToBankDetails';
import { ImageColorExtractor } from './ImageColorExtractor';
import { ImageCompressor } from './ImageCompressor';
import { ImageConverter } from './ImageConverter';
import { ImageCropper } from './ImageCropper';
import { ImageResizer } from './ImageResizer';
import { ImageShapeConverter } from './ImageShapeConverter';
import { ImageToBase64 } from './ImageToBase64';
import { ImageWatermarkAdder } from './ImageWatermarkAdder';
import { ImageMetadataViewer } from './ImageMetadataViewer';
import { InterestCalculator } from './InterestCalculator';
import { JavascriptMinifier } from './JavascriptMinifier';
import { JsonFormatter } from './JsonFormatter';
import { KeywordDensityChecker } from './KeywordDensityChecker';
import { LoanCalculator } from './LoanCalculator';
import { LockPdf } from './LockPdf';
import { LoremIpsumGenerator } from './LoremIpsumGenerator';
import { MarksToPercentageCalculator } from './MarksToPercentageCalculator';
import { MeeshoShippingLabelCropper } from './MeeshoShippingLabelCropper';
import { MetaTagGenerator } from './MetaTagGenerator';
import { MorseToTextTranslator } from './MorseToTextTranslator';
import { MyntraShippingLabelCropper } from './MyntraShippingLabelCropper';
import { NegativeMarkingCalculator } from './NegativeMarkingCalculator';
import { NsdlpanCardPhotoAndSignatureResizer } from './NSDLPANCardPhotoAndSignatureResizer';
import { OneDriveDirectLinkGenerator } from './OneDriveDirectLinkGenerator';
import { PasswordGenerator } from './PasswordGenerator';
import { PasswordStrengthChecker } from './PasswordStrengthChecker';
import { PdfMerger } from './PdfMerger';
import { PdfOrganizer } from './PdfOrganizer';
import { PdfPageCounter } from './PdfPageCounter';
import { PdfPageNumberer } from './PdfPageNumberer';
import { PdfPageRemover } from './PdfPageRemover';
import { PdfPageReorder } from './PdfPageReorder';
import { PdfSigner } from './PdfSigner';
import { PdfSplitter } from './PdfSplitter';
import { PdfToJpg } from './PdfToJpg';
import { PdfToWord } from './PdfToWord';
import { PercentageCalculator } from './PercentageCalculator';
import { PercentageToCgpaConverter } from './PercentageToCgpaConverter';
import { PptToPdf } from './PptToPdf';
import { PrnToPdf } from './PRNToPDF';
import { QrCodeGenerator } from './QrCodeGenerator';
import { QrCodeScanner } from './QrCodeScanner';
import { RandomWordGenerator } from './RandomWordGenerator';
import { ReadabilityScoreChecker } from './ReadabilityScoreChecker';
import { RemoveExtraSpaces } from './RemoveExtraSpaces';
import { RedirectChecker } from './RedirectChecker';
import { ReverseText } from './ReverseText';
import { RobotsTxtGenerator } from './RobotsTxtGenerator';
import { RotateImage } from './RotateImage';
import { RotatePdf } from './RotatePdf';
import { SchemaGenerator } from './SchemaGenerator';
import { SerpChecker } from './SerpChecker';
import { Sha256HashGenerator } from './Sha256HashGenerator';
import { SrmToCgpaCalculator } from './SrmToCgpaCalculator';
import { SqlFormatter } from './SqlFormatter';
import { TextRepeater } from './TextRepeater';
import { TextToBinary } from './TextToBinary';
import { TextToMorseCode } from './TextToMorseCode';
import { TextEncryptionDecryption } from './TextEncryptionDecryption';
import { TextRecognizer } from './TextRecognizer';
import { TimeZoneConverter } from './TimeZoneConverter';
import { TitleTagChecker } from './TitleTagChecker';
import { UnixTimestampConverter } from './UnixTimestampConverter';
import { UniversalHashGenerator } from './UniversalHashGenerator';
import { UnlockPdf } from './UnlockPdf';
import { UuidGenerator } from './UuidGenerator';
import { UtipanCardPhotoAndSignatureResizer } from './UTIPANCardPhotoAndSignatureResizer';
import { WebsiteScreenshot } from './WebsiteScreenshot';
import { WebsiteWordCounter } from './WebsiteWordCounter';
import { WhatIsMyBrowser } from './WhatIsMyBrowser';
import { WordCounter } from './WordCounter';
import { WordToPdf } from './WordToPdf';
import { XmlSitemapGenerator } from './XmlSitemapGenerator';
import { YouTubeChannelBannerDownloader } from './YouTubeChannelBannerDownloader';
import { YouTubeChannelLogoDownloader } from './YouTubeChannelLogoDownloader';
import { YouTubeRegionRestrictionChecker } from './YouTubeRegionRestrictionChecker';
import { YouTubeVideoDescriptionExtractor } from './YouTubeVideoDescriptionExtractor';
import { YouTubeVideoThumbnailDownloader } from './YouTubeVideoThumbnailDownloader';
import { YouTubeVideoTitleExtractor } from './YouTubeVideoTitleExtractor';
import { ProfitLossCalculator } from './ProfitLossCalculator';
import { SIPCalculator } from './SIPCalculator';
import { FDCalculator } from './FDCalculator';
import { MutualFundCalculator } from './MutualFundCalculator';
import { SalesTaxCalculator } from './SalesTaxCalculator';
import { TDSCalculator } from './TDSCalculator';
import { ImageAspectRatioCalculator } from './ImageAspectRatioCalculator';
import { UrlEncoderDecoder } from './UrlEncoderDecoder';
import { SpellingChecker } from './SpellingChecker';
import { WhatsChatUrlGenerator } from './WhatsChatUrlGenerator';
import { WhatsAppGroupUrlGenerator } from './WhatsAppGroupUrlGenerator';
import { InternetSpeedTester } from './InternetSpeedTester';
import { PageSizeChecker } from './PageSizeChecker';
import { DeviceInformationDetector } from './DeviceInformationDetector';
import { NumbersToWord } from './NumbersToWord';
import { EmojiRemover } from './EmojiRemover';
import { RomanToNumberConverter } from './RomanToNumberConverter';
import { NumberToRomanConverter } from './NumberToRomanConverter';
import { RdCalculator } from './RdCalculator';
import { NpsCalculator } from './NpsCalculator';
import { AesEncryptionDecryption } from './AesEncryptionDecryption';

const toPascalCase = (slug: string) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const componentMap: { [key: string]: React.ComponentType<any> } = {
  AdMobRevenueCalculator,
  AdSenseRevenueCalculator,
  AgeCalculator,
  AmazonShippingLabelCropper,
  BarcodeGenerator,
  BarcodeScanner,
  Base64Converter,
  BinaryToText,
  BmiCalculator,
  CaseConverter,
  CgpaToGpaConverter,
  CgpaToMarksCalculator,
  ColorPicker,
  CompressPdf,
  CreditCardInterestCalculator,
  CrontabGenerator,
  CssMinifier,
  CurrencyConverter,
  DateCalculator,
  DiscountCalculator,
  DropboxDirectLinkGenerator,
  ExcelToPdf,
  FaviconChecker,
  FindAndReplace,
  FindIfscCodeByBankAndCity,
  FlipkartShippingLabelCropper,
  FlipImage,
  FuelCostCalculator,
  GpaCalculator,
  GpaToCgpaCalculator,
  GpaToPercentageConverter,
  GstCalculator,
  GoogleDriveDirectLinkGenerator,
  HtmlMinifier,
  HTMLToMarkdownConverter,
  IcoConverter,
  IfscCodeToBankDetails,
  ImageColorExtractor,
  ImageCompressor,
  ImageConverter,
  ImageCropper,
  ImageResizer,
  ImageShapeConverter,
  ImageToBase64,
  ImageWatermarkAdder,
  ImageMetadataViewer,
  InterestCalculator,
  JavascriptMinifier,
  JsonFormatter,
  KeywordDensityChecker,
  LoanCalculator,
  LockPdf,
  LoremIpsumGenerator,
  MarksToPercentageCalculator,
  MeeshoShippingLabelCropper,
  MetaTagGenerator,
  MorseToTextTranslator,
  MyntraShippingLabelCropper,
  NegativeMarkingCalculator,
  NsdlpanCardPhotoAndSignatureResizer,
  OneDriveDirectLinkGenerator,
  PasswordGenerator,
  PasswordStrengthChecker,
  PdfMerger,
  PdfOrganizer,
  PdfPageCounter,
  PdfPageNumberer,
  PdfPageRemover,
  PdfPageReorder,
  PdfSigner,
  PdfSplitter,
  PdfToJpg,
  PdfToWord,
  PercentageCalculator,
  PercentageToCgpaConverter,
  PptToPdf,
  PrnToPdf,
  QrCodeGenerator,
  QrCodeScanner,
  RandomWordGenerator,
  ReadabilityScoreChecker,
  RemoveExtraSpaces,
  RedirectChecker,
  ReverseText,
  RobotsTxtGenerator,
  RotateImage,
  RotatePdf,
  SchemaGenerator,
  SerpChecker,
  Sha256HashGenerator,
  SrmToCgpaCalculator,
  SqlFormatter,
  TextRepeater,
  TextToBinary,
  TextToMorseCode,
  TextEncryptionDecryption,
  TextRecognizer,
  TimeZoneConverter,
  TitleTagChecker,
  UnixTimestampConverter,
  UniversalHashGenerator,
  UnlockPdf,
  UuidGenerator,
  UtipanCardPhotoAndSignatureResizer,
  WebsiteScreenshot,
  WebsiteWordCounter,
  WhatIsMyBrowser,
  WordCounter,
  WordToPdf,
  XmlSitemapGenerator,
  YouTubeChannelBannerDownloader,
  YouTubeChannelLogoDownloader,
  YouTubeRegionRestrictionChecker,
  YouTubeVideoDescriptionExtractor,
  YouTubeVideoThumbnailDownloader,
  YouTubeVideoTitleExtractor,
  ProfitLossCalculator,
  SIPCalculator,
  FDCalculator,
  MutualFundCalculator,
  SalesTaxCalculator,
  TDSCalculator,
  ImageAspectRatioCalculator,
  UrlEncoderDecoder,
  SpellingChecker,
  WhatsChatUrlGenerator,
  WhatsAppGroupUrlGenerator,
  InternetSpeedTester,
  PageSizeChecker,
  DeviceInformationDetector,
  NumbersToWord,
  EmojiRemover,
  RomanToNumberConverter,
  NumberToRomanConverter,
  RdCalculator,
  NpsCalculator,
  AesEncryptionDecryption,
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
    
    const ToolComponent = componentMap[toPascalCase(tool.slug)];

    const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;

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

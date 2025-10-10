
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
import { ArrowLeft, CheckCircle2, Cpu, DownloadCloud, ListOrdered, Loader2, MousePointerClick, ShieldCheck, Sparkles, Star, Zap, BrainCircuit, Construction } from 'lucide-react';
import { addUserActivity } from '@/ai/flows/user-activity';
import dynamic from 'next/dynamic';

const toolComponents: { [key: string]: React.ComponentType } = {
  'admob-revenue-calculator': dynamic(() => import('@/components/tools/AdMobRevenueCalculator').then(mod => mod.AdMobRevenueCalculator)),
  'adsense-revenue-calculator': dynamic(() => import('@/components/tools/AdSenseRevenueCalculator').then(mod => mod.AdSenseRevenueCalculator)),
  'add-watermark-to-pdf': dynamic(() => import('@/components/tools/AddWatermarkToPdf').then(mod => mod.AddWatermarkToPdf)),
  'aes-encryption-decryption': dynamic(() => import('@/components/tools/AesEncryptionDecryption').then(mod => mod.AesEncryptionDecryption)),
  'age-calculator': dynamic(() => import('@/components/tools/AgeCalculator').then(mod => mod.AgeCalculator)),
  'amazon-shipping-label-cropper': dynamic(() => import('@/components/tools/AmazonShippingLabelCropper').then(mod => mod.AmazonShippingLabelCropper)),
  'barcode-generator': dynamic(() => import('@/components/tools/BarcodeGenerator').then(mod => mod.BarcodeGenerator)),
  'barcode-scanner': dynamic(() => import('@/components/tools/BarcodeScanner').then(mod => mod.BarcodeScanner)),
  'base64-converter': dynamic(() => import('@/components/tools/Base64Converter').then(mod => mod.Base64Converter)),
  'binary-to-text': dynamic(() => import('@/components/tools/BinaryToText').then(mod => mod.BinaryToText)),
  'bmi-calculator': dynamic(() => import('@/components/tools/BmiCalculator').then(mod => mod.BmiCalculator)),
  'case-converter': dynamic(() => import('@/components/tools/CaseConverter').then(mod => mod.CaseConverter)),
  'cgpa-to-gpa-converter': dynamic(() => import('@/components/tools/CgpaToGpaConverter').then(mod => mod.CgpaToGpaConverter)),
  'cgpa-to-marks-calculator': dynamic(() => import('@/components/tools/CgpaToMarksCalculator').then(mod => mod.CgpaToMarksCalculator)),
  'color-picker': dynamic(() => import('@/components/tools/ColorPicker').then(mod => mod.ColorPicker)),
  'compress-pdf': dynamic(() => import('@/components/tools/CompressPdf').then(mod => mod.CompressPdf)),
  'credit-card-interest-calculator': dynamic(() => import('@/components/tools/CreditCardInterestCalculator').then(mod => mod.CreditCardInterestCalculator)),
  'css-minifier': dynamic(() => import('@/components/tools/CssMinifier').then(mod => mod.CssMinifier)),
  'currency-converter': dynamic(() => import('@/components/tools/CurrencyConverter').then(mod => mod.CurrencyConverter)),
  'date-calculator': dynamic(() => import('@/components/tools/DateCalculator').then(mod => mod.DateCalculator)),
  'discount-calculator': dynamic(() => import('@/components/tools/DiscountCalculator').then(mod => mod.DiscountCalculator)),
  'dropbox-direct-link-generator': dynamic(() => import('@/components/tools/DropboxDirectLinkGenerator').then(mod => mod.DropboxDirectLinkGenerator)),
  'excel-to-pdf': dynamic(() => import('@/components/tools/ExcelToPdf').then(mod => mod.ExcelToPdf)),
  'favicon-checker': dynamic(() => import('@/components/tools/FaviconChecker').then(mod => mod.FaviconChecker)),
  'find-and-replace': dynamic(() => import('@/components/tools/FindAndReplace').then(mod => mod.FindAndReplace)),
  'find-ifsc-code-by-bank-and-city': dynamic(() => import('@/components/tools/FindIFSCCodeByBankAndCity').then(mod => mod.FindIFSCCodeByBankAndCity)),
  'flip-image': dynamic(() => import('@/components/tools/FlipImage').then(mod => mod.FlipImage)),
  'flipkart-shipping-label-cropper': dynamic(() => import('@/components/tools/FlipkartShippingLabelCropper').then(mod => mod.FlipkartShippingLabelCropper)),
  'fuel-cost-calculator': dynamic(() => import('@/components/tools/FuelCostCalculator').then(mod => mod.FuelCostCalculator)),
  'google-drive-direct-link-generator': dynamic(() => import('@/components/tools/GoogleDriveDirectLinkGenerator').then(mod => mod.GoogleDriveDirectLinkGenerator)),
  'gpa-calculator': dynamic(() => import('@/components/tools/GpaCalculator').then(mod => mod.GpaCalculator)),
  'gpa-to-cgpa-calculator': dynamic(() => import('@/components/tools/GpaToCgpaCalculator').then(mod => mod.GpaToCgpaCalculator)),
  'gpa-to-percentage-converter': dynamic(() => import('@/components/tools/GpaToPercentageConverter').then(mod => mod.GpaToPercentageConverter)),
  'gst-calculator': dynamic(() => import('@/components/tools/GSTCalculator').then(mod => mod.GSTCalculator)),
  'html-minifier': dynamic(() => import('@/components/tools/HtmlMinifier').then(mod => mod.HtmlMinifier)),
  'ico-converter': dynamic(() => import('@/components/tools/IcoConverter').then(mod => mod.IcoConverter)),
  'ifsc-code-to-bank-details': dynamic(() => import('@/components/tools/IFSCCodeToBankDetails').then(mod => mod.IFSCodetoBankDetails)),
  'image-color-extractor': dynamic(() => import('@/components/tools/ImageColorExtractor').then(mod => mod.ImageColorExtractor)),
  'image-compressor': dynamic(() => import('@/components/tools/ImageCompressor').then(mod => mod.ImageCompressor)),
  'image-converter': dynamic(() => import('@/components/tools/ImageConverter').then(mod => mod.ImageConverter)),
  'image-cropper': dynamic(() => import('@/components/tools/ImageCropper').then(mod => mod.ImageCropper)),
  'image-metadata-viewer': dynamic(() => import('@/components/tools/ImageMetadataViewer').then(mod => mod.ImageMetadataViewer)),
  'image-resizer': dynamic(() => import('@/components/tools/ImageResizer').then(mod => mod.ImageResizer)),
  'image-shape-converter': dynamic(() => import('@/components/tools/ImageShapeConverter').then(mod => mod.ImageShapeConverter)),
  'image-to-base64': dynamic(() => import('@/components/tools/ImageToBase64').then(mod => mod.ImageToBase64)),
  'image-to-pdf': dynamic(() => import('@/components/tools/ImageToPdf').then(mod => mod.ImageToPdf)),
  'interest-calculator': dynamic(() => import('@/components/tools/InterestCalculator').then(mod => mod.InterestCalculator)),
  'javascript-minifier': dynamic(() => import('@/components/tools/JavascriptMinifier').then(mod => mod.JavascriptMinifier)),
  'json-formatter': dynamic(() => import('@/components/tools/JsonFormatter').then(mod => mod.JsonFormatter)),
  'keyword-density-checker': dynamic(() => import('@/components/tools/KeywordDensityChecker').then(mod => mod.KeywordDensityChecker)),
  'loan-calculator': dynamic(() => import('@/components/tools/LoanCalculator').then(mod => mod.LoanCalculator)),
  'lock-pdf': dynamic(() => import('@/components/tools/LockPdf').then(mod => mod.LockPdf)),
  'lorem-ipsum-generator': dynamic(() => import('@/components/tools/LoremIpsumGenerator').then(mod => mod.LoremIpsumGenerator)),
  'marks-to-percentage-calculator': dynamic(() => import('@/components/tools/MarksToPercentageCalculator').then(mod => mod.MarksToPercentageCalculator)),
  'meesho-shipping-label-cropper': dynamic(() => import('@/components/tools/MeeshoShippingLabelCropper').then(mod => mod.MeeshoShippingLabelCropper)),
  'meta-tag-generator': dynamic(() => import('@/components/tools/MetaTagGenerator').then(mod => mod.MetaTagGenerator)),
  'morse-to-text-translator': dynamic(() => import('@/components/tools/MorseToTextTranslator').then(mod => mod.MorseToTextTranslator)),
  'myntra-shipping-label-cropper': dynamic(() => import('@/components/tools/MyntraShippingLabelCropper').then(mod => mod.MyntraShippingLabelCropper)),
  'negative-marking-calculator': dynamic(() => import('@/components/tools/NegativeMarkingCalculator').then(mod => mod.NegativeMarkingCalculator)),
  'nsdl-pan-card-photo-and-signature-resizer': dynamic(() => import('@/components/tools/NSDLPANCardPhotoAndSignatureResizer').then(mod => mod.NSDLPANCardPhotoAndSignatureResizer)),
  'onedrive-direct-link-generator': dynamic(() => import('@/components/tools/OneDriveDirectLinkGenerator').then(mod => mod.OneDriveDirectLinkGenerator)),
  'password-generator': dynamic(() => import('@/components/tools/PasswordGenerator').then(mod => mod.PasswordGenerator)),
  'password-strength-checker': dynamic(() => import('@/components/tools/PasswordStrengthChecker').then(mod => mod.PasswordStrengthChecker)),
  'pdf-merger': dynamic(() => import('@/components/tools/PdfMerger').then(mod => mod.PdfMerger)),
  'pdf-organizer': dynamic(() => import('@/components/tools/PdfOrganizer').then(mod => mod.PdfOrganizer)),
  'pdf-page-counter': dynamic(() => import('@/components/tools/PdfPageCounter').then(mod => mod.PdfPageCounter)),
  'pdf-page-numberer': dynamic(() => import('@/components/tools/PdfPageNumberer').then(mod => mod.PdfPageNumberer)),
  'pdf-page-remover': dynamic(() => import('@/components/tools/PdfPageRemover').then(mod => mod.PdfPageRemover)),
  'pdf-page-reorder': dynamic(() => import('@/components/tools/PdfPageReorder').then(mod => mod.PdfPageReorder)),
  'pdf-signer': dynamic(() => import('@/components/tools/PdfSigner').then(mod => mod.PdfSigner)),
  'pdf-splitter': dynamic(() => import('@/components/tools/PdfSplitter').then(mod => mod.PdfSplitter)),
  'pdf-to-jpg': dynamic(() => import('@/components/tools/PdfToJpg').then(mod => mod.PdfToJpg)),
  'pdf-to-word': dynamic(() => import('@/components/tools/PdfToWord').then(mod => mod.PdfToWord)),
  'percentage-calculator': dynamic(() => import('@/components/tools/PercentageCalculator').then(mod => mod.PercentageCalculator)),
  'percentage-to-cgpa-converter': dynamic(() => import('@/components/tools/PercentageToCgpaConverter').then(mod => mod.PercentageToCgpaConverter)),
  'prn-to-pdf': dynamic(() => import('@/components/tools/PRNToPDF').then(mod => mod.PRNToPDF)),
  'ppt-to-pdf': dynamic(() => import('@/components/tools/PptToPdf').then(mod => mod.PptToPdf)),
  'qr-code-scanner': dynamic(() => import('@/components/tools/QrCodeScanner').then(mod => mod.QrCodeScanner)),
  'qr-code-generator': dynamic(() => import('@/components/tools/QrCodeGenerator').then(mod => mod.QrCodeGenerator)),
  'random-word-generator': dynamic(() => import('@/components/tools/RandomWordGenerator').then(mod => mod.RandomWordGenerator)),
  'redirect-checker': dynamic(() => import('@/components/tools/RedirectChecker').then(mod => mod.RedirectChecker)),
  'remove-extra-spaces': dynamic(() => import('@/components/tools/RemoveExtraSpaces').then(mod => mod.RemoveExtraSpaces)),
  'reverse-text': dynamic(() => import('@/components/tools/ReverseText').then(mod => mod.ReverseText)),
  'robots-txt-generator': dynamic(() => import('@/components/tools/RobotsTxtGenerator').then(mod => mod.RobotsTxtGenerator)),
  'rotate-image': dynamic(() => import('@/components/tools/RotateImage').then(mod => mod.RotateImage)),
  'rotate-pdf': dynamic(() => import('@/components/tools/RotatePdf').then(mod => mod.RotatePdf)),
  'schema-generator': dynamic(() => import('@/components/tools/SchemaGenerator').then(mod => mod.SchemaGenerator)),
  'serp-checker': dynamic(() => import('@/components/tools/SerpChecker').then(mod => mod.SerpChecker)),
  'sha256-hash-generator': dynamic(() => import('@/components/tools/Sha256HashGenerator').then(mod => mod.Sha256HashGenerator)),
  'srm-to-cgpa-calculator': dynamic(() => import('@/components/tools/SrmToCgpaCalculator').then(mod => mod.SrmToCgpaCalculator)),
  'text-encryption-and-decryption': dynamic(() => import('@/components/tools/TextEncryptionDecryption').then(mod => mod.TextEncryptionDecryption)),
  'text-repeater': dynamic(() => import('@/components/tools/TextRepeater').then(mod => mod.TextRepeater)),
  'text-to-binary': dynamic(() => import('@/components/tools/TextToBinary').then(mod => mod.TextToBinary)),
  'text-to-morse-code': dynamic(() => import('@/components/tools/TextToMorseCode').then(mod => mod.TextToMorseCode)),
  'time-zone-converter': dynamic(() => import('@/components/tools/TimeZoneConverter').then(mod => mod.TimeZoneConverter)),
  'title-tag-checker': dynamic(() => import('@/components/tools/TitleTagChecker').then(mod => mod.TitleTagChecker)),
  'unix-timestamp-converter': dynamic(() => import('@/components/tools/UnixTimestampConverter').then(mod => mod.UnixTimestampConverter)),
  'universal-hash-generator': dynamic(() => import('@/components/tools/UniversalHashGenerator').then(mod => mod.UniversalHashGenerator)),
  'unlock-pdf': dynamic(() => import('@/components/tools/UnlockPdf').then(mod => mod.UnlockPdf)),
  'uuid-generator': dynamic(() => import('@/components/tools/UuidGenerator').then(mod => mod.UuidGenerator)),
  'uti-pan-card-photo-and-signature-resizer': dynamic(() => import('@/components/tools/UTIPANCardPhotoAndSignatureResizer').then(mod => mod.UTIPANCardPhotoAndSignatureResizer)),
  'website-screenshot': dynamic(() => import('@/components/tools/WebsiteScreenshot').then(mod => mod.WebsiteScreenshot)),
  'website-word-counter': dynamic(() => import('@/components/tools/WebsiteWordCounter').then(mod => mod.WebsiteWordCounter)),
  'what-is-my-browser': dynamic(() => import('@/components/tools/WhatIsMyBrowser').then(mod => mod.WhatIsMyBrowser)),
  'word-counter': dynamic(() => import('@/components/tools/WordCounter').then(mod => mod.WordCounter)),
  'word-to-pdf': dynamic(() => import('@/components/tools/WordToPdf').then(mod => mod.WordToPdf)),
  'xml-sitemap-generator': dynamic(() => import('@/components/tools/XmlSitemapGenerator').then(mod => mod.XmlSitemapGenerator)),
  'youtube-region-restriction-checker': dynamic(() => import('@/components/tools/YouTubeRegionRestrictionChecker').then(mod => mod.YouTubeRegionRestrictionChecker)),
  'youtube-video-description-extractor': dynamic(() => import('@/components/tools/YouTubeVideoDescriptionExtractor').then(mod => mod.YouTubeVideoDescriptionExtractor)),
  'youtube-video-thumbnail-downloader': dynamic(() => import('@/components/tools/YouTubeVideoThumbnailDownloader').then(mod => mod.YouTubeVideoThumbnailDownloader)),
  'youtube-video-title-extractor': dynamic(() => import('@/components/tools/YouTubeVideoTitleExtractor').then(mod => mod.YouTubeVideoTitleExtractor)),
  'unit-converter': dynamic(() => import('@/components/tools/UnitConverter').then(mod => mod.UnitConverter)),
};

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
  adSettings: AdvertisementSettings | null;
  sidebar: React.ReactNode;
}

export function ToolPageClient({ tool, toolReviews, adSettings, sidebar }: ToolPageClientProps) {
    const { user } = useAuth();
    
    useEffect(() => {
        if (user && tool) {
            addUserActivity(user.uid, 'tool_usage', { name: tool.name, path: `/tools/${tool.slug}` });
        }
    }, [user, tool]);

    const ToolComponent = useMemo(() => {
        if (!tool || !toolComponents[tool.slug]) return null;
        return toolComponents[tool.slug];
    }, [tool]);

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

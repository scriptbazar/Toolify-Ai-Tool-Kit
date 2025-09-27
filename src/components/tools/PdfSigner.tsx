
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, PenLine, Type, Image as ImageIcon, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SignatureCanvas from 'react-signature-canvas';
import Image from 'next/image';
import * as pdfjsLib from 'pdfjs-dist';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/chunks/pdf.worker.min.mjs';


interface PagePreview {
    dataUrl: string;
    width: number;
    height: number;
}

interface SignaturePosition {
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export function PdfSigner() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
    const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [signatureUploadPreview, setSignatureUploadPreview] = useState<string | null>(null);
    const [typedSignature, setTypedSignature] = useState('Your Name');
    const [typedFont, setTypedFont] = useState('font-cursive');
    const [signaturePosition, setSignaturePosition] = useState<SignaturePosition | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sigCanvasRef = useRef<SignatureCanvas | null>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') {
            toast({ title: 'Invalid File', description: 'Please select a PDF file.', variant: 'destructive'});
            return;
        }
        setIsLoading(true);
        setPdfFile(file);
        setPagePreviews([]);
        setSignaturePosition(null);

        try {
            const fileBytes = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
            const pdf = await loadingTask.promise;
            const previews: PagePreview[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d');
                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    previews.push({ dataUrl: canvas.toDataURL(), width: viewport.width, height: viewport.height });
                }
            }
            setPagePreviews(previews);
        } catch (error) {
            toast({ title: 'Error', description: 'Could not load PDF previews.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDrawEnd = () => {
        if (sigCanvasRef.current) {
            setSignatureDataUrl(sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png'));
        }
    };

    const handleTypeSignature = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.font = `60px ${typedFont.replace('font-', '')}, cursive`;
            const textWidth = ctx.measureText(typedSignature).width;
            canvas.width = textWidth + 20;
            canvas.height = 100;
            ctx.font = `60px ${typedFont.replace('font-', '')}, cursive`;
            ctx.fillStyle = "black";
            ctx.fillText(typedSignature, 10, 60);
            setSignatureDataUrl(canvas.toDataURL('image/png'));
        }
    };

    const handleSignatureUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setSignatureUploadPreview(dataUrl);
                setSignatureDataUrl(dataUrl);
            }
            reader.readAsDataURL(file);
        }
    };
    
    const handlePageClick = (pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
        if (!signatureDataUrl) {
            toast({ title: 'No Signature', description: 'Please create or upload a signature first.', variant: 'destructive'});
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSignaturePosition({ pageIndex, x: x - 50, y: y - 25, width: 100, height: 50 });
    };

    const applySignatureAndDownload = async () => {
        if (!pdfFile || !signatureDataUrl || !signaturePosition) {
            toast({ title: 'Error', description: 'Missing PDF, signature, or placement.', variant: 'destructive'});
            return;
        }
        setIsLoading(true);
        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const signatureBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
            const signatureImage = await pdfDoc.embedPng(signatureBytes);

            const page = pdfDoc.getPage(signaturePosition.pageIndex);
            
            // Convert clicked coordinates to PDF coordinates
            const pdfX = (signaturePosition.x / pagePreviews[signaturePosition.pageIndex].width) * page.getWidth();
            const pdfY = page.getHeight() - ((signaturePosition.y / pagePreviews[signaturePosition.pageIndex].height) * page.getHeight()) - signaturePosition.height;

            page.drawImage(signatureImage, {
                x: pdfX,
                y: pdfY,
                width: signaturePosition.width,
                height: signaturePosition.height,
            });

            const newPdfBytes = await pdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `signed-${pdfFile.name}`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to Sign PDF', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>1. Upload PDF</CardTitle></CardHeader>
                    <CardContent>
                        <div className="w-full aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
                            {pdfFile ? <p className="text-sm p-4"><FileText className="inline mr-2"/>{pdfFile.name}</p> : <div className="text-center p-4"><UploadCloud className="mx-auto h-8 w-8 text-muted-foreground"/><p className="text-sm">Click to upload</p></div>}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>2. Create Signature</CardTitle></CardHeader>
                    <CardContent>
                        <Tabs value={signatureType} onValueChange={(val) => setSignatureType(val as any)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="draw"><PenLine className="h-4 w-4"/></TabsTrigger>
                                <TabsTrigger value="type"><Type className="h-4 w-4"/></TabsTrigger>
                                <TabsTrigger value="upload"><ImageIcon className="h-4 w-4"/></TabsTrigger>
                            </TabsList>
                            <TabsContent value="draw" className="mt-4">
                                <SignatureCanvas ref={sigCanvasRef} canvasProps={{ className: 'w-full h-32 border rounded-md bg-muted' }} onEnd={handleDrawEnd} />
                                <Button variant="outline" size="sm" onClick={() => sigCanvasRef.current?.clear()} className="w-full mt-2">Clear</Button>
                            </TabsContent>
                            <TabsContent value="type" className="mt-4 space-y-2">
                                <Input 
                                    value={typedSignature} 
                                    onChange={(e) => {
                                        setTypedSignature(e.target.value);
                                        handleTypeSignature();
                                    }} 
                                    onBlur={handleTypeSignature}
                                    className={cn('text-3xl h-20 p-4 border rounded-md bg-muted', typedFont)} 
                                />
                                <Select value={typedFont} onValueChange={setTypedFont}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="font-cursive" className="font-cursive">Cursive</SelectItem>
                                        <SelectItem value="font-serif" className="font-serif">Serif</SelectItem>
                                        <SelectItem value="font-sans" className="font-sans">Sans-serif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TabsContent>
                            <TabsContent value="upload" className="mt-4">
                                 <Input type="file" onChange={handleSignatureUpload} accept="image/png, image/jpeg"/>
                                 {signatureUploadPreview && <div className="mt-4 p-2 border rounded-md flex justify-center bg-muted"><Image src={signatureUploadPreview} alt="Signature preview" width={200} height={100} style={{objectFit: 'contain'}}/></div>}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                 </Card>
                 <Button onClick={applySignatureAndDownload} disabled={!signaturePosition || isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                    Apply & Download
                </Button>
            </div>
             <div className="lg:col-span-2">
                <Card className="h-full">
                    <CardHeader><CardTitle>3. Place Signature</CardTitle><CardDescription>Click on a page to place your signature.</CardDescription></CardHeader>
                    <CardContent className="h-[70vh] overflow-y-auto space-y-4">
                       {pagePreviews.length > 0 ? pagePreviews.map((page, index) => (
                        <div key={index} className="relative border shadow-md" onClick={(e) => handlePageClick(index, e)} style={{width: page.width, height: page.height, margin: 'auto'}}>
                            <Image src={page.dataUrl} alt={`Page ${index + 1}`} width={page.width} height={page.height} />
                            {signaturePosition && signaturePosition.pageIndex === index && signatureDataUrl && (
                                <div className="absolute border-2 border-dashed border-primary" style={{ left: signaturePosition.x, top: signaturePosition.y, width: signaturePosition.width, height: signaturePosition.height }}>
                                    <Image src={signatureDataUrl} alt="Signature" layout="fill" />
                                </div>
                            )}
                        </div>
                       )) : (
                           <div className="flex items-center justify-center h-full text-muted-foreground">PDF preview will appear here.</div>
                       )}
                    </CardContent>
                </Card>
             </div>
        </div>
    );
}

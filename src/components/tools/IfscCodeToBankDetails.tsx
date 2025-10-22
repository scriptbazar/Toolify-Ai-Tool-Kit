
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Landmark, Loader2, Copy, Search, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { getBankDetailsFromIfsc, type BankDetails } from '@/ai/flows/ifsc-finder';

export function IfscCodeToBankDetails() {
    const [ifsc, setIfsc] = useState('');
    const [details, setDetails] = useState<BankDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    
    const handleFetchDetails = async () => {
        if (!ifsc.trim() || ifsc.trim().length !== 11) {
            toast({ title: 'Invalid IFSC', description: 'Please enter a valid 11-character IFSC code.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setError(null);
        setDetails(null);
        try {
            const data = await getBankDetailsFromIfsc(ifsc.trim());
            setDetails(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: `Copied: ${text}` });
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="Enter IFSC Code" maxLength={11} />
                <Button onClick={handleFetchDetails} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />} Find Details
                </Button>
            </div>
            
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {details && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>{details.BANK}</CardTitle>
                        <CardDescription>{details.BRANCH} Branch Details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">IFSC Code</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono">{details.IFSC}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleCopy(details.IFSC)}><Copy className="h-4 w-4"/></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Address</TableCell>
                                    <TableCell>{details.ADDRESS}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">City</TableCell>
                                    <TableCell>{details.CITY}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">State</TableCell>
                                    <TableCell>{details.STATE}</TableCell>
                                </TableRow>
                                 {details.MICR && (
                                     <TableRow>
                                        <TableCell className="font-semibold">MICR Code</TableCell>
                                        <TableCell>{details.MICR}</TableCell>
                                    </TableRow>
                                 )}
                                 {details.CONTACT && (
                                     <TableRow>
                                        <TableCell className="font-semibold">Contact</TableCell>
                                        <TableCell>{details.CONTACT}</TableCell>
                                    </TableRow>
                                 )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default IfscCodeToBankDetails;

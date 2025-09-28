
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Bank, Search, Loader2, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BankDetails {
    BANK: string;
    BRANCH: string;
    ADDRESS: string;
    CITY: string;
    STATE: string;
    IFSC: string;
    MICR?: string;
    CONTACT?: string;
}

export function IFSCodetoBankDetails() {
    const [ifscCode, setIfscCode] = useState('');
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleFetchDetails = async () => {
        if (ifscCode.length !== 11) {
            toast({ title: 'Invalid IFSC Code', description: 'Please enter a valid 11-character IFSC code.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setError(null);
        setBankDetails(null);

        try {
            const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Invalid IFSC Code. Please check the code and try again.');
                }
                throw new Error('Could not fetch bank details. Please try again later.');
            }
            const data: BankDetails = await response.json();
            setBankDetails(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: 'Copied to clipboard!' });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="ifsc-code" className="flex items-center gap-2">
                    <Bank className="h-5 w-5"/>
                    Enter IFSC Code
                </Label>
                <div className="flex gap-2">
                    <Input 
                        id="ifsc-code" 
                        value={ifscCode} 
                        onChange={e => setIfscCode(e.target.value.toUpperCase())} 
                        placeholder="e.g., SBIN0000691"
                        maxLength={11}
                        className="font-mono uppercase"
                    />
                    <Button onClick={handleFetchDetails} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Find Bank Details
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {bankDetails && (
                <Card>
                    <CardHeader>
                        <CardTitle>{bankDetails.BANK}</CardTitle>
                        <CardDescription>{bankDetails.BRANCH} Branch</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">Address</TableCell>
                                    <TableCell>{bankDetails.ADDRESS}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">City</TableCell>
                                    <TableCell>{bankDetails.CITY}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">State</TableCell>
                                    <TableCell>{bankDetails.STATE}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">IFSC Code</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-between">
                                            <span>{bankDetails.IFSC}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleCopy(bankDetails.IFSC)}>
                                                <Copy className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                {bankDetails.MICR && (
                                    <TableRow>
                                        <TableCell className="font-semibold">MICR Code</TableCell>
                                        <TableCell>{bankDetails.MICR}</TableCell>
                                    </TableRow>
                                )}
                                 {bankDetails.CONTACT && (
                                    <TableRow>
                                        <TableCell className="font-semibold">Contact</TableCell>
                                        <TableCell>{bankDetails.CONTACT}</TableCell>
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


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import { Landmark, Search, Loader2, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Combobox } from '../ui/combobox';
import { ScrollArea } from '../ui/scroll-area';

// A subset of Indian banks for demonstration purposes. A full list would be very large.
const banks = [
    "STATE BANK OF INDIA",
    "HDFC BANK",
    "ICICI BANK LIMITED",
    "PUNJAB NATIONAL BANK",
    "CANARA BANK",
    "AXIS BANK",
    "BANK OF BARODA",
    "UNION BANK OF INDIA",
    "BANK OF INDIA",
    "KOTAK MAHINDRA BANK LIMITED"
];

interface BranchDetails {
    BRANCH: string;
    ADDRESS: string;
    CITY: string;
    STATE: string;
    IFSC: string;
    BANK: string;
}

export function FindIFSCCodeByBankAndCity() {
    const [selectedBank, setSelectedBank] = useState('');
    const [city, setCity] = useState('');
    const [branches, setBranches] = useState<BranchDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const bankOptions = banks.map(b => ({ value: b, label: b }));

    const handleSearch = async () => {
        if (!selectedBank || !city) {
            toast({ title: 'Missing Information', description: 'Please select a bank and enter a city.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setError(null);
        setBranches([]);

        try {
            // Using the unofficial Razorpay IFSC API for searching
            const response = await fetch(`https://ifsc.razorpay.com/search?bank=${selectedBank}&city=${city}`);
            if (!response.ok) {
                 if (response.status === 404) {
                    throw new Error('No branches found for the selected bank and city combination.');
                }
                throw new Error('Could not fetch branch details. The API might be down.');
            }
            const data: BranchDetails[] = await response.json();
            if (data.length === 0) {
                 throw new Error('No branches found for the selected bank and city combination.');
            }
            setBranches(data);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="bank-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select Bank</Label>
                    <Combobox
                        items={bankOptions}
                        value={selectedBank}
                        onValueChange={setSelectedBank}
                        placeholder="Select a bank..."
                        searchPlaceholder="Search bank..."
                        notFoundMessage="Bank not found."
                    />
                </div>
                <div className="md:col-span-1 space-y-2">
                     <Label htmlFor="city-input" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Enter City</Label>
                    <Input id="city-input" value={city} onChange={(e) => setCity(e.target.value.toUpperCase())} placeholder="e.g., MUMBAI" />
                </div>
                <Button onClick={handleSearch} disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                    Find Branches
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {(isLoading || branches.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>Found {branches.length} branches for {selectedBank} in {city}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>IFSC Code</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                             <TableRow key={i}>
                                                <TableCell colSpan={3}><div className="h-6 w-full bg-muted animate-pulse rounded-md" /></TableCell>
                                             </TableRow>
                                        ))
                                    ) : (
                                        branches.map(branch => (
                                            <TableRow key={branch.IFSC}>
                                                <TableCell>
                                                     <div className="flex items-center gap-1 font-mono text-xs">
                                                        <span>{branch.IFSC}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(branch.IFSC)}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{branch.BRANCH}</TableCell>
                                                <TableCell>{branch.ADDRESS}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
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

interface BranchDetails {
    BRANCH: string;
    ADDRESS: string;
    CITY: string;
    STATE: string;
    IFSC: string;
    BANK: string;
}

export function FindIFSCCodeByBankAndCity() {
    const [banks, setBanks] = useState<string[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [branches, setBranches] = useState<BranchDetails[]>([]);
    const [isLoading, setIsLoading] = useState<'banks' | 'states' | 'cities' | 'branches' | false>(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch all banks on initial load
    useEffect(() => {
        async function fetchBanks() {
            setIsLoading('banks');
            try {
                const response = await fetch(`https://ifsc.razorpay.com/banks`);
                if (!response.ok) throw new Error('Could not fetch bank list.');
                const data: string[] = await response.json();
                setBanks(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBanks();
    }, []);

    // Fetch states when a bank is selected
    useEffect(() => {
        if (!selectedBank) return;

        async function fetchStates() {
            setIsLoading('states');
            setSelectedState('');
            setSelectedCity('');
            setCities([]);
            setBranches([]);
            try {
                const response = await fetch(`https://ifsc.razorpay.com/search?bank=${selectedBank}`);
                if (!response.ok) throw new Error('Could not fetch states for the selected bank.');
                const data: BranchDetails[] = await response.json();
                const uniqueStates = [...new Set(data.map(branch => branch.STATE))].sort();
                setStates(uniqueStates);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStates();
    }, [selectedBank]);
    
    // Fetch cities when a bank and state are selected
    useEffect(() => {
        if (!selectedBank || !selectedState) return;

        async function fetchCities() {
            setIsLoading('cities');
            setSelectedCity('');
            setCities([]);
            setBranches([]);
            try {
                const response = await fetch(`https://ifsc.razorpay.com/search?bank=${selectedBank}&state=${selectedState}`);
                 if (!response.ok) throw new Error('Could not fetch cities.');
                const data: BranchDetails[] = await response.json();
                const uniqueCities = [...new Set(data.map(branch => branch.CITY))].sort();
                setCities(uniqueCities);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCities();
    }, [selectedBank, selectedState]);


    const handleSearch = async () => {
        if (!selectedBank || !selectedState || !selectedCity) {
            toast({ title: 'Missing Information', description: 'Please select a bank, state, and city.', variant: 'destructive' });
            return;
        }
        setIsLoading('branches');
        setError(null);
        setBranches([]);

        try {
            const response = await fetch(`https://ifsc.razorpay.com/search?bank=${selectedBank}&city=${selectedCity}&state=${selectedState}`);
            if (!response.ok) {
                 if (response.status === 404) {
                    throw new Error('No branches found for the selected combination.');
                }
                throw new Error('Could not fetch branch details.');
            }
            const data: BranchDetails[] = await response.json();
            if (data.length === 0) {
                 throw new Error('No branches found for the selected combination.');
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="bank-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select Bank</Label>
                    <Combobox items={banks.map(b => ({ value: b, label: b }))} value={selectedBank} onValueChange={setSelectedBank} placeholder="Select a bank..." searchPlaceholder="Search bank..." notFoundMessage="Bank not found."/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select State</Label>
                    <Combobox items={states.map(s => ({ value: s, label: s }))} value={selectedState} onValueChange={setSelectedState} placeholder={isLoading === 'states' ? "Loading..." : "Select a state..."} searchPlaceholder="Search state..." notFoundMessage="State not found." disabled={!selectedBank || isLoading === 'states'} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select City</Label>
                    <Combobox items={cities.map(c => ({ value: c, label: c }))} value={selectedCity} onValueChange={setSelectedCity} placeholder={isLoading === 'cities' ? "Loading..." : "Select a city..."} searchPlaceholder="Search city..." notFoundMessage="City not found." disabled={!selectedState || isLoading === 'cities'} />
                </div>
                <Button onClick={handleSearch} disabled={isLoading !== false || !selectedCity}>
                    {isLoading === 'branches' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
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

            {(isLoading === 'branches' || branches.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>Found {branches.length} branches for {selectedBank} in {selectedCity}, {selectedState}.</CardDescription>
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
                                    {isLoading === 'branches' ? (
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

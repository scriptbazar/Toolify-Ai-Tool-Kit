
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Landmark, Loader2, AlertTriangle, Copy, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Combobox } from '../ui/combobox';
import { getBankList, getBranchesForBank } from '@/ai/flows/ifsc-finder';

interface BranchDetails {
    BRANCH: string;
    ADDRESS: string;
    CITY: string;
    STATE: string;
    IFSC: string;
    BANK: string;
    MICR?: string;
    CONTACT?: string;
}

export function FindIfscCodeByBankAndCity() {
    const [banks, setBanks] = useState<{ value: string; label: string }[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [branches, setBranches] = useState<BranchDetails[]>([]);
    
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [branchDetailsToShow, setBranchDetailsToShow] = useState<BranchDetails | null>(null);

    const [bankBranches, setBankBranches] = useState<BranchDetails[]>([]);

    const [isLoading, setIsLoading] = useState<'banks' | 'states' | 'cities' | 'branches' | false>(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch all banks on initial load
    useEffect(() => {
        async function fetchBanks() {
            setIsLoading('banks');
            setError(null);
            try {
                const data: string[] = await getBankList();
                setBanks(data.map(bank => ({ value: bank, label: bank })));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBanks();
    }, []);

    // Fetch all branches for a bank when selected, then derive states from it.
    useEffect(() => {
        if (!selectedBank) return;

        async function fetchBankData() {
            setIsLoading('states');
            setError(null);
            setSelectedState('');
            setStates([]);
            setSelectedCity('');
            setCities([]);
            setBranches([]);
            setSelectedBranch('');
            setBankBranches([]);
            setBranchDetailsToShow(null);
            try {
                const data: BranchDetails[] = await getBranchesForBank(selectedBank);
                setBankBranches(data);
                const uniqueStates = [...new Set(data.map(branch => branch.STATE))].sort();
                setStates(uniqueStates);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBankData();
    }, [selectedBank]);
    
    // Derive cities from the already fetched branches when a state is selected.
    useEffect(() => {
        if (!selectedState) return;
        setIsLoading('cities');
        setSelectedCity('');
        setCities([]);
        setBranches([]);
        setSelectedBranch('');
        setBranchDetailsToShow(null);
        const uniqueCities = [...new Set(bankBranches.filter(b => b.STATE === selectedState).map(branch => branch.CITY))].sort();
        setCities(uniqueCities);
        setIsLoading(false);
    }, [selectedState, bankBranches]);
    
    // Derive branches when a city is selected
    useEffect(() => {
        if (!selectedCity) return;
        setIsLoading('branches');
        setBranches([]);
        setSelectedBranch('');
        setBranchDetailsToShow(null);
        const cityBranches = bankBranches.filter(b => b.STATE === selectedState && b.CITY === selectedCity);
        setBranches(cityBranches);
        setIsLoading(false);
    }, [selectedCity, selectedState, bankBranches]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: `Copied: ${text}` });
    };
    
    const handleFindDetails = () => {
        if (!selectedBranch) {
            toast({ title: 'Please select a branch', variant: 'destructive'});
            return;
        }
        const details = branches.find(b => b.IFSC === selectedBranch) || null;
        setBranchDetailsToShow(details);
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="bank-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select Bank</Label>
                    <Combobox items={banks} value={selectedBank} onValueChange={setSelectedBank} placeholder="Select a bank..." searchPlaceholder="Search bank..." notFoundMessage="Bank not found."/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select State</Label>
                    <Combobox items={states.map(s => ({ value: s, label: s }))} value={selectedState} onValueChange={setSelectedState} placeholder={isLoading === 'states' ? "Loading..." : "Select a state..."} searchPlaceholder="Search state..." notFoundMessage="State not found." disabled={!selectedBank || isLoading === 'states'} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select City</Label>
                    <Combobox items={cities.map(c => ({ value: c, label: c }))} value={selectedCity} onValueChange={setSelectedCity} placeholder={isLoading === 'cities' ? "Loading..." : "Select a city..."} searchPlaceholder="Search city..." notFoundMessage="City not found." disabled={!selectedState || isLoading === 'cities'} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="branch-select" className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Select Branch</Label>
                    <Combobox 
                        items={branches.map(b => ({ value: b.IFSC, label: b.BRANCH }))} 
                        value={selectedBranch} 
                        onValueChange={setSelectedBranch} 
                        placeholder={isLoading === 'branches' ? "Loading..." : "Select a branch..."} 
                        searchPlaceholder="Search branch..." 
                        notFoundMessage="Branch not found." 
                        disabled={!selectedCity || isLoading === 'branches'}
                    />
                </div>
            </div>
            
            <Button onClick={handleFindDetails} disabled={!selectedBranch} className="w-full">
                <Search className="mr-2 h-4 w-4" /> Find IFSC Code & Details
            </Button>


            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {branchDetailsToShow && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>{branchDetailsToShow.BANK}</CardTitle>
                        <CardDescription>{branchDetailsToShow.BRANCH} Branch Details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">IFSC Code</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono">{branchDetailsToShow.IFSC}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleCopy(branchDetailsToShow.IFSC)}><Copy className="h-4 w-4"/></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Address</TableCell>
                                    <TableCell>{branchDetailsToShow.ADDRESS}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">City</TableCell>
                                    <TableCell>{branchDetailsToShow.CITY}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">State</TableCell>
                                    <TableCell>{branchDetailsToShow.STATE}</TableCell>
                                </TableRow>
                                 {branchDetailsToShow.MICR && (
                                     <TableRow>
                                        <TableCell className="font-semibold">MICR Code</TableCell>
                                        <TableCell>{branchDetailsToShow.MICR}</TableCell>
                                    </TableRow>
                                 )}
                                 {branchDetailsToShow.CONTACT && (
                                     <TableRow>
                                        <TableCell className="font-semibold">Contact</TableCell>
                                        <TableCell>{branchDetailsToShow.CONTACT}</TableCell>
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

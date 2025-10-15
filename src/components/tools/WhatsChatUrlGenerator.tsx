
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Copy, MessageSquare, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/countries';
import { Combobox } from '../ui/combobox';

export function WhatsChatUrlGenerator() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [message, setMessage] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const { toast } = useToast();
  
  const handleGenerate = () => {
    if (!phoneNumber) {
        toast({ title: 'Phone number is required', variant: 'destructive'});
        return;
    }
    const fullNumber = `${countryCode.replace('+', '')}${phoneNumber}`;
    let url = `https://wa.me/${fullNumber}`;
    if (message.trim()) {
        url += `?text=${encodeURIComponent(message)}`;
    }
    setGeneratedUrl(url);
  }

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleClear = () => {
    setPhoneNumber('');
    setMessage('');
    setGeneratedUrl('');
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generator Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="country-code">Country</Label>
                         <Combobox
                            items={countries.map(country => ({
                                value: country.dial_code,
                                label: `${country.flag} ${country.name} (${country.dial_code})`,
                            }))}
                            value={countryCode}
                            onValueChange={setCountryCode}
                            placeholder="Select country..."
                            searchPlaceholder="Search country..."
                            notFoundMessage="No country found."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone-number">Phone Number</Label>
                        <Input id="phone-number" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="Enter phone number without country code"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Pre-filled Message (Optional)</Label>
                        <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="e.g., Hello, I'm interested in your product."/>
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Generated Link</CardTitle>
                    <CardDescription>Share this link to start a WhatsApp chat instantly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea value={generatedUrl} readOnly className="min-h-[150px] bg-muted font-mono" placeholder="Your link will appear here..."/>
                     <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleCopy} disabled={!generatedUrl} className="w-full">
                            <Copy className="mr-2 h-4 w-4"/> Copy Link
                        </Button>
                         <Button onClick={handleClear} variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4"/> Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <Button onClick={handleGenerate} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" /> Generate Link
        </Button>
    </div>
  );
}


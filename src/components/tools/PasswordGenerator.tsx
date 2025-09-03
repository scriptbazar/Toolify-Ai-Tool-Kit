
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '@/components/ui/slider';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const { toast } = useToast();

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let charset = '';
    if (includeUppercase) charset += upper;
    if (includeLowercase) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
        toast({ title: 'Error', description: 'Please select at least one character type.', variant: 'destructive'});
        return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };

  const handleCopy = () => {
    if (!password) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(password);
    toast({ title: 'Password copied to clipboard!' });
  };
  
  useState(generatePassword);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input value={password} readOnly placeholder="Your secure password will appear here" className="font-mono" />
        <Button variant="outline" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
        <Button variant="default" size="icon" onClick={generatePassword}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="length">Password Length: {length}</Label>
            <Slider id="length" min={6} max={32} step={1} value={[length]} onValueChange={(val) => setLength(val[0])} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="uppercase" checked={includeUppercase} onCheckedChange={(checked) => setIncludeUppercase(Boolean(checked))} />
                <Label htmlFor="uppercase">Uppercase</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="lowercase" checked={includeLowercase} onCheckedChange={(checked) => setIncludeLowercase(Boolean(checked))} />
                <Label htmlFor="lowercase">Lowercase</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="numbers" checked={includeNumbers} onCheckedChange={(checked) => setIncludeNumbers(Boolean(checked))} />
                <Label htmlFor="numbers">Numbers</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="symbols" checked={includeSymbols} onCheckedChange={(checked) => setIncludeSymbols(Boolean(checked))} />
                <Label htmlFor="symbols">Symbols</Label>
            </div>
        </div>
      </div>
    </div>
  );
}

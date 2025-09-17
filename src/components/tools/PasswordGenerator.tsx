
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strength, setStrength] = useState({ score: 0, label: 'Too Weak' });
  const { toast } = useToast();

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    let label = 'Too Weak';
    if (score > 5) label = 'Very Strong';
    else if (score > 4) label = 'Strong';
    else if (score > 2) label = 'Medium';
    else if (score > 1) label = 'Weak';
    
    setStrength({ score, label });
  };

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
        setPassword('');
        setStrength({ score: 0, label: 'Too Weak' });
        return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    calculateStrength(newPassword);
  };
  
  useEffect(() => {
    generatePassword();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const handleCopy = () => {
    if (!password) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(password);
    toast({ title: 'Password copied to clipboard!' });
  };

  const strengthColor = () => {
    switch (strength.label) {
        case 'Very Strong':
        case 'Strong':
            return 'bg-green-500';
        case 'Medium':
            return 'bg-yellow-500';
        default:
            return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input value={password} readOnly placeholder="Your secure password will appear here" className="font-mono text-lg h-12 pr-20"/>
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={generatePassword} className="h-8 w-8"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>
      
      <div>
         <div className="flex justify-between items-center text-sm mb-1">
            <Label>Password Strength</Label>
            <span className={cn("font-semibold", 
                strength.label === 'Very Strong' || strength.label === 'Strong' ? 'text-green-500' :
                strength.label === 'Medium' ? 'text-yellow-500' : 'text-red-500'
            )}>{strength.label}</span>
        </div>
        <Progress value={(strength.score / 6) * 100} indicatorClassName={strengthColor()} />
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
            <Label htmlFor="length">Password Length: {length}</Label>
            <Slider id="length" min={6} max={32} step={1} value={[length]} onValueChange={(val) => setLength(val[0])} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox id="uppercase" checked={includeUppercase} onCheckedChange={(checked) => setIncludeUppercase(Boolean(checked))} />
                <Label htmlFor="uppercase" className="cursor-pointer">ABC</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox id="lowercase" checked={includeLowercase} onCheckedChange={(checked) => setIncludeLowercase(Boolean(checked))} />
                <Label htmlFor="lowercase" className="cursor-pointer">abc</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox id="numbers" checked={includeNumbers} onCheckedChange={(checked) => setIncludeNumbers(Boolean(checked))} />
                <Label htmlFor="numbers" className="cursor-pointer">123</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox id="symbols" checked={includeSymbols} onCheckedChange={(checked) => setIncludeSymbols(Boolean(checked))} />
                <Label htmlFor="symbols" className="cursor-pointer">#$&</Label>
            </div>
        </div>
      </div>
    </div>
  );
}

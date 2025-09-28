
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface Strength {
  score: number;
  label: string;
  color: string;
}

interface Criteria {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
}

const criteriaChecks = [
    { key: 'length', text: 'At least 8 characters long' },
    { key: 'uppercase', text: 'Contains an uppercase letter' },
    { key: 'lowercase', text: 'Contains a lowercase letter' },
    { key: 'number', text: 'Contains a number' },
    { key: 'symbol', text: 'Contains a symbol' },
];

export function PasswordStrengthChecker() {
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState<Strength>({ score: 0, label: 'Too Weak', color: 'bg-red-500' });
    const [criteria, setCriteria] = useState<Criteria>({ length: false, uppercase: false, lowercase: false, number: false, symbol: false });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const pass = password;
        let score = 0;
        const newCriteria = {
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /\d/.test(pass),
            symbol: /[^A-Za-z0-9]/.test(pass),
        };

        if (newCriteria.length) score++;
        if (newCriteria.uppercase) score++;
        if (newCriteria.lowercase) score++;
        if (newCriteria.number) score++;
        if (newCriteria.symbol) score++;
        if (pass.length >= 12) score++;

        setCriteria(newCriteria);
        
        let label = 'Too Weak';
        let color = 'bg-red-500';

        if (score > 4) { label = 'Very Strong'; color = 'bg-green-500'; } 
        else if (score > 3) { label = 'Strong'; color = 'bg-green-500'; } 
        else if (score > 2) { label = 'Medium'; color = 'bg-yellow-500'; } 
        else if (score > 0) { label = 'Weak'; color = 'bg-orange-500'; }

        setStrength({ score, label, color });
        
    }, [password]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <Label htmlFor="password-input">Enter Password</Label>
                <div className="relative">
                     <Input 
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Type your password..."
                        className="h-12 text-lg pr-12"
                    />
                     <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                    </Button>
                </div>
            </div>
            
            <div>
                 <div className="flex justify-between items-center text-sm mb-1">
                    <Label>Password Strength</Label>
                    <span className={cn("font-semibold", 
                        strength.label === 'Very Strong' || strength.label === 'Strong' ? 'text-green-500' :
                        strength.label === 'Medium' ? 'text-yellow-500' :
                        strength.label === 'Weak' ? 'text-orange-500' : 'text-red-500'
                    )}>{strength.label}</span>
                </div>
                <Progress value={(strength.score / 6) * 100} indicatorClassName={strength.color} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t">
                {criteriaChecks.map(({ key, text }) => (
                     <div key={key} className={cn("flex items-center gap-2 text-sm", criteria[key as keyof Criteria] ? 'text-green-600' : 'text-muted-foreground')}>
                        {criteria[key as keyof Criteria] ? <CheckCircle2 className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                        <span>{text}</span>
                     </div>
                ))}
            </div>
        </div>
    );
}

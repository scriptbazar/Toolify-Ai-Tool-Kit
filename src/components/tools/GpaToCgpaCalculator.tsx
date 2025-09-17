
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PlusCircle, Trash2, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Semester {
    gpa: string;
    credits: string;
}

export function GpaToCgpaCalculator() {
    const [semesters, setSemesters] = useState<Semester[]>([
        { gpa: '', credits: '' },
        { gpa: '', credits: '' },
    ]);
    const [cgpa, setCgpa] = useState<number | null>(null);
    const { toast } = useToast();

    const handleSemesterChange = (index: number, field: keyof Semester, value: string) => {
        const newSemesters = [...semesters];
        newSemesters[index][field] = value;
        setSemesters(newSemesters);
    };

    const addSemester = () => {
        setSemesters([...semesters, { gpa: '', credits: '' }]);
    };

    const removeSemester = (index: number) => {
        setSemesters(semesters.filter((_, i) => i !== index));
    };

    const calculateCgpa = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        for (const semester of semesters) {
            const gpaVal = parseFloat(semester.gpa);
            const creditsVal = parseFloat(semester.credits);

            if (isNaN(gpaVal) || isNaN(creditsVal) || gpaVal < 0 || creditsVal < 0) {
                toast({ title: "Invalid Input", description: `Please check Semester #${semesters.indexOf(semester) + 1} for valid GPA and credits.`, variant: "destructive" });
                return;
            }
            
            totalPoints += gpaVal * creditsVal;
            totalCredits += creditsVal;
        }
        
        if (totalCredits === 0) {
            setCgpa(0);
        } else {
            setCgpa(totalPoints / totalCredits);
        }
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Semester Details</CardTitle>
                    <CardDescription>Enter the GPA and total credits for each semester.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {semesters.map((semester, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 items-end p-4 border rounded-lg">
                             <div className="space-y-1.5">
                                <Label htmlFor={`gpa-${index}`}>Semester {index + 1} GPA</Label>
                                <Input id={`gpa-${index}`} type="number" value={semester.gpa} onChange={e => handleSemesterChange(index, 'gpa', e.target.value)} placeholder="e.g., 3.8"/>
                             </div>
                             <div className="space-y-1.5">
                                <Label htmlFor={`credits-${index}`}>Semester {index + 1} Credits</Label>
                                <Input id={`credits-${index}`} type="number" value={semester.credits} onChange={e => handleSemesterChange(index, 'credits', e.target.value)} placeholder="e.g., 18"/>
                             </div>
                             <Button variant="destructive" size="icon" onClick={() => removeSemester(index)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addSemester} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4"/>Add Another Semester
                    </Button>
                </CardContent>
             </Card>

            <Button onClick={calculateCgpa} className="w-full">
                <GraduationCap className="mr-2 h-4 w-4"/>Calculate CGPA
            </Button>
            
            {cgpa !== null && (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Your Cumulative GPA (CGPA)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{cgpa.toFixed(3)}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

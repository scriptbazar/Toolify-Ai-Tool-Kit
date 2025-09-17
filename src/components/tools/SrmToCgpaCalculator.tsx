
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PlusCircle, Trash2, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
    name: string;
    credits: string;
    grade: string;
}

const srmGradePoints: { [key: string]: number } = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0,
};

export function SrmToCgpaCalculator() {
    const [courses, setCourses] = useState<Course[]>([
        { name: '', credits: '', grade: 'O' },
        { name: '', credits: '', grade: 'A+' },
    ]);
    const [cgpa, setCgpa] = useState<number | null>(null);
    const { toast } = useToast();

    const handleCourseChange = (index: number, field: keyof Course, value: string) => {
        const newCourses = [...courses];
        newCourses[index][field] = value;
        setCourses(newCourses);
    };

    const addCourse = () => {
        setCourses([...courses, { name: '', credits: '', grade: 'O' }]);
    };

    const removeCourse = (index: number) => {
        if (courses.length > 1) {
            setCourses(courses.filter((_, i) => i !== index));
        } else {
            toast({ title: "Cannot remove last course", description: "You must have at least one course to calculate CGPA.", variant: "destructive" });
        }
    };

    const calculateCgpa = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        for (const course of courses) {
            const credits = parseFloat(course.credits);
            const point = srmGradePoints[course.grade];

            if (isNaN(credits) || credits <= 0) {
                 toast({ title: "Invalid Credits", description: `Please enter valid credits for all courses.`, variant: "destructive" });
                 return;
            }
            
            if (point !== undefined) {
                totalPoints += credits * point;
                totalCredits += credits;
            }
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
                    <CardTitle>Enter Your Grades</CardTitle>
                    <CardDescription>Add each course, its credits, and the grade you received according to SRM's grading system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {courses.map((course, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-4 items-end p-2 border rounded-lg">
                             <div className="space-y-1.5">
                                <Label htmlFor={`name-${index}`}>Course Name (Optional)</Label>
                                <Input id={`name-${index}`} value={course.name} onChange={e => handleCourseChange(index, 'name', e.target.value)} placeholder={`e.g., Data Structures`} />
                             </div>
                             <div className="space-y-1.5">
                                <Label htmlFor={`credits-${index}`}>Credits</Label>
                                <Input id={`credits-${index}`} type="number" value={course.credits} onChange={e => handleCourseChange(index, 'credits', e.target.value)} placeholder="e.g., 4"/>
                             </div>
                             <div className="space-y-1.5">
                                <Label htmlFor={`grade-${index}`}>Grade</Label>
                                <Select value={course.grade} onValueChange={val => handleCourseChange(index, 'grade', val)}>
                                    <SelectTrigger id={`grade-${index}`}><SelectValue/></SelectTrigger>
                                    <SelectContent>{Object.keys(srmGradePoints).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                             <Button variant="destructive" size="icon" onClick={() => removeCourse(index)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addCourse} className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4"/>Add Course
                    </Button>
                </CardContent>
             </Card>

            <Button onClick={calculateCgpa} className="w-full">
                <GraduationCap className="mr-2 h-4 w-4"/>Calculate CGPA
            </Button>
            
            {cgpa !== null && (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Your Calculated CGPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{cgpa.toFixed(2)}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

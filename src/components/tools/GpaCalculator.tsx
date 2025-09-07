
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PlusCircle, Trash2, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
    name: string;
    credits: string;
    grade: string;
}

const gradePoints: { [key: string]: number } = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
};

export function GpaCalculator() {
    const [courses, setCourses] = useState<Course[]>([{ name: '', credits: '', grade: 'A' }]);
    const [gpa, setGpa] = useState<number | null>(null);
    const { toast } = useToast();

    const handleCourseChange = (index: number, field: keyof Course, value: string) => {
        const newCourses = [...courses];
        newCourses[index][field] = value;
        setCourses(newCourses);
    };

    const addCourse = () => {
        setCourses([...courses, { name: '', credits: '', grade: 'A' }]);
    };

    const removeCourse = (index: number) => {
        setCourses(courses.filter((_, i) => i !== index));
    };

    const calculateGpa = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        for (const course of courses) {
            const credits = parseFloat(course.credits);
            const point = gradePoints[course.grade];
            if (!isNaN(credits) && credits > 0 && point !== undefined) {
                totalPoints += credits * point;
                totalCredits += credits;
            } else {
                toast({ title: "Invalid Input", description: "Please check all courses have valid credits and grades.", variant: "destructive" });
                return;
            }
        }
        
        if (totalCredits === 0) {
            setGpa(0);
        } else {
            setGpa(totalPoints / totalCredits);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {courses.map((course, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border rounded-md">
                        <div className="md:col-span-2"><Label>Course Name (Optional)</Label><Input value={course.name} onChange={e => handleCourseChange(index, 'name', e.target.value)} /></div>
                        <div><Label>Credits</Label><Input type="number" value={course.credits} onChange={e => handleCourseChange(index, 'credits', e.target.value)} /></div>
                        <div className="flex gap-2">
                          <div className="flex-grow"><Label>Grade</Label>
                            <Select value={course.grade} onValueChange={val => handleCourseChange(index, 'grade', val)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>{Object.keys(gradePoints).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <Button variant="destructive" size="icon" onClick={() => removeCourse(index)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={addCourse}><PlusCircle className="mr-2 h-4 w-4"/>Add Course</Button>
                <Button onClick={calculateGpa} className="flex-1"><GraduationCap className="mr-2 h-4 w-4"/>Calculate GPA</Button>
            </div>
            {gpa !== null && (
                <Card><CardHeader><CardTitle>Your GPA</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold text-primary">{gpa.toFixed(3)}</p></CardContent></Card>
            )}
        </div>
    );
}

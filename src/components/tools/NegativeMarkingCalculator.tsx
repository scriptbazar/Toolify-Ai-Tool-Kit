
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NegativeMarkingCalculator() {
  const [totalQuestions, setTotalQuestions] = useState('');
  const [marksPerCorrect, setMarksPerCorrect] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState('');
  const [incorrectAnswers, setIncorrectAnswers] = useState('');
  const [negativeMarks, setNegativeMarks] = useState('');
  const [result, setResult] = useState<{
    totalScore: number;
    positiveScore: number;
    negativeScore: number;
    unattempted: number;
  } | null>(null);
  const { toast } = useToast();

  const handleCalculate = () => {
    const totalQ = parseInt(totalQuestions, 10);
    const marksCorrect = parseFloat(marksPerCorrect);
    const correct = parseInt(correctAnswers, 10);
    const incorrect = parseInt(incorrectAnswers, 10);
    const negMarks = parseFloat(negativeMarks);

    if (
      isNaN(totalQ) || totalQ < 0 ||
      isNaN(marksCorrect) || marksCorrect < 0 ||
      isNaN(correct) || correct < 0 ||
      isNaN(incorrect) || incorrect < 0 ||
      isNaN(negMarks)
    ) {
      toast({ title: "Invalid Input", description: "Please enter valid, non-negative numbers for all fields.", variant: "destructive"});
      return;
    }

    if ((correct + incorrect) > totalQ) {
      toast({ title: "Check Your Numbers", description: "The sum of correct and incorrect answers cannot exceed the total number of questions.", variant: "destructive"});
      return;
    }

    const positiveScore = correct * marksCorrect;
    const negativeScore = incorrect * negMarks;
    const totalScore = positiveScore - negativeScore;
    const unattempted = totalQ - (correct + incorrect);

    setResult({
      totalScore,
      positiveScore,
      negativeScore,
      unattempted,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total-questions">Total Questions</Label>
          <Input id="total-questions" type="number" value={totalQuestions} onChange={e => setTotalQuestions(e.target.value)} placeholder="e.g., 100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marks-correct">Marks for Correct Answer</Label>
          <Input id="marks-correct" type="number" value={marksPerCorrect} onChange={e => setMarksPerCorrect(e.target.value)} placeholder="e.g., 4" />
        </div>
         <div className="space-y-2">
          <Label htmlFor="neg-marks">Marks Deducted for Wrong</Label>
          <Input id="neg-marks" type="number" value={negativeMarks} onChange={e => setNegativeMarks(e.target.value)} placeholder="e.g., 1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correct-answers">Correct Answers</Label>
          <Input id="correct-answers" type="number" value={correctAnswers} onChange={e => setCorrectAnswers(e.target.value)} placeholder="e.g., 75" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="incorrect-answers">Incorrect Answers</Label>
          <Input id="incorrect-answers" type="number" value={incorrectAnswers} onChange={e => setIncorrectAnswers(e.target.value)} placeholder="e.g., 15" />
        </div>
      </div>
      <Button onClick={handleCalculate} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate Score
      </Button>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Exam Score</CardTitle>
            <CardDescription>Here is the breakdown of your calculated score.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Positive Score</p>
              <p className="text-xl font-bold text-green-500">+{result.positiveScore.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Negative Score</p>
              <p className="text-xl font-bold text-red-500">-{result.negativeScore.toFixed(2)}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Unattempted</p>
              <p className="text-xl font-bold">{result.unattempted}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-primary">Final Score</p>
              <p className="text-2xl font-bold text-primary">{result.totalScore.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



'use client';

import { Card, CardContent } from '../ui/card';
import { Construction } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function PRNToPDF() {
  return (
    <Card className="flex flex-col items-center justify-center min-h-[300px]">
      <CardContent className="text-center p-6">
        <Construction className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-semibold">Tool Not Available</h3>
        <Alert variant="destructive" className="mt-4 text-left">
          <AlertTitle>Technical Limitation</AlertTitle>
          <AlertDescription>
            Converting PRN files to PDF is a highly complex process because the PRN format is specific to the printer driver that created it, not a universal standard. A reliable client-side converter is not feasible. We recommend re-printing the original document to a PDF printer instead.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

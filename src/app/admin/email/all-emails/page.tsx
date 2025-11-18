
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getEmailLog } from '@/ai/flows/send-email';
import { AllEmailsClient } from './_components/AllEmailsClient';

export const revalidate = 0; // Disable caching for this page

export default async function AllEmailsPage() {
  const initialEmails = await getEmailLog();

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">All Sent Emails</h1>
        <p className="text-muted-foreground">
          Browse the history of all sent emails from your system.
        </p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>
            A detailed log of all emails sent from your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AllEmailsClient initialEmails={initialEmails} />
        </CardContent>
      </Card>
    </div>
  );
}



import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Globe, CheckCircle, AlertTriangle } from 'lucide-react';
import { getLoginHistory } from '@/ai/flows/user-activity';
import type { UserLoginHistory } from '@/ai/flows/user-activity.types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin-auth';

const getDeviceIcon = (userAgent: string) => {
  if (/mobile/i.test(userAgent)) return <Smartphone className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

const parseUserAgent = (userAgent: string) => {
    const parts = userAgent.match(/\(([^)]+)\)/);
    return parts ? parts[1] : userAgent;
};

export default async function LoginHistoryPage() {
    let uid = '';
    try {
        const session = cookies().get('session')?.value || '';
        const decodedClaims = await getAdminAuth().verifySessionCookie(session);
        uid = decodedClaims.uid;
    } catch (error) {
        console.error("Error getting user session for login history:", error);
    }
    
    const history: UserLoginHistory[] = uid ? await getLoginHistory(uid) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Login History</h1>
        <p className="text-muted-foreground">
          A record of your recent account logins.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Logins</CardTitle>
          <CardDescription>This information helps you keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
           <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Did you know?</AlertTitle>
              <AlertDescription>
                If you see any suspicious activity, please change your password immediately from the <a href="/settings" className="font-bold underline">Profile Settings</a> page and enable Two-Factor Authentication.
              </AlertDescription>
            </Alert>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                           {getDeviceIcon(entry.userAgent)}
                           <span className="truncate max-w-xs">{parseUserAgent(entry.userAgent)}</span>
                        </div>
                    </TableCell>
                    <TableCell>{entry.location}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.ipAddress}</TableCell>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No login history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

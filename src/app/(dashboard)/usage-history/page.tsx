

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserActivity } from '@/ai/flows/user-activity';
import type { UserActivity, UserActivityType } from '@/ai/flows/user-activity.types';
import { BarChart3, Clock, Type, FileText, Newspaper, HelpCircle, Activity, ArrowLeft, ArrowRight } from 'lucide-react';
import { UsageHistoryClient } from './_components/UsageHistoryClient';
import { getAdminAuth } from '@/lib/firebase-admin-auth';
import { cookies } from 'next/headers';

const ACTIVITY_FETCH_LIMIT = 100;

export default async function UsageHistoryPage() {
    let uid = '';
    try {
        const session = cookies().get('session')?.value || '';
        const decodedClaims = await getAdminAuth().verifySessionCookie(session);
        uid = decodedClaims.uid;
    } catch (error) {
        console.error("Error getting user session for usage history:", error);
    }

    const activities: UserActivity[] = uid ? await getUserActivity(uid, ACTIVITY_FETCH_LIMIT) : [];
    
    return <UsageHistoryClient initialActivities={activities} />;
}

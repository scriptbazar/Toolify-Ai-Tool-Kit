

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getComments, type Comment } from '@/ai/flows/blog-management';
import { CommentsClient } from './_components/CommentsClient';

export const revalidate = 0; // Disable caching for this page to get fresh data

export default async function CommentsPage() {
    const initialComments = await getComments();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Comment Management</h1>
                <p className="text-muted-foreground">
                Moderate, approve, and manage all comments on your blog posts.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Comments</CardTitle>
                    <CardDescription>
                        View and moderate all user comments here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CommentsClient initialComments={initialComments} />
                </CardContent>
            </Card>
        </div>
    );
}



import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { getReviews } from '@/ai/flows/review-management';
import { notFound } from 'next/navigation';
import { ToolPage } from './_components/ToolPage';
import { ToolSidebar } from '@/components/tools/ToolSidebar';
import { getPosts } from '@/ai/flows/blog-management';
import type { Metadata, ResolvingMetadata } from 'next';
import { cache } from 'react';
import { getAdminAuth } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Props = {
  params: { slug: string }
}

export const generateMetadata = cache(async (
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const { slug } = params;
  const tools = await getTools({ slug });
  const tool = tools[0];

  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }

  return {
    title: tool.name,
    description: tool.description,
  }
});

// Statically generate routes at build time
export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}


export default async function ToolPageWrapper({ params }: { params: { slug: string } }) {

    // Fetch only the essential data for the main tool page
    const [settings, tools, toolReviews] = await Promise.all([
        getSettings(),
        getTools({ slug: params.slug }),
        getReviews({ toolId: params.slug })
    ]);
    
    let user = null;
    try {
        const adminAuth = getAdminAuth();
        const userDocRef = doc(db, 'users', (await adminAuth.verifySessionCookie(cookies().get('session')?.value || '')).uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            user = {
                uid: userDocSnap.id,
                email: data.email,
                role: data.role,
                planId: data.planId,
            }
        }
        
    } catch (error) {
        // User not logged in, user will be null
    }

    const tool = tools[0];
    
    // If the main tool is not found, return 404
    if (!tool || tool.status === 'Disabled') {
        notFound();
    }
    
    const adSettings = settings?.advertisement ?? null;

    return (
        <ToolPage
            tool={tool}
            toolReviews={toolReviews}
            adSettings={adSettings}
            user={user}
        >
            {/* The sidebar will now fetch its own data */}
            <ToolSidebar
                adSettings={adSettings}
                currentToolSlug={params.slug}
            />
        </ToolPage>
    );
}

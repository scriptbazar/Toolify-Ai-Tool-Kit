
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { WordCounter } from '@/components/tools/WordCounter';
import { LoremIpsumGenerator } from '@/components/tools/LoremIpsumGenerator';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { BmiCalculator } from '@/components/tools/BmiCalculator';
import { TextToSpeech } from '@/components/tools/TextToSpeech';
import { PdfMerger } from '@/components/tools/PdfMerger';
import { UnitConverter } from '@/components/tools/UnitConverter';
import { ColorPicker } from '@/components/tools/ColorPicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { notFound } from 'next/navigation';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/tools/ReviewForm';
import { getReviews } from '@/ai/flows/review-management';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPosts } from '@/ai/flows/blog-management';
import Link from 'next/link';

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

const toolComponents: { [key: string]: React.ComponentType } = {
  'case-converter': CaseConverter,
  'word-counter': WordCounter,
  'lorem-ipsum-generator': LoremIpsumGenerator,
  'password-generator': PasswordGenerator,
  'json-formatter': JsonFormatter,
  'bmi-calculator': BmiCalculator,
  'text-to-speech': TextToSpeech,
  'pdf-merger': PdfMerger,
  'unit-converter': UnitConverter,
  'color-picker': ColorPicker,
};

const SidebarWidget = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="p-4">
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {children}
        </CardContent>
    </Card>
);

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const awaitedParams = await Promise.resolve(params);
  const allTools = await getTools();
  const tool = allTools.find((t) => t.slug === awaitedParams.slug);
  const settings = await getSettings();
  
  if (!tool) {
    notFound();
  }

  const allReviews = await getReviews();
  const toolReviews = allReviews.filter(r => r.toolId === tool.slug && r.status === 'approved');

  const ToolComponent = toolComponents[tool.slug];
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  
  const sidebarSettings = settings.sidebar?.toolSidebar;
  const popularTools = allTools.filter(t => t.status === 'Active' && t.slug !== tool.slug).slice(0, 10);
  const recentPosts = (await getPosts()).filter(p => p.status === 'Published').slice(0, 10);


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <AdPlaceholder adSlotId="toolpage-banner-top" adSettings={settings.advertisement ?? null} className="mb-6" />
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-bold">{tool.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{tool.description}</p>
              
              <div className="min-h-[300px] rounded-lg bg-muted/50 p-4 sm:p-8">
                {ToolComponent ? <ToolComponent /> : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-lg text-muted-foreground">
                      Tool interface coming soon!
                    </p>
                  </div>
                )}
              </div>
              <AdPlaceholder adSlotId="toolpage-in-description" adSettings={settings.advertisement ?? null} className="my-6" />

              {tool.slug === 'case-converter' && (
                <div className="prose prose-sm dark:prose-invert max-w-none mt-8 pt-6 border-t">
                    <h2 className="text-2xl font-bold">✨ About the Case Converter Tool</h2>
                    <p>Our Case Converter is a powerful and easy-to-use utility designed to make text manipulation effortless. Whether you are a writer, developer, designer, or student, this tool will help you instantly transform your text into the desired format with just a single click. It's built to save you time and streamline your workflow.</p>
                    
                    <h3 className="text-xl font-semibold mt-6">🔑 Key Features:</h3>
                    <ul>
                        <li><strong>Sentence case:</strong> Automatically capitalizes the first letter of each sentence. Ideal for standard writing and proofreading.</li>
                        <li><strong>lowercase:</strong> Converts all characters in your text to their lowercase equivalents, perfect for standardizing data or text.</li>
                        <li><strong>UPPERCASE:</strong> Transforms all characters into their uppercase form, which is great for creating headlines, titles, or for emphasis.</li>
                        <li><strong>Title Case:</strong> Capitalizes the first letter of every word. This is particularly useful for formatting headlines, titles of articles, and headings in documents.</li>
                        <li><strong>Word & Character Count:</strong> Get a real-time count of words and characters as you type, helping you stay on top of your writing metrics.</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6">🚀 How to Use:</h3>
                    <ol>
                        <li><strong>Enter Text:</strong> Simply type or paste the text you want to convert into the provided text area.</li>
                        <li><strong>Choose Conversion:</strong> Click one of the four conversion buttons (Sentence case, lowercase, UPPERCASE, Title Case) to instantly transform your text.</li>
                        <li><strong>Copy Result:</strong> Use the copy button to grab your newly formatted text and use it wherever you need.</li>
                    </ol>

                    <h3 className="text-xl font-semibold mt-6">💡 Why Use Our Tool?</h3>
                    <p>The Case Converter provides a clean, intuitive interface that ensures a seamless user experience. With its variety of conversion options and helpful metrics, you can format your text exactly how you need it in seconds. Simply type or paste, choose a conversion, and copy the result. It's that easy!</p>
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="mt-8">
              <CardHeader>
                  <CardTitle>Reviews for {tool.name}</CardTitle>
                  <CardDescription>See what other users are saying about this tool.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ReviewForm toolId={tool.slug} toolName={tool.name} />
                  <Separator className="my-8" />
                  <div className="space-y-6">
                      {toolReviews.length > 0 ? toolReviews.map(review => (
                          <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.authorAvatar} alt={review.authorName} />
                                    <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{review.authorName}</p>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                            ))}
                                        </div>
                                    </div>
                                     <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                                </div>
                          </div>
                      )) : (
                          <p className="text-muted-foreground text-center">No reviews for this tool yet. Be the first to leave one!</p>
                      )}
                  </div>
              </CardContent>
          </Card>
        </div>
         <aside className="w-full lg:w-64 xl:w-80 mt-8 lg:mt-0 space-y-6">
            <AdPlaceholder adSlotId="toolpage-sidebar" adSettings={settings.advertisement ?? null} />
             {sidebarSettings?.showPopularTools && popularTools.length > 0 && (
                <SidebarWidget title="Popular Tools">
                    <ul className="space-y-2">
                        {popularTools.map(t => {
                            const ToolIcon = (Icons as any)[t.icon] || Icons.HelpCircle;
                            return (
                            <li key={t.id}>
                                <Link href={`/tools/${t.slug}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted">
                                    <ToolIcon className="h-5 w-5" />
                                    <span>{t.name}</span>
                                </Link>
                            </li>
                        )})}
                    </ul>
                </SidebarWidget>
            )}
            {sidebarSettings?.showRecentPosts && recentPosts.length > 0 && (
                 <SidebarWidget title="Recent Posts">
                     <ul className="space-y-3">
                        {recentPosts.map(post => (
                            <li key={post.id}>
                                <Link href={`/blog/${post.slug}`} className="group">
                                    <p className="font-medium text-sm group-hover:text-primary transition-colors leading-tight">{post.title}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(post.publishedAt!).toLocaleDateString()}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </SidebarWidget>
            )}
        </aside>
      </div>
      <AdPlaceholder adSlotId="toolpage-banner-bottom" adSettings={settings.advertisement ?? null} className="mt-6" />
    </div>
  );
}

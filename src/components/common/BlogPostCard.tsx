
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

type BlogPostCardProps = {
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  href: string;
};

export function BlogPostCard({ category, title, description, imageUrl, imageHint, href }: BlogPostCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
        <div className="aspect-[3/2] overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            width={600}
            height={400}
            data-ai-hint={imageHint}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-primary mb-2">{category}</p>
          <h3 className="text-lg font-semibold mb-3 leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

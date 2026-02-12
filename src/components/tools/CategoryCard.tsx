
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { ToolCategoryDetails } from '@/lib/constants';
import { cn } from '@/lib/utils';

type CategoryCardProps = {
  category: ToolCategoryDetails;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const { id, name, Icon, color } = category;

  return (
    <Link href={`/tools?category=${id}`} className="group block h-full">
      <Card className={cn(
        "h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 p-6 flex flex-col items-center text-center border-2",
        color?.border
      )}>
        <div className={cn(
          "flex items-center justify-center h-16 w-16 mb-4 rounded-full transition-colors group-hover:bg-primary",
          color?.bg || "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-8 w-8 transition-colors group-hover:text-primary-foreground",
            color?.text || "text-primary"
          )} />
        </div>
        <CardContent className="p-0 flex flex-col flex-grow justify-center">
          <h3 className="text-base font-bold">{name.replace(' Tools', '')}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}


'use client';

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
        "h-full rounded-2xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 p-6 flex flex-col items-center text-center border-2",
        color.border
      )}>
        <div className={cn(
          "flex items-center justify-center h-16 w-16 mb-4 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm",
          color.bg
        )}>
          <Icon className={cn(
            "h-8 w-8 transition-colors",
            color.text
          )} />
        </div>
        <CardContent className="p-0 flex flex-col flex-grow justify-center">
          <h3 className="text-base font-bold tracking-tight">{name.replace(' Tools', '')}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}

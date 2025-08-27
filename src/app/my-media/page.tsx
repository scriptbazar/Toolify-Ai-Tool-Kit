'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

export default function MyMediaPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Media</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed rounded-lg">
            <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Your generated media will be stored here.</p>
            <p className="text-muted-foreground">This feature is currently under construction.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

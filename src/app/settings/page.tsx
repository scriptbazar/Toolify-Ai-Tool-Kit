'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed rounded-lg">
            <Settings className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">The settings page is under construction.</p>
            <p className="text-muted-foreground">You will be able to manage your preferences here soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

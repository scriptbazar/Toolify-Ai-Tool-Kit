'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed rounded-lg">
            <User className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">The user profile page is under construction.</p>
            <p className="text-muted-foreground">You will be able to manage your account details here soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

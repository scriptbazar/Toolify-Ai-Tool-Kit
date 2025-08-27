'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function ReferFriendPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Refer a Friend</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed rounded-lg">
            <UserPlus className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Our referral system is under construction.</p>
            <p className="text-muted-foreground">Check back soon to get rewards for inviting friends!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

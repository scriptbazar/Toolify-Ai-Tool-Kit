
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

type TeamMember = {
  name: string;
  role: string;
  avatar: string;
};

type TeamMemberCardProps = {
  member: TeamMember;
};

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
        <CardContent className="p-0 flex flex-col items-center">
            <div className="relative h-32 w-32 mb-4">
                <Image
                    src={member.avatar}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="rounded-full object-cover shadow-lg"
                />
            </div>
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <p className="text-primary">{member.role}</p>
        </CardContent>
    </Card>
  );
}

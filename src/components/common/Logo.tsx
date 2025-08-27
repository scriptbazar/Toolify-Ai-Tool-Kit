import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export const Logo = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-6 w-6 text-primary", className)} />
);

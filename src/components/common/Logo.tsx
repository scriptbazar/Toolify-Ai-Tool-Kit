import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export const Logo = ({ className }: { className?: string }) => (
    <Sparkles className={cn("h-8 w-8 text-primary", className)} />
);

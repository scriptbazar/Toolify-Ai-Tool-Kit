import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("h-6 w-6 text-primary", className)}
  >
    <path
      d="M17.5 12C17.5 15.5899 14.5899 18.5 11 18.5C7.41015 18.5 4.5 15.5899 4.5 12C4.5 8.41015 7.41015 5.5 11 5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 12C19.5 15.5899 16.5899 18.5 13 18.5C9.41015 18.5 6.5 15.5899 6.5 12C6.5 8.41015 9.41015 5.5 13 5.5C16.5899 5.5 19.5 8.41015 19.5 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

import { AppProviders } from '@/components/AppProviders';
import { ThemeProvider } from '@/components/common/ThemeProvider';

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppProviders>
        {children}
      </AppProviders>
    </ThemeProvider>
  );
}

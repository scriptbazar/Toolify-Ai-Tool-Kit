
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StatCardProps = {
    title: string,
    value: string,
    icon: React.ElementType,
    onClick?: () => void
}

export const StatCard = ({ title, value, icon: Icon, onClick }: StatCardProps) => (
  <Card onClick={onClick} className={onClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

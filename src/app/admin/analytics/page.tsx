

import { AdminAnalyticsClient } from './_components/AdminAnalyticsClient';
import { getAdminActivityLog } from '@/ai/flows/user-activity';
import { collection, getDocs, getCountFromServer, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { unstable_noStore as noStore } from 'next/cache';

interface ChartData {
  month: string;
  users: number;
}

interface UserCounts {
    totalUsers: number;
    newUsers: number;
    totalLeads: number;
    activeUsers: number;
    totalUsersChange: string;
    totalLeadsChange: string;
    newUsersChange: string;
}

interface PieChartData {
  name: string;
  value: number;
}


const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

async function getAnalyticsData() {
    noStore();
    try {
        const usersRef = collection(db, 'users');
        const leadsRef = collection(db, 'leads');

        const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
        const sixtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 60));
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const newUsersQuery = query(usersRef, where('createdAt', '>=', thirtyDaysAgo));
        const prevNewUsersQuery = query(usersRef, where('createdAt', '>=', sixtyDaysAgo), where('createdAt', '<', thirtyDaysAgo));
        const activeUsersQuery = query(usersRef, where('lastActive', '>=', fiveMinutesAgo));
        const prevTotalLeadsQuery = query(leadsRef, where('createdAt', '<', thirtyDaysAgo));
        
        const [
            usersCountSnap, 
            leadsCountSnap, 
            newUsersSnap,
            prevNewUsersSnap,
            activeUsersSnap,
            prevTotalLeadsSnap,
            allUsersSnap,
        ] = await Promise.all([
            getCountFromServer(usersRef),
            getCountFromServer(leadsRef),
            getCountFromServer(newUsersQuery),
            getCountFromServer(prevNewUsersQuery),
            getCountFromServer(activeUsersQuery),
            getCountFromServer(prevTotalLeadsQuery),
            getDocs(usersRef),
        ]);

        const totalUsers = usersCountSnap.data().count;
        const totalLeads = leadsCountSnap.data().count;
        const newUsersCount = newUsersSnap.data().count;
        const prevNewUsersCount = prevNewUsersSnap.data().count;
        const activeUsersCount = activeUsersSnap.data().count;
        const prevTotalUsers = totalUsers - newUsersCount;
        const prevTotalLeads = prevTotalLeadsSnap.data().count;
        
        const stats = { 
            totalUsers, 
            totalLeads,
            newUsers: newUsersCount,
            activeUsers: activeUsersCount,
            totalUsersChange: calculatePercentageChange(totalUsers, prevTotalUsers),
            totalLeadsChange: calculatePercentageChange(totalLeads, prevTotalLeads),
            newUsersChange: calculatePercentageChange(newUsersCount, prevNewUsersCount)
        };

        const monthlySignups: { [key: string]: number } = {};
        allUsersSnap.forEach(doc => {
            const user = doc.data();
            if (user.createdAt && user.createdAt.seconds) {
                const date = (user.createdAt as Timestamp).toDate();
                if (date.getFullYear() === new Date().getFullYear()) {
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                    monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
                }
            }
        });
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentYear = new Date().getFullYear();
        const lineChartData: ChartData[] = Array.from({length: 12}, (_, i) => {
          const monthKey = `${currentYear}-${i}`;
          return {
            month: monthNames[i],
            users: monthlySignups[monthKey] || 0,
          };
        });
        
        const pieChartData: PieChartData[] = [
            { name: 'Signup Users', value: totalUsers },
            { name: 'Lead Users', value: totalLeads },
        ];
        
        return { stats, lineChartData, pieChartData };

      } catch (error) {
        console.error("Error fetching analytics data:", error);
        // Return default/empty state on error to prevent crash
        return {
             stats: { totalUsers: 0, newUsers: 0, totalLeads: 0, activeUsers: 0, totalUsersChange: '0%', totalLeadsChange: '0%', newUsersChange: '0%'},
             lineChartData: [],
             pieChartData: [],
        }
      }
}


export default async function AdminAnalyticsPage() {
  const { stats, lineChartData, pieChartData } = await getAnalyticsData();
  const activityLog = await getAdminActivityLog();

  return (
    <AdminAnalyticsClient 
        stats={stats}
        lineChartData={lineChartData}
        pieChartData={pieChartData}
        activityLog={activityLog}
    />
  );
}



import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllEmails } from '@/ai/flows/user-management';
import { AdminDashboardClient } from './_components/DashboardClient';
import { unstable_noStore as noStore } from 'next/cache';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  date: string;
  amount: string;
}

interface UserCounts {
    all: number;
    signup: number;
    lead: number;
    affiliate: number;
}

interface ChartData {
  month: string;
  users: number;
}

async function getDashboardData() {
    noStore();
    const [allEmails, affiliatesSnapshot] = await Promise.all([
      getAllEmails(),
      getDocs(query(collection(db, "users"), where("affiliateStatus", "==", "approved")))
    ]);

    const recentUsers = allEmails
        .filter(u => u.source === 'Signup')
        .slice(0, 5)
        .map(user => ({
            id: user.id,
            name: user.name || 'Unknown',
            email: user.email,
            plan: 'Free', // Placeholder
            status: 'Approved', // Placeholder
            date: new Date(user.date).toLocaleDateString(),
            amount: '$0.00', // Placeholder
        }));

    const signupCount = allEmails.filter(u => u.source === 'Signup').length;
    const leadCount = allEmails.filter(u => u.source === 'Lead').length;
    const affiliateCount = affiliatesSnapshot.size;
    
    const userCounts = {
        signup: signupCount,
        lead: leadCount,
        all: signupCount + leadCount,
        affiliate: affiliateCount,
    };

    const monthlySignups: { [key: string]: number } = {};
    allEmails.forEach(user => {
        if (user.source === 'Signup') {
            const date = new Date(user.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
        }
    });
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const fullYearData: ChartData[] = [];
    for (let i = 0; i < 12; i++) {
      const monthKey = `${currentYear}-${i}`;
      fullYearData.push({
        month: monthNames[i],
        users: monthlySignups[monthKey] || 0,
      });
    }
    
    return { userCounts, recentUsers, chartData: fullYearData };
}


export default async function AdminDashboard() {
  const dashboardData = await getDashboardData();

  return (
    <AdminDashboardClient
        userCounts={dashboardData.userCounts}
        recentUsers={dashboardData.recentUsers}
        chartData={dashboardData.chartData}
    />
  );
}

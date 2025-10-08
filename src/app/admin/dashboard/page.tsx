
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { collection, getDocs, limit, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { AdminDashboardClient } from './_components/DashboardClient';

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
    const db = getAdminDb();

    // Fetch all users for counts and chart data
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
    
    // Fetch leads and affiliates
    const leadsRef = collection(db, 'leads');
    const affiliateQuery = query(collection(db, 'users'), where('affiliateStatus', '==', 'approved'));

    const [usersSnapshot, leadsSnapshot, affiliateSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(leadsRef),
        getDocs(affiliateQuery)
    ]);
    
    const allUsersList = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
    }));
    
    // --- Process Chart Data ---
    const monthlySignups: { [key: string]: number } = {};
    allUsersList.forEach(user => {
      const createdAt = user.createdAt as Timestamp;
      if (createdAt && createdAt.toDate) {
        const date = createdAt.toDate();
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

    // --- Process Recent Users Table (first 5) ---
    const recentUsers: User[] = usersSnapshot.docs.slice(0, 5).map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      return {
        id: doc.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        plan: data.planId || 'Free',
        status: 'Approved', 
        date: createdAt ? createdAt.toDate().toLocaleDateString() : 'N/A',
        amount: '$0.00', 
      };
    });

    // --- Process Stat Cards ---
    const signupCount = usersSnapshot.size;
    const leadCount = leadsSnapshot.size;
    const affiliateCount = affiliateSnapshot.size;
    
    const userCounts: UserCounts = {
        signup: signupCount,
        lead: leadCount,
        all: signupCount + leadCount,
        affiliate: affiliateCount,
    };
    
    return { userCounts, recentUsers, chartData: fullYearData };
}

export default async function AdminDashboard() {
  const { userCounts, recentUsers, chartData } = await getDashboardData();

  return (
    <AdminDashboardClient
        userCounts={userCounts}
        recentUsers={recentUsers}
        chartData={chartData}
    />
  );
}

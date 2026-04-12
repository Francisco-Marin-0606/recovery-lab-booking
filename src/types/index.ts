export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  bookedCount: number;
  capacity: number;
}

export interface Booking {
  id?: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  quantity: number;
  sport: string;
  reason: string;
  referredBy: string;
  sellerCode?: string;
}

export interface Seller {
  id?: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  createdAt: string;
}

export interface DashboardData {
  monthlyPeople: number;
  todayPeople: number;
  idealPace: number;
  paceGap: number;
  recurringClients: { name: string; email: string; visits: number; totalPeople: number; lastVisit: string }[];
  totalUniqueClients: number;
  dailyBreakdown: { date: string; label: string; people: number }[];
  monthlyPercent: number;
  dailyPercent: number;
  monthBookingsCount: number;
  topSports: { sport: string; count: number }[];
  hourDistribution: number[];
  peakHour: number;
  topReferrals: { name: string; count: number }[];
  todayBookingsList: Booking[];
  totalPeopleAllTime: number;
  avgPerDay: number;
  daysAboveGoal: number;
}

export interface SellerWithReferrals extends Seller {
  referrals: number;
}

export interface SellerRankings {
  weekly: SellerWithReferrals[];
  monthly: SellerWithReferrals[];
}

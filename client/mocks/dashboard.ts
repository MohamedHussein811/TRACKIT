import { DashboardStats } from '@/types';

export const dashboardStats: DashboardStats = {
  totalProducts: 8,
  lowStockItems: 3,
  pendingOrders: 2,
  upcomingEvents: 5,
  recentSales: {
    amount: 12450.75,
    change: 8.5
  },
  topProducts: [
    {
      name: 'Premium Coffee Beans',
      quantity: 120
    },
    {
      name: 'Artisanal Chocolate Bars',
      quantity: 85
    },
    {
      name: 'Organic Flour',
      quantity: 72
    }
  ]
};
export interface User {
  _id: string;
  name: string;
  email: string;
  businessName?: string;
  userType: "business" | "supplier" | "distributor" | "organizer";
  avatar?: string;
  phone?: string;
  address?: string;
  categories?: string[];
  permissions?: string[];
  token?: string;
  rating: number;
  productsCount: number;
  ordersCount: number;
  eventsCount: number;
  subscriptions?: SubscriptionPlan[];
  subscription?: SubscriptionPlan;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  stock?: number;
  lowStockThreshold?: number;
  minStockLevel: number;
  sku: string;
  barcode?: string;
  image?: string;
  supplier?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  image?: string; // Added image property
  categories: string[];
  rating: number;
  productsCount: number;
}

export interface Order {
  _id: string;
  ownerId: string;
  ownerName: string;
  businessName?: string;
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "new"
    | "processing";
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderDate: string;
  estimatedDelivery?: string;
  expectedDelivery?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  image: string | undefined;
  productId: {
    _id: string;
    name: string;
    sku: string;
    barcode: string;
    image: string;
    price: number;
    cost: number;
  };
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizerId?: string;
  organizerName?: string;
  image?: string;
  category?: string; // Added category property
  price?: number; // Added price property
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  attendees?: number;
  isBooked?: boolean;
  isRegistered?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalSales?: number;
  pendingOrders: number;
  upcomingEvents: number;
  monthlySales?: MonthlySales[];
  topSellingProducts?: TopSellingProduct[];
  recentOrders?: Order[];
  topProducts?: {
    // Added topProducts property
    name: string;
    quantity: number;
  }[];
  recentSales?: {
    // Added recentSales property
    amount: number;
    change: number;
  };
}

export interface MonthlySales {
  month: string;
  sales: number;
  unitsSold: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  quantity: number;
  amount: number;
}

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  salesByCategory: SalesByCategory[];
  salesByMonth: SalesByMonth[];
  topProducts: TopProduct[];
}

export interface SalesByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface SalesByMonth {
  month: string;
  amount: number;
  unitsSold: number;
}

export interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  amount: number;
}

export interface SupplierDashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenue[];
  topSellingProducts: TopSellingProduct[];
  recentOrders: Order[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  recommended?: boolean;
}

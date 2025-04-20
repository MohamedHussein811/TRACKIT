import { Order } from '@/types';

// Extended Order type with businessName for supplier view
export interface SupplierOrder extends Order {
  businessName: string;
}

export const supplierOrders: SupplierOrder[] = [
  {
    id: 'so1',
    supplierId: 's1',
    supplierName: 'Global Coffee Suppliers',
    businessName: "Mostafa's Gourmet Market",
    status: 'new',
    items: [
      {
        productId: 'p1',
        productName: 'Premium Coffee Beans',
        quantity: 30,
        unitPrice: 24.99
      },
      {
        productId: 'p7',
        productName: 'Specialty Tea Collection',
        quantity: 15,
        unitPrice: 32.99
      }
    ],
    totalAmount: 1244.55,
    orderDate: '2023-10-15',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
  },
  {
    id: 'so2',
    supplierId: 's1',
    supplierName: 'Global Coffee Suppliers',
    businessName: 'Artisan Cafe',
    status: 'pending',
    items: [
      {
        productId: 'p1',
        productName: 'Premium Coffee Beans',
        quantity: 25,
        unitPrice: 24.99
      }
    ],
    totalAmount: 624.75,
    orderDate: '2023-10-14',
    createdAt: '2023-10-14',
    updatedAt: '2023-10-14',
  },
  {
    id: 'so3',
    supplierId: 's1',
    supplierName: 'Global Coffee Suppliers',
    businessName: 'Urban Brews',
    status: 'processing',
    items: [
      {
        productId: 'p1',
        productName: 'Premium Coffee Beans',
        quantity: 40,
        unitPrice: 24.99
      },
      {
        productId: 'p7',
        productName: 'Specialty Tea Collection',
        quantity: 20,
        unitPrice: 32.99
      }
    ],
    totalAmount: 1659.40,
    orderDate: '2023-10-12',
    expectedDelivery: '2023-10-19',
    createdAt: '2023-10-12',
    updatedAt: '2023-10-12',
  },
  {
    id: 'so4',
    supplierId: 's1',
    supplierName: 'Global Coffee Suppliers',
    businessName: 'Coffee Corner',
    status: 'shipped',
    items: [
      {
        productId: 'p1',
        productName: 'Premium Coffee Beans',
        quantity: 35,
        unitPrice: 24.99
      }
    ],
    totalAmount: 874.65,
    orderDate: '2023-10-10',
    expectedDelivery: '2023-10-17',
    trackingNumber: 'GCS-87654321',
    createdAt: '2023-10-10',
    updatedAt: '2023-10-10',
  },
  {
    id: 'so5',
    supplierId: 's1',
    supplierName: 'Global Coffee Suppliers',
    businessName: 'Morning Brew Cafe',
    status: 'delivered',
    items: [
      {
        productId: 'p1',
        productName: 'Premium Coffee Beans',
        quantity: 20,
        unitPrice: 24.99
      },
      {
        productId: 'p7',
        productName: 'Specialty Tea Collection',
        quantity: 10,
        unitPrice: 32.99
      }
    ],
    totalAmount: 829.70,
    orderDate: '2023-10-05',
    expectedDelivery: '2023-10-12',
    trackingNumber: 'GCS-12345678',
    createdAt: '2023-10-05',
    updatedAt: '2023-10-05',
  },
  {
    id: 'so6',
    supplierId: 's1',
    supplierName: 'Global Coffee Suppliers',
    businessName: 'Bean & Leaf',
    status: 'new',
    items: [
      {
        productId: 'p7',
        productName: 'Specialty Tea Collection',
        quantity: 25,
        unitPrice: 32.99
      }
    ],
    totalAmount: 824.75,
    orderDate: '2023-10-15',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
  }
];
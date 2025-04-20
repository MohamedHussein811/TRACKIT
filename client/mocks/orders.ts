import { Order } from '@/types';

export const orders: Order[] = [
  {
    id: 'o1',
    supplierId: 's1',
    supplierName: 'Global Coffee Suppliers',
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
    orderDate: '2023-09-15',
    expectedDelivery: '2023-09-22',
    trackingNumber: 'GCS-12345678'
  },
  {
    id: 'o2',
    supplierId: 's2',
    supplierName: 'Organic Essentials',
    status: 'shipped',
    items: [
      {
        productId: 'p2',
        productName: 'Organic Flour',
        quantity: 30,
        unitPrice: 8.99
      },
      {
        productId: 'p5',
        productName: 'Organic Olive Oil',
        quantity: 15,
        unitPrice: 18.75
      }
    ],
    totalAmount: 550.95,
    orderDate: '2023-10-01',
    expectedDelivery: '2023-10-10',
    trackingNumber: 'OE-87654321'
  },
  {
    id: 'o3',
    supplierId: 's3',
    supplierName: 'Kitchen Essentials Co.',
    status: 'processing',
    items: [
      {
        productId: 'p3',
        productName: 'Stainless Steel Cutlery Set',
        quantity: 5,
        unitPrice: 89.99
      },
      {
        productId: 'p6',
        productName: 'Ceramic Dinner Plates',
        quantity: 8,
        unitPrice: 65.00
      }
    ],
    totalAmount: 969.95,
    orderDate: '2023-10-08',
    expectedDelivery: '2023-10-18'
  },
  {
    id: 'o4',
    supplierId: 's4',
    supplierName: 'Sweet Delights',
    status: 'pending',
    items: [
      {
        productId: 'p4',
        productName: 'Artisanal Chocolate Bars',
        quantity: 40,
        unitPrice: 12.50
      }
    ],
    totalAmount: 500.00,
    orderDate: '2023-10-12'
  },
  {
    id: 'o5',
    supplierId: 's5',
    supplierName: 'Spice Traders',
    status: 'pending',
    items: [
      {
        productId: 'p8',
        productName: 'Gourmet Spice Set',
        quantity: 12,
        unitPrice: 45.50
      }
    ],
    totalAmount: 546.00,
    orderDate: '2023-10-14'
  }
];
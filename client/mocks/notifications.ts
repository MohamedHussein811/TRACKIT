import { Notification } from '@/types';

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'Low Stock Alert',
    message: 'Organic Flour is below minimum stock level (12 remaining).',
    type: 'inventory',
    read: false,
    date: '2023-10-14T09:23:15Z',
    actionId: 'p2',
    actionType: 'product'
  },
  {
    id: 'n2',
    title: 'Order Status Update',
    message: 'Your order #o2 from Organic Essentials has been shipped.',
    type: 'order',
    read: false,
    date: '2023-10-13T14:45:30Z',
    actionId: 'o2',
    actionType: 'order'
  },
  {
    id: 'n3',
    title: 'Upcoming Event',
    message: 'Reminder: Sustainable Supply Chain Workshop is in 7 days.',
    type: 'event',
    read: true,
    date: '2023-10-12T08:15:00Z',
    actionId: 'e2',
    actionType: 'event'
  },
  {
    id: 'n4',
    title: 'New Order Placed',
    message: 'Order #o4 has been successfully placed with Sweet Delights.',
    type: 'order',
    read: true,
    date: '2023-10-12T10:30:45Z',
    actionId: 'o4',
    actionType: 'order'
  },
  {
    id: 'n5',
    title: 'Expiring Soon',
    message: 'Artisanal Chocolate Bars will expire in 30 days.',
    type: 'inventory',
    read: false,
    date: '2023-10-11T16:20:10Z',
    actionId: 'p4',
    actionType: 'product'
  },
  {
    id: 'n6',
    title: 'System Update',
    message: 'TrackIt app has been updated to version 2.1.0.',
    type: 'system',
    read: true,
    date: '2023-10-10T22:05:30Z'
  }
];
import { Supplier, User } from '@/types';
import api from '@/utils/apiClient';

export const fetchSuppliers = async (): Promise<User[]> => {
  try {
    const response = await api.get<any[]>('/suppliers');
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
};



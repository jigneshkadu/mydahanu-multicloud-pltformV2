
export enum UserRole {
  USER = 'USER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface Category {
  id: string;
  name: string;
  subCategories?: Category[];
  icon?: string; // name of the Lucide icon
  description?: string;
  themeColor?: string; // New property for dynamic theming
}

export interface Product {
  name: string;
  price: number;
}

export interface Vendor {
  id: string;
  name: string;
  categoryIds: string[];
  description: string;
  rating: number;
  location: { lat: number; lng: number; address: string };
  contact: string; // Real contact (hidden)
  maskedContact: string; // Public contact
  isVerified: boolean;
  isApproved: boolean; // New field for approval workflow
  imageUrl: string;
  priceStart: number;
  email?: string;
  products?: Product[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  altText: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface MapPoint {
  lat: number;
  lng: number;
  title: string;
  type: 'vendor' | 'user';
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';

export interface Order {
  id: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  serviceRequested: string;
  date: string;
  status: OrderStatus;
  amount?: number;
  address: string;
}

export interface SystemConfig {
  smtpServer: string;
  port: string;
  username: string;
  password?: string;
  alertEmail: string;
  enableAlerts: boolean;
}
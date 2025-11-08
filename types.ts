// FIX: Removed circular import of 'Role' which was causing a declaration conflict.

export enum Role {
  ADMIN = 'Admin',
  CASHIER = 'Cashier',
  SERVER = 'Server',
  KITCHEN = 'Kitchen',
  DELIVERY_PARTNER = 'Delivery Partner',
  CUSTOMER = 'Customer',
}

export interface Location {
  lat: number;
  lng: number;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'None';

export interface Reward {
  id: string;
  tier: LoyaltyTier;
  description: string;
  isClaimed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatarUrl: string;
  status: 'Online' | 'Offline';
  lastLogin: string;
  location?: Location;
  loyaltyPoints?: number;
  loyaltyTier?: LoyaltyTier;
  rewards?: Reward[];
  address?: string;
  phoneNumber?: string;
  hourlyRate?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'g' | 'litre' | 'ml' | 'piece';
  stock: number;
  cost: number; // Cost per unit
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  selectionType: 'single' | 'multiple';
  options: ModifierOption[];
}

export interface MenuItemAiAnalysis {
  category: 'Star' | 'Plow-Horse' | 'Puzzle' | 'Dog';
  suggestions: string[];
}

export interface MenuItem {
  id:string;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl: string;
  modifierGroupIds?: string[];
  recipe?: RecipeItem[];
  aiAnalysis?: MenuItemAiAnalysis;
  prepTime: number; // in minutes
}

export enum OrderStatus {
  PENDING = 'Pending',
  AWAITING_ACCEPTANCE = 'Awaiting Acceptance',
  PREPARING = 'Preparing',
  READY = 'Ready',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export enum OrderType {
  DINE_IN = 'Dine-in',
  TAKEOUT = 'Takeout',
  DELIVERY = 'Delivery',
}

export interface SelectedModifier {
  groupId: string;
  optionId: string;
  name: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  name: string;
  selectedModifiers?: SelectedModifier[];
}

export interface Bill {
    id: string;
    items: OrderItem[];
    total: number;
    paymentStatus: 'Paid' | 'Unpaid';
    qrCodeUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerId?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  type: OrderType;
  createdAt: string;
  deliveryPartnerId?: string;
  customerLocation?: Location;
  tableNumber?: number;
  rating?: number;
  feedback?: string;
  address?: string;
  phoneNumber?: string;
  paymentStatus: 'Paid' | 'Unpaid';
  paymentMethod?: 'Online' | 'Cash' | 'Card';
  bills?: Bill[];
}

export enum TableStatus {
    AVAILABLE = 'Available',
    OCCUPIED = 'Occupied',
    RESERVED = 'Reserved',
    NEEDS_CLEANING = 'Needs Cleaning',
}

export interface Table {
    id: string;
    number: number;
    status: TableStatus;
    orderId?: string;
}

export interface Shift {
    id: string;
    cashierId: string;
    startTime: string;
    endTime?: string;
    startFloat: number;
    endFloat?: number;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  start: string;
  end: string;
}


export interface ActivityLog {
    id: string;
    actor: {
        id: string;
        name: string;
        role: Role;
    };
    message: string;
    timestamp: string;
}

export enum ReservationStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    CANCELLED = 'Cancelled',
    COMPLETED = 'Completed',
}

export interface Reservation {
    id: string;
    customerId: string;
    customerName: string;
    tableNumber: number;
    reservationTime: string;
    partySize: number;
    status: ReservationStatus;
}


export enum Screen {
  DASHBOARD = 'Dashboard',
  USERS = 'Users',
  MENU = 'Menu',
  MENU_INTELLIGENCE = 'MenuIntelligence',
  ORDERS = 'Orders',
  ANALYTICS = 'Analytics',
  TABLES = 'Tables',
  KDS = 'KDS',
  DELIVERY_DASHBOARD = 'DeliveryDashboard',
  CASHIER_DASHBOARD = 'CashierDashboard',
  LOGIN = 'Login',
  SIGNUP = 'Signup',
  CUSTOMER_DASHBOARD = 'CustomerDashboard',
  CUSTOMER_ORDERS = 'CustomerOrders',
  CUSTOMER_MENU = 'CustomerMenu',
  MODIFIERS = 'Modifiers',
  RESERVATIONS = 'Reservations',
  CUSTOMER_RESERVATIONS = 'CustomerReservations',
  INGREDIENTS = 'Ingredients',
  STAFF_SCHEDULE = 'StaffSchedule',
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
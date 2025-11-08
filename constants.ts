// FIX: Corrected import path for types.
import { User, Role, MenuItem, Order, OrderStatus, OrderType, Location, Table, TableStatus, Shift, ActivityLog, ModifierGroup, Reservation, ReservationStatus, Ingredient } from './types';

export const RESTAURANT_LOCATION: Location = { lat: 34.0522, lng: -118.2437 };
export const RESTAURANT_ADDRESS: string = '123 Flavor St, Los Angeles, CA 90012';

// FIX: Populated MOCK_USERS with all roles to ensure they exist on app start, fixing login issues.
export const MOCK_USERS: User[] = [
  { id: 'usr_001', name: 'Admin User', email: 'admin@rms.com', password: 'password123', role: Role.ADMIN, avatarUrl: 'https://picsum.photos/seed/admin/100/100', status: 'Online', lastLogin: '2024-07-28T10:00:00Z' },
  { id: 'usr_002', name: 'Cashier Cash', email: 'cashier@rms.com', password: 'password123', role: Role.CASHIER, avatarUrl: 'https://picsum.photos/seed/cashier/100/100', status: 'Offline', lastLogin: new Date().toISOString(), hourlyRate: 150 },
  { id: 'usr_003', name: 'Server Steve', email: 'server@rms.com', password: 'password123', role: Role.SERVER, avatarUrl: 'https://picsum.photos/seed/server/100/100', status: 'Offline', lastLogin: new Date().toISOString(), hourlyRate: 120 },
  { id: 'usr_004', name: 'Kitchen Kevin', email: 'kitchen@rms.com', password: 'password123', role: Role.KITCHEN, avatarUrl: 'https://picsum.photos/seed/kitchen/100/100', status: 'Offline', lastLogin: new Date().toISOString(), hourlyRate: 180 },
  { id: 'usr_005', name: 'Delivery Dan', email: 'delivery@rms.com', password: 'password123', role: Role.DELIVERY_PARTNER, avatarUrl: 'https://picsum.photos/seed/driver/100/100', status: 'Offline', lastLogin: new Date().toISOString(), location: { lat: 34.06, lng: -118.25 }, hourlyRate: 100 },
  { id: 'usr_006', name: 'Customer Chris', email: 'customer@rms.com', password: 'password123', role: Role.CUSTOMER, avatarUrl: 'https://picsum.photos/seed/customer/100/100', status: 'Offline', lastLogin: new Date().toISOString(), loyaltyPoints: 75, loyaltyTier: 'Silver', rewards: [] },
];

export const MOCK_INGREDIENTS: Ingredient[] = [
    { id: 'ing_1', name: 'Pizza Dough', unit: 'piece', stock: 100, cost: 40 },
    { id: 'ing_2', name: 'Tomato Sauce', unit: 'kg', stock: 20, cost: 80 },
    { id: 'ing_3', name: 'Mozzarella Cheese', unit: 'kg', stock: 15, cost: 400 },
    { id: 'ing_4', name: 'Pasta', unit: 'kg', stock: 50, cost: 120 },
    { id: 'ing_5', name: 'Lettuce', unit: 'kg', stock: 10, cost: 90 },
    { id: 'ing_6', name: 'Brownie Mix', unit: 'kg', stock: 25, cost: 200 },
    
];


// Reset MOCK_MENU_ITEMS to an empty array for a fresh start.
export const MOCK_MENU_ITEMS: MenuItem[] = [
    { id: 'item_1', name: 'Margherita Pizza', category: 'Pizza', description: 'A classic favorite featuring a crispy crust, tangy tomato sauce, fresh mozzarella cheese, and a sprinkle of basil. Simple, yet irresistibly delicious!', price: 250, stock: 50, imageUrl: 'https://picsum.photos/seed/pizza/400/300', modifierGroupIds: ['mod_grp_1'], recipe: [{ ingredientId: 'ing_1', quantity: 1 }, { ingredientId: 'ing_2', quantity: 0.15 }, { ingredientId: 'ing_3', quantity: 0.1 }], prepTime: 12 },
    { id: 'item_2', name: 'Carbonara Pasta', category: 'Pasta', price: 300, stock: 30, imageUrl: 'https://picsum.photos/seed/pasta/400/300', recipe: [{ ingredientId: 'ing_4', quantity: 0.2 }], prepTime: 8 },
    { id: 'item_3', name: 'Caesar Salad', category: 'Salads', price: 180, stock: 40, imageUrl: 'https://picsum.photos/seed/salad/400/300', modifierGroupIds: ['mod_grp_2'], recipe: [{ ingredientId: 'ing_5', quantity: 0.25 }], prepTime: 5 },
    { id: 'item_4', name: 'Chocolate Brownie', category: 'Desserts', price: 120, stock: 60, imageUrl: 'https://picsum.photos/seed/dessert/400/300', recipe: [{ ingredientId: 'ing_6', quantity: 0.1 }], prepTime: 4 },
    { id: 'item_5', name: 'Iced Tea', category: 'Beverages', price: 80, stock: 100, imageUrl: 'https://picsum.photos/seed/tea/400/300', recipe: [], prepTime: 2 },
    
];

// Reset MOCK_ORDERS to an empty array for a fresh start.
export const MOCK_ORDERS: Order[] = [];

export const MOCK_MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: 'mod_grp_1',
    name: 'Pizza Toppings',
    selectionType: 'multiple',
    options: [
      { id: 'opt_1', name: 'Extra Cheese', price: 50 },
      { id: 'opt_2', name: 'Mushrooms', price: 30 },
      { id: 'opt_3', name: 'Olives', price: 30 },
      { id: 'opt_4', name: 'Pepperoni', price: 60 },
    ]
  },
  {
    id: 'mod_grp_2',
    name: 'Salad Dressing',
    selectionType: 'single',
    options: [
      { id: 'opt_5', name: 'Italian Vinaigrette', price: 0 },
      { id: 'opt_6', name: 'Caesar Dressing', price: 0 },
      { id: 'opt_7', name: 'Ranch', price: 10 },
    ]
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
    {
        id: 'res_1',
        customerId: 'usr_006',
        customerName: 'Customer Chris',
        tableNumber: 3,
        reservationTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        partySize: 4,
        status: ReservationStatus.CONFIRMED,
    }
];


// Reset MOCK_TABLES to all available for a fresh start.
export const MOCK_TABLES: Table[] = [
    { id: 'tbl_1', number: 1, status: TableStatus.AVAILABLE },
    { id: 'tbl_2', number: 2, status: TableStatus.AVAILABLE },
    { id: 'tbl_3', number: 3, status: TableStatus.RESERVED },
    { id: 'tbl_4', number: 4, status: TableStatus.AVAILABLE },
    { id: 'tbl_5', number: 5, status: TableStatus.AVAILABLE },
    { id: 'tbl_6', number: 6, status: TableStatus.AVAILABLE },
    { id: 'tbl_7', number: 7, status: TableStatus.AVAILABLE },
    { id: 'tbl_8', number: 8, status: TableStatus.AVAILABLE },
    { id: 'tbl_9', number: 9, status: TableStatus.AVAILABLE },
    { id: 'tbl_10', number: 10, status: TableStatus.AVAILABLE },
    { id: 'tbl_11', number: 11, status: TableStatus.AVAILABLE },
    { id: 'tbl_12', number: 12, status: TableStatus.AVAILABLE },
];

export const MOCK_SHIFTS: Shift[] = [];

export const MOCK_ACTIVITY_LOG: ActivityLog[] = [];


// Reset SALES_DATA to zero for a fresh start.
export const SALES_DATA = [
    { name: 'Mon', sales: 0 },
    { name: 'Tue', sales: 0 },
    { name: 'Wed', sales: 0 },
    { name: 'Thu', sales: 0 },
    { name: 'Fri', sales: 0 },
    { name: 'Sat', sales: 0 },
    { name: 'Sun', sales: 0 },
];

// Reset ORDER_TYPE_DATA to zero for a fresh start.
export const ORDER_TYPE_DATA = [
    { name: 'Dine-in', value: 0 },
    { name: 'Delivery', value: 0 },
    { name: 'Takeout', value: 0 },
];

// Reset PAYMENTS_DATA to zero for a fresh start.
export const PAYMENTS_DATA = [
  { name: 'Mon', Card: 0, Mobile: 0, Cash: 0, Tips: 0 },
  { name: 'Tue', Card: 0, Mobile: 0, Cash: 0, Tips: 0 },
  { name: 'Wed', Card: 0, Mobile: 0, Cash: 0, Tips: 0 },
  { name: 'Thu', Card: 0, Mobile: 0, Cash: 0, Tips: 0 },
  { name: 'Fri', Card: 0, Mobile: 0, Cash: 0, Tips: 0 },
  { name: 'Sat', Card: 0, Mobile: 0, Cash: 0, Tips: 0 },
  { name: 'Sun', Card: 0, Mobile: 0, Cash: 0, Tips: 0 },
];
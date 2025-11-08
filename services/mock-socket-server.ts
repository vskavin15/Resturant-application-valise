import { Server, Socket } from 'socket.io';
import { User, Role, Order, MenuItem, Shift, ActivityLog, Table, Location, OrderStatus, OrderType, TableStatus, OrderItem, ModifierGroup, Reservation, ReservationStatus, Ingredient, StaffSchedule, RecipeItem } from '../types';
import { MOCK_USERS, MOCK_ORDERS, MOCK_MENU_ITEMS, MOCK_SHIFTS, MOCK_ACTIVITY_LOG, MOCK_TABLES, RESTAURANT_LOCATION, MOCK_MODIFIER_GROUPS, MOCK_RESERVATIONS, MOCK_INGREDIENTS } from '../constants';
import { moveTowards } from '../utils';

// FIX: Added full mock socket server implementation.

// Monkey-patching `io` on the window object to simulate a server in the same context.
(window as any).io = (url: string, opts: any) => {
  // This is a mock client socket that will be connected to our mock server.
  const mockSocket = {
    listeners: new Map<string, ((...args: any[]) => void)[]>(),
    on(event: string, callback: (...args: any[]) => void) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)!.push(callback);
    },
    off(event: string, callback?: (...args: any[]) => void) {
        if (!callback) {
            this.listeners.delete(event);
            return;
        }
        const cbs = this.listeners.get(event);
        if(cbs) {
            const index = cbs.indexOf(callback);
            if (index > -1) {
                cbs.splice(index, 1);
            }
        }
    },
    emit(event: string, ...args: any[]) {
      // The server will handle this emit.
      mockServer.handleClientEmit(this, event, ...args);
    },
    connect() {
        mockServer.connectClient(this);
    },
    disconnect() {
        mockServer.disconnectClient(this);
    },
  };
  return mockSocket;
};

const LOCAL_STORAGE_KEY = 'rms-dynamic-data';

// In-memory database
let users: User[] = MOCK_USERS;
let orders: Order[] = MOCK_ORDERS;
let menuItems: MenuItem[] = MOCK_MENU_ITEMS;
let shifts: Shift[] = MOCK_SHIFTS;
let activityLog: ActivityLog[] = MOCK_ACTIVITY_LOG;
let tables: Table[] = MOCK_TABLES;
let modifierGroups: ModifierGroup[] = MOCK_MODIFIER_GROUPS;
let reservations: Reservation[] = MOCK_RESERVATIONS;
let ingredients: Ingredient[] = MOCK_INGREDIENTS;
let staffSchedules: StaffSchedule[] = [];


class MockSocketServer {
  private clients: Set<any> = new Set();
  // FIX: Replaced `NodeJS.Timeout` with `number` as `setInterval` in browsers returns a number.
  private deliveryPartnerIntervals: Map<string, number> = new Map();

  constructor() {
    const loaded = this.loadStateFromLocalStorage();
    if (!loaded) {
      // Data is already initialized from constants at the top level
      // So we just need to save this initial state for the next session
      this.saveStateToLocalStorage();
    }
  }
  
  saveStateToLocalStorage() {
    const state = {
      users,
      orders,
      menuItems,
      shifts,
      activityLog,
      tables,
      modifierGroups,
      reservations,
      ingredients,
      staffSchedules,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  loadStateFromLocalStorage() {
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        users = savedState.users || MOCK_USERS;
        orders = savedState.orders || MOCK_ORDERS;
        menuItems = savedState.menuItems || MOCK_MENU_ITEMS;
        shifts = savedState.shifts || MOCK_SHIFTS;
        activityLog = savedState.activityLog || MOCK_ACTIVITY_LOG;
        tables = savedState.tables || MOCK_TABLES;
        modifierGroups = savedState.modifierGroups || MOCK_MODIFIER_GROUPS;
        reservations = savedState.reservations || MOCK_RESERVATIONS;
        ingredients = savedState.ingredients || MOCK_INGREDIENTS;
        staffSchedules = savedState.staffSchedules || [];
        return true;
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
    return false;
  }

  initData() {
    // Data is now initialized from constants.
  }


  connectClient(client: any) {
    this.clients.add(client);
    client.connected = true; // Add a connected flag
    this.trigger(client, 'connect');
    this.trigger(client, 'dataUpdate', this.getDataState());
  }

  disconnectClient(client: any) {
    this.clients.delete(client);
    client.connected = false;
    this.trigger(client, 'disconnect');
  }

  trigger(client: any, event: string, ...args: any[]) {
    const listeners = client.listeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(...args));
    }
  }

  broadcast(event: string, ...args: any[]) {
    this.clients.forEach(client => this.trigger(client, event, ...args));
  }

  getDataState() {
    // FIX: Return copies of the arrays to ensure React's change detection works.
    return {
      users: [...users],
      orders: [...orders],
      menuItems: [...menuItems],
      shifts: [...shifts],
      activityLog: [...activityLog],
      tables: [...tables],
      modifierGroups: [...modifierGroups],
      reservations: [...reservations],
      ingredients: [...ingredients],
      staffSchedules: [...staffSchedules],
    };
  }

  logActivity(actor: User, message: string) {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      message,
      timestamp: new Date().toISOString(),
    };
    activityLog.unshift(newLog); // Add to the beginning
    if (activityLog.length > 50) activityLog.pop(); // Keep log size manageable
  }

  deductIngredients(orderItems: OrderItem[]) {
      orderItems.forEach(item => {
          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
          if (menuItem && menuItem.recipe) {
              menuItem.recipe.forEach(recipeItem => {
                  const ingredient = ingredients.find(ing => ing.id === recipeItem.ingredientId);
                  if (ingredient) {
                      const amountToDeduct = recipeItem.quantity * item.quantity;
                      ingredient.stock -= amountToDeduct;
                      if (ingredient.stock < 10) { // low stock threshold
                          this.broadcast('adminNotification', {
                              title: 'Low Ingredient Stock',
                              message: `${ingredient.name} is running low (${ingredient.stock.toFixed(2)} ${ingredient.unit} left).`
                          });
                      }
                  }
              });
          }
      });
  }
  
  startDeliverySimulation(order: Order) {
    if (!order.deliveryPartnerId || !order.customerLocation) return;
    
    const partner = users.find(u => u.id === order.deliveryPartnerId);
    if (!partner || !partner.location) return;

    if (this.deliveryPartnerIntervals.has(partner.id)) {
        clearInterval(this.deliveryPartnerIntervals.get(partner.id)!);
    }

    const interval = setInterval(() => {
        const currentPartner = users.find(u => u.id === partner.id)!;
        const currentOrder = orders.find(o => o.id === order.id)!;

        if (currentOrder.status !== OrderStatus.OUT_FOR_DELIVERY) {
            clearInterval(interval);
            this.deliveryPartnerIntervals.delete(partner.id);
            return;
        }

        const newLocation = moveTowards(currentPartner.location!, currentOrder.customerLocation!, 0.1);
        currentPartner.location = newLocation;
        this.saveStateToLocalStorage();
        this.broadcast('dataUpdate', this.getDataState());

    }, 2000); // Move every 2 seconds
    this.deliveryPartnerIntervals.set(partner.id, interval);
  }

  recalculateOrderTotal(orderData: Partial<Order>): number {
      if (!orderData.items) return 0;
      return orderData.items.reduce((total, item) => {
          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
          const basePrice = menuItem ? menuItem.price : 0;
          const modifiersPrice = item.selectedModifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0;
          return total + (basePrice + modifiersPrice) * item.quantity;
      }, 0);
  }

  handleClientEmit(client: any, event: string, ...args: any[]) {
    console.log(`Socket event received: ${event}`, args);
    const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    const { actor, payload } = args[0] || {};

    try {
      switch (event) {
        case 'login': {
            const { email, password, role } = args[0];
            const user = users.find(u => u.email === email && u.password === password && u.role === role);
            if (user) {
                user.status = 'Online';
                user.lastLogin = new Date().toISOString();
                this.logActivity(user, `logged in.`);
                if (callback) callback({ success: true, user });
                this.saveStateToLocalStorage();
                this.broadcast('dataUpdate', this.getDataState());
            } else {
                if (callback) callback({ success: false, message: 'Invalid credentials or role.' });
            }
            break;
        }
        case 'logout': {
            const userId = args[0];
            const user = users.find(u => u.id === userId);
            if (user) {
                user.status = 'Offline';
                this.logActivity(user, `logged out.`);
                this.saveStateToLocalStorage();
                this.broadcast('dataUpdate', this.getDataState());
            }
            break;
        }
        case 'signup': {
            const { name, email, password } = args[0];
            if (users.some(u => u.email === email)) {
                if (callback) callback({ success: false, message: 'Email already in use.' });
                return;
            }
            const newUser: User = {
                id: `usr_${Date.now()}`,
                name, email, password,
                role: Role.CUSTOMER,
                avatarUrl: `https://picsum.photos/seed/${name}/100/100`,
                status: 'Offline',
                lastLogin: new Date().toISOString(),
                loyaltyPoints: 0,
            };
            users.push(newUser);
            this.broadcast('adminNotification', {
                title: 'New Customer Signup',
                message: `${name} (${email}) has just signed up.`
            });
            if (callback) callback({ success: true });
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
         case 'addStaff': {
            const { name, email, role, hourlyRate } = payload;
            if (users.some(u => u.email === email)) {
                if (callback) callback({ success: false, message: 'Email already in use.' });
                return;
            }
            const password = Math.random().toString(36).slice(-8);
            const newUser: User = {
                id: `usr_${Date.now()}`,
                name, email, password, role, hourlyRate,
                avatarUrl: `https://picsum.photos/seed/${name}/100/100`,
                status: 'Offline',
                lastLogin: new Date().toISOString(),
            };
            users.push(newUser);
            this.logActivity(actor, `added new staff member: ${name} (${role}).`);
            this.broadcast('adminNotification', {
                title: 'New Staff Added',
                message: `${name} (${role}) was added by ${actor.name}.`
            });
            if (callback) callback({ success: true, credentials: { email, password } });
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'deleteUser': {
            users = users.filter(u => u.id !== payload);
            this.logActivity(actor, `deleted user (ID: ${payload.slice(-4)}).`);
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'addOrder': {
            const calculatedTotal = this.recalculateOrderTotal(payload);
            const newOrder: Order = {
                id: `ord_${Date.now()}`,
                createdAt: new Date().toISOString(),
                ...payload,
                total: calculatedTotal,
            };
            if(payload.type === OrderType.DINE_IN && payload.tableNumber) {
                const table = tables.find(t => t.number === payload.tableNumber);
                if (table) {
                    table.status = TableStatus.OCCUPIED;
                    table.orderId = newOrder.id;
                }
            }
            if(payload.type === OrderType.DELIVERY) {
                newOrder.customerLocation = {
                    lat: RESTAURANT_LOCATION.lat + (Math.random() - 0.5) * 0.1,
                    lng: RESTAURANT_LOCATION.lng + (Math.random() - 0.5) * 0.1,
                };
            }
            orders.unshift(newOrder);
            this.logActivity(actor, `created a new ${payload.type} order #${newOrder.id.slice(-4)}.`);
            this.broadcast('adminNotification', {
                title: 'New Order Placed',
                message: `Order #${newOrder.id.slice(-4)} (${newOrder.type}) for ₹${newOrder.total.toFixed(2)} was created by ${actor.name}.`
            });
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'updateOrder': {
            const index = orders.findIndex(o => o.id === payload.id);
            if (index !== -1) {
                const oldOrder = { ...orders[index] };
                const updatedPayload = { ...payload, total: this.recalculateOrderTotal(payload) };
                
                orders[index] = { ...orders[index], ...updatedPayload };
                const newOrder = orders[index];

                if (oldOrder.status !== newOrder.status) {
                  this.logActivity(actor, `updated order #${payload.id.slice(-4)} status to ${newOrder.status}.`);
                  this.broadcast('adminNotification', {
                      title: 'Order Status Updated',
                      message: `Order #${newOrder.id.slice(-4)} is now ${newOrder.status}. Updated by ${actor.name}.`
                  });
                    
                  if (newOrder.status === OrderStatus.PREPARING) {
                      this.deductIngredients(newOrder.items);
                  }

                  if (newOrder.status === OrderStatus.READY && newOrder.type === OrderType.TAKEOUT && newOrder.customerId) {
                      this.broadcast('orderReadyForPickup', { orderId: newOrder.id, customerId: newOrder.customerId });
                  }
                }
                
                if (payload.rating && !oldOrder.rating) {
                    this.logActivity(actor, `rated order #${payload.id.slice(-4)} with ${payload.rating} stars.`);
                     this.broadcast('adminNotification', {
                      title: 'New Customer Review',
                      message: `${actor.name} left a ${payload.rating}-star review for order #${newOrder.id.slice(-4)}.`
                  });
                }

                if (newOrder.status === OrderStatus.DELIVERED && oldOrder.type === OrderType.DINE_IN) {
                    const table = tables.find(t => t.orderId === payload.id);
                    if (table) {
                        table.status = TableStatus.NEEDS_CLEANING;
                        table.orderId = undefined;
                    }
                }
                if(newOrder.status === OrderStatus.OUT_FOR_DELIVERY) {
                    this.startDeliverySimulation(newOrder);
                }
                if(newOrder.status === OrderStatus.DELIVERED && newOrder.customerId) {
                    const customer = users.find(u => u.id === newOrder.customerId);
                    if(customer && customer.loyaltyPoints !== undefined) {
                        customer.loyaltyPoints += Math.floor(newOrder.total / 100);
                        this.trigger(client, 'userUpdated', customer);
                    }
                }
            }
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'recordCashPayment': {
            const order = orders.find(o => o.id === payload);
            if(order) {
                order.paymentStatus = 'Paid';
                order.paymentMethod = 'Cash';
                this.logActivity(actor, `recorded cash payment for order #${payload.slice(-4)}.`);
                this.saveStateToLocalStorage();
                this.broadcast('dataUpdate', this.getDataState());
            }
            break;
        }
        case 'addMenuItem': {
            const newItem: MenuItem = {
                id: `item_${Date.now()}`,
                ...payload
            };
            menuItems.push(newItem);
            this.logActivity(actor, `added menu item: ${payload.name}.`);
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'updateMenuItem': {
            const index = menuItems.findIndex(i => i.id === payload.id);
            if (index !== -1) {
                const oldItem = menuItems[index];
                const LOW_STOCK_THRESHOLD = 15;
                if (oldItem.stock > 0 && payload.stock === 0) {
                     this.broadcast('adminNotification', { 
                        title: 'Item Out of Stock', 
                        message: `${payload.name} is now out of stock.` 
                    });
                } else if (oldItem.stock >= LOW_STOCK_THRESHOLD && payload.stock < LOW_STOCK_THRESHOLD) {
                    this.broadcast('adminNotification', { 
                        title: 'Low Stock Alert', 
                        message: `${payload.name} is running low (${payload.stock} left).` 
                    });
                }
                menuItems[index] = payload;
                this.logActivity(actor, `updated menu item: ${payload.name}.`);
            }
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'deleteMenuItem': {
            const index = menuItems.findIndex(i => i.id === payload);
            if (index > -1) {
                const deletedItemName = menuItems[index].name;
                menuItems.splice(index, 1);
                this.logActivity(actor, `deleted menu item: ${deletedItemName}.`);
            }
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'saveIngredient': {
            const index = ingredients.findIndex(i => i.id === payload.id);
            if (index !== -1) {
                ingredients[index] = payload;
                this.logActivity(actor, `updated ingredient: ${payload.name}.`);
            } else {
                ingredients.push(payload);
                 this.logActivity(actor, `created new ingredient: ${payload.name}.`);
            }
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'deleteIngredient': {
             const ingName = ingredients.find(i => i.id === payload)?.name || 'an ingredient';
             ingredients = ingredients.filter(i => i.id !== payload);
             this.logActivity(actor, `deleted ingredient: ${ingName}.`);
             this.saveStateToLocalStorage();
             this.broadcast('dataUpdate', this.getDataState());
             break;
        }
        case 'saveSchedule': {
            const index = staffSchedules.findIndex(s => s.id === payload.id);
            if (index !== -1) {
                staffSchedules[index] = payload;
            } else {
                staffSchedules.push(payload);
            }
            this.logActivity(actor, `updated the staff schedule.`);
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'deleteSchedule': {
            staffSchedules = staffSchedules.filter(s => s.id !== payload);
            this.logActivity(actor, `removed a shift from the schedule.`);
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'saveModifierGroup': {
            const index = modifierGroups.findIndex(g => g.id === payload.id);
            if (index !== -1) {
                modifierGroups[index] = payload;
                this.logActivity(actor, `updated modifier group: ${payload.name}.`);
            } else {
                modifierGroups.push(payload);
                 this.logActivity(actor, `created new modifier group: ${payload.name}.`);
            }
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'deleteModifierGroup': {
            const groupName = modifierGroups.find(g => g.id === payload)?.name || 'a group';
            modifierGroups = modifierGroups.filter(g => g.id !== payload);
            this.logActivity(actor, `deleted modifier group: ${groupName}.`);
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'createReservation': {
            const newReservation: Reservation = {
                id: `res_${Date.now()}`,
                status: ReservationStatus.PENDING,
                customerName: actor.name,
                ...payload,
            };
            reservations.push(newReservation);
            this.logActivity(actor, `requested a reservation for table ${payload.tableNumber}.`);
            this.broadcast('adminNotification', { title: 'New Reservation', message: `${actor.name} requested a reservation for table ${payload.tableNumber}.`});
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'updateReservationStatus': {
            const { reservationId, status } = payload;
            const resIndex = reservations.findIndex(r => r.id === reservationId);
            if (resIndex !== -1) {
                reservations[resIndex].status = status;
                const res = reservations[resIndex];
                this.logActivity(actor, `${status} reservation for ${res.customerName}.`);
                const table = tables.find(t => t.number === res.tableNumber);
                if (table) {
                    if (status === ReservationStatus.CONFIRMED) {
                        table.status = TableStatus.RESERVED;
                    } else if (status === ReservationStatus.CANCELLED || status === ReservationStatus.COMPLETED) {
                        table.status = TableStatus.AVAILABLE;
                    }
                }
                 this.broadcast('reservationUpdated', { customerId: res.customerId, message: `Your reservation for table ${res.tableNumber} has been ${status.toLowerCase()}.` });
                 this.saveStateToLocalStorage();
                 this.broadcast('dataUpdate', this.getDataState());
            }
            break;
        }
        case 'updateTable': {
            const index = tables.findIndex(t => t.id === args[0].id);
            if (index !== -1) tables[index] = args[0];
            // No actor for this one, so no log.
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'startShift': {
            const { cashierId, startFloat } = payload;
            const newShift: Shift = {
                id: `shift_${Date.now()}`,
                cashierId,
                startTime: new Date().toISOString(),
                startFloat,
            };
            shifts.push(newShift);
            this.logActivity(actor, `started a new shift.`);
            this.broadcast('adminNotification', {
                title: 'Shift Started',
                message: `${actor.name} has clocked in and started a shift.`
            });
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'endShift': {
            const { shift, endFloat } = payload;
            const index = shifts.findIndex(s => s.id === shift.id);
            if (index !== -1) {
                shifts[index] = { ...shifts[index], endTime: new Date().toISOString(), endFloat };
            }
            this.logActivity(actor, `ended their shift.`);
            this.broadcast('adminNotification', {
                title: 'Shift Ended',
                message: `${actor.name} has clocked out and ended their shift.`
            });
            this.saveStateToLocalStorage();
            this.broadcast('dataUpdate', this.getDataState());
            break;
        }
        case 'updateUserLocation': {
            const { userId, location } = args[0];
            const user = users.find(u => u.id === userId);
            if (user) {
                user.location = location;
                // This happens frequently, so we don't log it to avoid clutter.
                this.saveStateToLocalStorage();
                this.broadcast('dataUpdate', this.getDataState());
            }
            break;
        }
      }
    } catch (e) {
      console.error("Error processing event:", event, e);
    }
  }
}

const mockServer = new MockSocketServer();
console.log('Mock socket server initialized.');
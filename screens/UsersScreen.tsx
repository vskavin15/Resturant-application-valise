import React, { useState } from 'react';
// FIX: Added content for UsersScreen component and corrected import paths.
import { useData } from '../context/DataContext';
import { User, Role } from '../types';
import { addStaff, updateUser, deleteUser, useAuth } from '../auth';
import AddStaffModal from '../components/AddStaffModal';
import CredentialsModal from '../components/CredentialsModal';
import { StarIcon } from '../components/Icons';
import CustomerLoyaltyModal from '../components/CustomerLoyaltyModal';

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    const roleColors: Record<Role, string> = {
        [Role.ADMIN]: 'bg-red-500/20 text-red-300',
        [Role.CASHIER]: 'bg-green-500/20 text-green-300',
        [Role.SERVER]: 'bg-blue-500/20 text-blue-300',
        [Role.KITCHEN]: 'bg-yellow-500/20 text-yellow-300',
        [Role.DELIVERY_PARTNER]: 'bg-purple-500/20 text-purple-300',
        [Role.CUSTOMER]: 'bg-indigo-500/20 text-indigo-300',
    };
    return (
        <span className={`px-2.5 py-1 font-medium text-xs rounded-full ${roleColors[role]}`}>
            {role}
        </span>
    );
};

const UsersScreen: React.FC = () => {
    const { users } = useData();
    const { currentUser: adminUser } = useAuth();

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

    // FIX: Add hourlyRate to function signature and pass it to addStaff to resolve argument count mismatch.
    const handleAddStaff = async (name: string, email: string, role: Role, hourlyRate: number) => {
        if (!adminUser) return;
        try {
            const newCredentials = await addStaff(name, email, role, hourlyRate, adminUser);
            if (newCredentials) {
                setCredentials(newCredentials);
            }
            setAddModalOpen(false);
        } catch (error) {
            console.error("Failed to add staff:", error);
            // Handle error notification
        }
    };
    
    const handleDeleteUser = (userId: string) => {
      if(adminUser && window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        deleteUser(userId, adminUser);
      }
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">User & Staff Management</h1>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="px-5 py-2.5 font-semibold tracking-wide text-white capitalize transition-colors duration-200 transform bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50"
                >
                    Add Staff
                </button>
            </div>
            <div className="w-full overflow-hidden rounded-lg shadow-lg">
                <div className="w-full overflow-x-auto">
                    <table className="w-full whitespace-no-wrap">
                        <thead>
                            <tr className="text-sm font-semibold tracking-wide text-left text-gray-400 uppercase border-b border-gray-700 bg-gray-900">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Login</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {users.map(user => (
                                <tr key={user.id} className="text-gray-400">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm">
                                            <div className="relative hidden w-10 h-10 mr-4 rounded-full md:block">
                                                <img className="object-cover w-full h-full rounded-full" src={user.avatarUrl} alt={user.name} loading="lazy" />
                                                <div className={`absolute inset-0 rounded-full shadow-inner ${user.status === 'Online' ? 'ring-2 ring-green-400' : ''}`} aria-hidden="true"></div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-200">{user.name}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm"><RoleBadge role={user.role} /></td>
                                    <td className="px-6 py-4 text-xs">
                                        <span className={`px-2.5 py-1 font-semibold leading-tight rounded-full ${user.status === 'Online' ? 'text-green-200 bg-green-700/50' : 'text-gray-300 bg-gray-600/50'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{new Date(user.lastLogin).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                      <div className="flex items-center space-x-2">
                                        {user.role === Role.CUSTOMER && (
                                           <button onClick={() => setSelectedCustomer(user)} className="px-3 py-1.5 text-xs font-medium text-yellow-300 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/40 flex items-center">
                                              <StarIcon className="w-4 h-4 mr-1"/> Loyalty
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1.5 text-xs font-medium text-red-300 bg-red-500/20 rounded-lg hover:bg-red-500/40">Delete</button>
                                      </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAddModalOpen && (
                <AddStaffModal onClose={() => setAddModalOpen(false)} onAdd={handleAddStaff} />
            )}
            {credentials && (
                <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
            )}
            {selectedCustomer && (
              <CustomerLoyaltyModal user={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
            )}
        </div>
    );
};

export default UsersScreen;
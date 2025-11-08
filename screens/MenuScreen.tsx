import React, { useState } from 'react';
// FIX: Import useAuth to get the current user for action logging. Corrected import paths.
import { deleteMenuItem, useAuth } from '../auth';
import { MenuItem } from '../types';
import MenuItemModal from '../components/MenuItemModal';
import { EditIcon, TrashIcon } from '../components/Icons';
import { useData } from '../context/DataContext';

const MenuScreen: React.FC = () => {
  const { menuItems } = useData();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleOpenModalForNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSave = () => {
    handleModalClose();
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      if (currentUser) {
        deleteMenuItem(itemId, currentUser);
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Inventory & Menu</h1>
        <button
          onClick={handleOpenModalForNew}
          className="px-5 py-2.5 font-semibold tracking-wide text-white capitalize transition-colors duration-200 transform bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50"
        >
          Add New Item
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-lg shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-left text-gray-400 uppercase border-b border-gray-700 bg-gray-900">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {menuItems.map((item: MenuItem) => (
                <tr key={item.id} className="text-gray-400 hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm">
                      <div className="relative hidden w-20 h-14 mr-4 rounded-md md:block">
                        <img className="object-cover w-full h-full rounded-md" src={item.imageUrl} alt={item.name} loading="lazy" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">{item.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-200">₹{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={item.stock < 15 ? 'text-red-400 font-semibold' : 'text-green-400'}>{item.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <button onClick={() => handleOpenModalForEdit(item)} className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg hover:text-amber-400" aria-label="Edit">
                          <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg hover:text-red-400" aria-label="Delete">
                          <TrashIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <MenuItemModal item={editingItem} onClose={handleModalClose} onSave={handleModalSave} />
      )}
    </div>
  );
};

export default MenuScreen;
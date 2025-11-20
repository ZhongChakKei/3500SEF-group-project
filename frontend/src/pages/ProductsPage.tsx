import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { itemsApi, Item } from '../services/api';

const ProductsPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    itemId: '',
    itemName: '',
    itemType: 'DRINK',
    unitPrice: 0,
    imageUrl: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await itemsApi.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await itemsApi.addProduct(newProduct);
      setShowAddModal(false);
      setNewProduct({ itemId: '', itemName: '', itemType: 'DRINK', unitPrice: 0, imageUrl: '' });
      loadItems();
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleModifyProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await itemsApi.modifyProduct(editingItem.itemId, {
        itemName: editingItem.itemName,
        itemType: editingItem.itemType,
        unitPrice: editingItem.unitPrice,
        imageUrl: editingItem.imageUrl
      });
      setEditingItem(null);
      loadItems();
    } catch (error) {
      console.error('Failed to modify product:', error);
      alert('Failed to modify product. Please try again.');
    }
  };

  const handleArchiveProduct = async (itemId: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await itemsApi.archiveProduct(itemId);
      loadItems();
    } catch (error) {
      console.error('Failed to archive product:', error);
      alert('Failed to archive product. Please try again.');
    }
  };

  const handleUnarchiveProduct = async (itemId: string) => {
    try {
      await itemsApi.unarchiveProduct(itemId);
      loadItems();
    } catch (error) {
      console.error('Failed to unarchive product:', error);
      alert('Failed to unarchive product. Please try again.');
    }
  };

  const filtered = items.filter(p => {
    const matchesSearch = !query || p.itemName.toLowerCase().includes(query.toLowerCase()) || p.itemId.includes(query);
    const matchesArchiveFilter = showArchived ? p.status === 'ARCHIVED' : p.status !== 'ARCHIVED';
    return matchesSearch && matchesArchiveFilter;
  });

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold text-white tracking-wide">Products</h2>
        <div className="flex items-center gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="bg-[rgba(30,50,80,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded px-3 py-2 text-sm text-white placeholder:text-gray-400 outline-none" />
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              showArchived 
                ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' 
                : 'bg-[rgba(30,50,80,0.5)] text-white border border-white/30'
            }`}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0066CC] hover:bg-[#0052A3] text-white px-4 py-2 rounded text-sm shadow transition-colors"
          >
            + Add Product
          </button>
        </div>
      </div>
      {loading && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 bg-white/10 animate-pulse rounded" />)}
      </div>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-[rgba(30,50,80,0.4)] rounded-xl border border-white/10">
          <div className="text-gray-400 text-sm">
            {query ? 'No items match your search' : 'No items found. Start by adding products to your inventory.'}
          </div>
        </div>
      )}
      {!loading && filtered.length > 0 && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(p => (
          <div key={p.itemId} className="bg-[rgba(30,50,80,0.6)] backdrop-blur border border-white/20 rounded-lg p-3 shadow shadow-black/40 hover:border-[#0066CC]/60 hover:shadow-[#0066CC]/20 flex flex-col transition-colors relative">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.itemName} className="aspect-square bg-white/10 rounded mb-2 object-cover" />
            ) : (
              <div className="aspect-square bg-white/10 rounded mb-2 flex items-center justify-center text-xs text-gray-400">📦</div>
            )}
            <div className="text-[10px] text-gray-400 mb-1 font-mono tracking-wide">{p.itemId}</div>
            <div className="font-medium text-sm text-white line-clamp-2 leading-snug">{p.itemName}</div>
            <div className="mt-auto text-[10px] text-gray-400 uppercase tracking-wider">{p.itemType}</div>
            <div className="mt-1 text-sm font-semibold text-[#0066CC]">HKD ${p.unitPrice}</div>
            {p.status === 'ARCHIVED' && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-500/80 text-white text-[10px] rounded">ARCHIVED</span>
            )}
            <div className="flex gap-1 mt-3">
              <button
                onClick={() => setEditingItem(p)}
                className="flex-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded text-xs font-medium transition-colors"
              >
                Edit
              </button>
              {p.status === 'ARCHIVED' ? (
                <button
                  onClick={() => handleUnarchiveProduct(p.itemId)}
                  className="flex-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded text-xs font-medium transition-colors"
                >
                  Restore
                </button>
              ) : (
                <button
                  onClick={() => handleArchiveProduct(p.itemId)}
                  className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-xs font-medium transition-colors"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>}
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(30,50,80,0.95)] border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item ID</label>
                <input
                  type="text"
                  required
                  value={newProduct.itemId}
                  onChange={e => setNewProduct({ ...newProduct, itemId: e.target.value })}
                  placeholder="e.g., 0004"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.itemName}
                  onChange={e => setNewProduct({ ...newProduct, itemName: e.target.value })}
                  placeholder="e.g., Orange Juice 350ml"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={newProduct.itemType}
                  onChange={e => setNewProduct({ ...newProduct, itemType: e.target.value })}
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] rounded-lg px-3 py-2 text-white outline-none"
                >
                  <option value="DRINK">DRINK</option>
                  <option value="SNACK">SNACK</option>
                  <option value="FOOD">FOOD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Unit Price (HKD)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newProduct.unitPrice}
                  onChange={e => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                  placeholder="e.g., 10.5"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image URL (optional)</label>
                <input
                  type="text"
                  value={newProduct.imageUrl}
                  onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  placeholder="e.g., /image/0004.png"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewProduct({ itemId: '', itemName: '', itemType: 'DRINK', unitPrice: 0, imageUrl: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg font-medium transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(30,50,80,0.95)] border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Product</h3>
            <form onSubmit={handleModifyProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item ID</label>
                <input
                  type="text"
                  disabled
                  value={editingItem.itemId}
                  className="w-full bg-[rgba(20,40,70,0.3)] border border-white/20 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.itemName}
                  onChange={e => setEditingItem({ ...editingItem, itemName: e.target.value })}
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={editingItem.itemType}
                  onChange={e => setEditingItem({ ...editingItem, itemType: e.target.value })}
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] rounded-lg px-3 py-2 text-white outline-none"
                >
                  <option value="DRINK">DRINK</option>
                  <option value="SNACK">SNACK</option>
                  <option value="FOOD">FOOD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Unit Price (HKD)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingItem.unitPrice}
                  onChange={e => setEditingItem({ ...editingItem, unitPrice: parseFloat(e.target.value) })}
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingItem.imageUrl || ''}
                  onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductsPage;

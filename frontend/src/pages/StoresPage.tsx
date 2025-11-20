import React, { useEffect, useState } from 'react';
import { storesApi, Store } from '../services/api';

const StoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form state for creating new store
  const [newStore, setNewStore] = useState({
    storeCode: '',
    addressLine1: '',
    district: '',
    city: 'Hong Kong'
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await storesApi.getAll();
      setStores(data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storesApi.createNewStore({
        storeCode: newStore.storeCode,
        location: {
          addressLine1: newStore.addressLine1,
          district: newStore.district,
          city: newStore.city
        },
        status: 'OPEN'
      });
      setShowCreateModal(false);
      setNewStore({ storeCode: '', addressLine1: '', district: '', city: 'Hong Kong' });
      loadStores();
    } catch (error) {
      console.error('Failed to create store:', error);
      alert('Failed to create store. Please try again.');
    }
  };

  const handleCloseStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to close this store?')) return;
    try {
      await storesApi.closeStore(storeId);
      loadStores();
    } catch (error) {
      console.error('Failed to close store:', error);
      alert('Failed to close store. Please try again.');
    }
  };

  const handleReopenStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to reopen this store?')) return;
    try {
      await storesApi.reopenStore(storeId);
      loadStores();
    } catch (error) {
      console.error('Failed to reopen store:', error);
      alert('Failed to reopen store. Please try again.');
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = !searchQuery || 
      store.storeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || store.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: stores.length,
    open: stores.filter(s => s.status === 'OPEN').length,
    closed: stores.filter(s => s.status === 'CLOSED').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-white tracking-wide">Store Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg font-medium transition-colors"
        >
          + Create New Store
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
          <div className="text-sm text-gray-300 mb-1">Total Stores</div>
          <div className="text-2xl font-semibold text-white">{stats.total}</div>
        </div>
        <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
          <div className="text-sm text-gray-300 mb-1">Open Stores</div>
          <div className="text-2xl font-semibold text-green-400">{stats.open}</div>
        </div>
        <div className="p-4 rounded-lg bg-[rgba(30,50,80,0.6)] border border-white/10 shadow-sm">
          <div className="text-sm text-gray-300 mb-1">Closed Stores</div>
          <div className="text-2xl font-semibold text-gray-400">{stats.closed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          placeholder="Search by code, district, or city..." 
          className="flex-1 min-w-[250px] bg-[rgba(30,50,80,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-400 outline-none"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[rgba(30,50,80,0.5)] border border-white/30 focus:border-[#0066CC] rounded-lg px-4 py-2 text-sm text-white outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Stores Grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filteredStores.length === 0 && (
        <div className="text-center py-12 bg-[rgba(30,50,80,0.4)] rounded-xl border border-white/10">
          <div className="text-gray-400 text-sm">
            {searchQuery ? 'No stores match your search' : 'No stores found'}
          </div>
        </div>
      )}

      {!loading && filteredStores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map(store => (
            <div
              key={store.storeId}
              className="bg-[rgba(30,50,80,0.55)] backdrop-blur border border-white/10 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{store.storeCode}</h3>
                  <p className="text-xs text-gray-400 font-mono">{store.storeId}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  store.status === 'OPEN' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {store.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">Address:</span> {store.location.addressLine1}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">District:</span> {store.location.district}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">City:</span> {store.location.city}
                </div>
              </div>

              <div className="flex gap-2">
                {store.status === 'OPEN' ? (
                  <button
                    onClick={() => handleCloseStore(store.storeId)}
                    className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Close Store
                  </button>
                ) : (
                  <button
                    onClick={() => handleReopenStore(store.storeId)}
                    className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reopen Store
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(30,50,80,0.95)] border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Store</h3>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Store Code</label>
                <input
                  type="text"
                  required
                  value={newStore.storeCode}
                  onChange={e => setNewStore({ ...newStore, storeCode: e.target.value })}
                  placeholder="e.g., HKS2"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={newStore.addressLine1}
                  onChange={e => setNewStore({ ...newStore, addressLine1: e.target.value })}
                  placeholder="e.g., Shop 201, Causeway Bay Plaza"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={newStore.district}
                  onChange={e => setNewStore({ ...newStore, district: e.target.value })}
                  placeholder="e.g., Causeway Bay"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={newStore.city}
                  onChange={e => setNewStore({ ...newStore, city: e.target.value })}
                  placeholder="e.g., Hong Kong"
                  className="w-full bg-[rgba(20,40,70,0.5)] border border-white/30 focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/40 rounded-lg px-3 py-2 text-white placeholder:text-gray-400 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewStore({ storeCode: '', addressLine1: '', district: '', city: 'Hong Kong' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg font-medium transition-colors"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresPage;

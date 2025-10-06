import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

interface VariantFormData {
  variant_id: string;
  sku: string;
  color?: string;
  storage_gb?: string;
  ram_gb?: string;
  case_mm?: string;
  connectivity?: string;
  price_HKD: string;
  cost_HKD?: string;
  barcode?: string;
}

const AddVariantPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<VariantFormData>({
    variant_id: '',
    sku: '',
    color: '',
    storage_gb: '',
    ram_gb: '',
    case_mm: '',
    connectivity: '',
    price_HKD: '',
    cost_HKD: '',
    barcode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const payload: any = {
        variant_id: formData.variant_id.trim(),
        product_id: productId,
        sku: formData.sku.trim(),
        price_HKD: parseFloat(formData.price_HKD)
      };

      // Add optional fields
      if (formData.color?.trim()) payload.color = formData.color.trim();
      if (formData.storage_gb) payload.storage_gb = parseInt(formData.storage_gb);
      if (formData.ram_gb) payload.ram_gb = parseInt(formData.ram_gb);
      if (formData.case_mm) payload.case_mm = parseInt(formData.case_mm);
      if (formData.connectivity?.trim()) payload.connectivity = formData.connectivity.trim();
      if (formData.cost_HKD) payload.cost_HKD = parseFloat(formData.cost_HKD);
      if (formData.barcode?.trim()) payload.barcode = formData.barcode.trim();

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/variants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create variant');
      }

      setSuccess(true);
      setTimeout(() => navigate(`/products/${productId}`), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Add Variant to {productId}</h2>
        <button
          onClick={() => navigate(`/products/${productId}`)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Product
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="variant_id"
              value={formData.variant_id}
              onChange={handleChange}
              required
              placeholder="e.g., VAR-001"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              placeholder="e.g., SKU-12345"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g., Black"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Storage (GB)</label>
            <input
              type="number"
              name="storage_gb"
              value={formData.storage_gb}
              onChange={handleChange}
              placeholder="e.g., 128"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RAM (GB)</label>
            <input
              type="number"
              name="ram_gb"
              value={formData.ram_gb}
              onChange={handleChange}
              placeholder="e.g., 8"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case (mm)</label>
            <input
              type="number"
              name="case_mm"
              value={formData.case_mm}
              onChange={handleChange}
              placeholder="e.g., 42"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Connectivity</label>
            <input
              type="text"
              name="connectivity"
              value={formData.connectivity}
              onChange={handleChange}
              placeholder="e.g., WiFi"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (HKD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="price_HKD"
              value={formData.price_HKD}
              onChange={handleChange}
              required
              placeholder="e.g., 8999.00"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost (HKD)</label>
            <input
              type="number"
              step="0.01"
              name="cost_HKD"
              value={formData.cost_HKD}
              onChange={handleChange}
              placeholder="e.g., 7000.00"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="e.g., 1234567890123"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Variant created successfully! Redirecting...
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 bg-brand-500 text-white px-4 py-2 rounded hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Variant'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/${productId}`)}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVariantPage;

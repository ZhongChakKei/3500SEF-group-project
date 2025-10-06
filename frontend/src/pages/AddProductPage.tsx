import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductFormData {
  product_id: string;
  title: string;
  brand: string;
  category: string;
  default_image?: string;
  attributes?: string; // JSON string
}

const AddProductPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    product_id: '',
    title: '',
    brand: '',
    category: '',
    default_image: '',
    attributes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      // Validate attributes JSON if provided
      let parsedAttributes = null;
      if (formData.attributes?.trim()) {
        try {
          parsedAttributes = JSON.parse(formData.attributes);
        } catch {
          setError('Invalid JSON in attributes field');
          setLoading(false);
          return;
        }
      }

      const payload = {
        product_id: formData.product_id.trim(),
        title: formData.title.trim(),
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        default_image: formData.default_image?.trim() || undefined,
        attributes: parsedAttributes
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create product');
      }

      setSuccess(true);
      setTimeout(() => navigate('/products'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Add New Product</h2>
        <button
          onClick={() => navigate('/products')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
            placeholder="e.g., PROD-001"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <p className="text-xs text-gray-500 mt-1">Unique identifier for the product</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., iPhone 15 Pro"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="e.g., Apple"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g., Smartphones"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Image URL
          </label>
          <input
            type="text"
            name="default_image"
            value={formData.default_image}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attributes (JSON)
          </label>
          <textarea
            name="attributes"
            value={formData.attributes}
            onChange={handleChange}
            rows={4}
            placeholder='{"color_options": ["Black", "White"], "features": ["5G", "Face ID"]}'
            className="w-full border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <p className="text-xs text-gray-500 mt-1">Optional: Additional product metadata as JSON</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Product created successfully! Redirecting...
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 bg-brand-500 text-white px-4 py-2 rounded hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
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

export default AddProductPage;

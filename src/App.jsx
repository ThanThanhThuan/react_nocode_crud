import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api'; // Import the service
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    a_product_name: '',
    a_price: ''
  });

  // --- READ ---
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // --- CREATE & UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      a_product_name: formData.a_product_name,
      a_price: parseFloat(formData.a_price)
    };

    try {
      if (editingId) {
        await api.update(editingId, productData);
      } else {
        await api.create(productData);
      }

      // Reset Form and Refresh List
      setFormData({ a_product_name: '', a_price: '' });
      setEditingId(null);
      loadProducts();

    } catch (err) {
      setError(err.message);
      setLoading(false); // Stop loading if error occurs
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    setLoading(true);
    try {
      await api.remove(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // --- UI HELPERS ---
  const startEdit = (product) => {
    setEditingId(product.id || product._id);
    setFormData({
      a_product_name: product.a_product_name,
      a_price: product.a_price
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ a_product_name: '', a_price: '' });
  };

  return (
    <div className="container">
      <h1>Than's Product Manager</h1>

      {error && <div className="error">Error: {error}</div>}

      {/* Form Section */}
      <div className="card">
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name:</label>
            <input
              type="text"
              required
              value={formData.a_product_name}
              onChange={(e) => setFormData({ ...formData, a_product_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.a_price}
              onChange={(e) => setFormData({ ...formData, a_price: e.target.value })}
            />
          </div>
          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : (editingId ? 'Update' : 'Create')}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="card">
        <h2>Product List</h2>
        {products.length === 0 && !loading ? (
          <p>No products found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id || p._id}>
                  <td>{p.a_product_name}</td>
                  <td>{p.a_price}</td>
                  <td>
                    <button onClick={() => startEdit(p)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(p.id || p._id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
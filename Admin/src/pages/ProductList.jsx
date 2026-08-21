import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";
import {
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../api";
import "../styles/pages/product-list.scss";

// Modal component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ProductList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ type: null, product: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error loading data:", err);
        const errorMsg = `Failed to load products: ${err.message}`;
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal handlers
  const openModal = async (type, product) => {
    if (type === "view" || type === "edit") {
      try {
        const fullProduct = await getProduct(product.id);
        setModal({ type, product: fullProduct });
      } catch (err) {
        console.error("Error loading product details:", err);
        const errorMsg = `Failed to load product details: ${err.message}`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } else {
      setModal({ type, product });
    }
  };
  const closeModal = () => setModal({ type: null, product: null });

  // Edit handler
  const handleEdit = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
      setProducts(
        products.map((p) =>
          p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
        )
      );
      toast.success("Product updated successfully!");
      closeModal();
    } catch (err) {
      console.error("Error updating product:", err);
      const errorMsg = `Failed to update product: ${err.message}`;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted successfully!");
      closeModal();
    } catch (err) {
      console.error("Error deleting product:", err);
      const errorMsg = `Failed to delete product: ${err.message}`;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Product ID",
      render: (value) => (
        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b7280' }}>
          #{value}
        </span>
      ),
    },
    {
      key: "gallery",
      label: "Image",
      render: (value, row) => (
        <img
          src={row.gallery?.[0]?.url || "/placeholder.svg"}
          alt="Product"
          className="product-thumbnail"
        />
      ),
    },
    { key: "name", label: "Product Name" },
    {
      key: "category",
      label: "Category",
      render: (value, row) => row.category?.name || "N/A",
    },
    {
      key: "basePrice",
      label: "Price (incl. GST)",
      render: (value, row) => {
        const gst = parseFloat(row.gstPercentage) || 0;
        const total = (parseFloat(value) || 0) * (1 + gst / 100);
        return `₹${total.toFixed(2)}`;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`status-badge ${value.toLowerCase().replace(" ", "-")}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="action-buttons" style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
          <button
            className="action-btn view"
            onClick={() => openModal("view", row)}
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit"
            onClick={() => navigate(`/edit-product/${row.id}`)}
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => openModal("delete", row)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Modal content for view
  const ViewModal = ({ product }) => (
    <div className="modal-content view-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h2>Product Details</h2>
      {product.gallery && product.gallery.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {product.gallery.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={`${product.name} ${i + 1}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ))}
        </div>
      )}
      <div className="modal-product-info">
        <p>
          <strong>Name:</strong> {product.name}
        </p>
        <p>
          <strong>Description:</strong> {product.description || "N/A"}
        </p>
        <p>
          <strong>Category:</strong> {product.category?.name || "N/A"}
        </p>
        <p>
          <strong>Base Price:</strong> ₹{product.basePrice}
        </p>
        <p>
          <strong>Price (incl. GST):</strong> ₹
          {(parseFloat(product.basePrice) * (1 + (parseFloat(product.gstPercentage) || 0) / 100)).toFixed(2)}
        </p>
        {product.hsnCode && (
          <p>
            <strong>HSN Code:</strong> {product.hsnCode}
          </p>
        )}
        <p>
          <strong>Weight:</strong> {product.weight ? `${product.weight} kg` : "N/A"}
        </p>
        <p>
          <strong>Status:</strong> {product.status}
        </p>
        {Array.isArray(product.quantityPrices) && product.quantityPrices.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <strong>Quantity Pricing (total for qty, excl. GST):</strong>
            <table style={{ marginTop: '6px', borderCollapse: 'collapse', fontSize: '13px', minWidth: '280px' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ border: '1px solid #e5e7eb', padding: '5px 10px', textAlign: 'left' }}>Quantity</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '5px 10px', textAlign: 'left' }}>Total Price</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '5px 10px', textAlign: 'left' }}>Incl. GST</th>
                </tr>
              </thead>
              <tbody>
                {[...product.quantityPrices]
                  .sort((a, b) => a.quantity - b.quantity)
                  .map((t, i) => {
                    const rate = parseFloat(t.price) || 0
                    const gst = rate * ((parseFloat(product.gstPercentage) || 0) / 100)
                    return (
                      <tr key={i}>
                        <td style={{ border: '1px solid #e5e7eb', padding: '5px 10px' }}>{t.quantity}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: '5px 10px' }}>₹{rate.toFixed(2)}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: '5px 10px' }}>₹{(rate + gst).toFixed(2)}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Modal content for edit
  const EditModal = ({ product, onSave }) => {
    const [form, setForm] = useState({
      name: product.name,
      description: product.description || "",
      basePrice: product.basePrice,
      hsnCode: product.hsnCode || "",
      status: product.status,
      categoryId: product.categoryId,
      gallery: product.gallery || [],
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        await onSave({ ...product, ...form });
      } finally {
        setSaving(false);
      }
    };

    return (
      <form className="modal-content edit-modal" onSubmit={handleSubmit}>
        <h2>Edit Product</h2>
        <div style={{ marginBottom: '16px' }}>
          <strong>Gallery Images:</strong>
          {form.gallery && form.gallery.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {form.gallery.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`Gallery ${i + 1}`}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                />
              ))}
            </div>
          )}
        </div>
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </label>
        <label>
          Category
          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: parseInt(e.target.value) }))
            }
            required
          >
            <option value="">Select Category</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </label>
        <label>
          Base Price
          <input
            type="text"
            value={form.basePrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, basePrice: e.target.value }))
            }
            required
          />
        </label>
        <label>
          HSN Code
          <input
            type="text"
            value={form.hsnCode}
            onChange={(e) =>
              setForm((f) => ({ ...f, hsnCode: e.target.value }))
            }
            placeholder="Optional"
          />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <div className="modal-actions">
          <button
            type="button"
            onClick={closeModal}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  };

  // Modal content for delete
  const DeleteModal = ({ product, onDelete }) => (
    <div className="modal-content delete-modal">
      <h2>Delete Product</h2>
      <p>
        Are you sure you want to delete <strong>{product.name}</strong>?
      </p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={closeModal}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(product.id)}>
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="product-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Product List</h1>
          <p>Manage your product inventory</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-product")}
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-message">Loading products...</div>
      ) : (
        <>
          <div className="filters-section">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by product ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories found</option>
                )}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <DataTable
            data={products.filter(p => {
              const categoryMatch = filterCategory === 'all' || p.categoryId === parseInt(filterCategory);
              const statusMatch = filterStatus === 'all' || p.status?.toLowerCase() === filterStatus;

              const searchMatch = searchTerm === '' ||
                p.id?.toString().includes(searchTerm) ||
                p.name?.toLowerCase().includes(searchTerm.toLowerCase());

              return categoryMatch && statusMatch && searchMatch;
            })}
            columns={columns}
            searchTerm=""
            searchKey="name"
          />

          {/* Modals */}
          <Modal open={modal.type === "view"} onClose={closeModal}>
            {modal.product && <ViewModal product={modal.product} />}
          </Modal>
          <Modal open={modal.type === "edit"} onClose={closeModal}>
            {modal.product && (
              <EditModal product={modal.product} onSave={handleEdit} />
            )}
          </Modal>
          <Modal open={modal.type === "delete"} onClose={closeModal}>
            {modal.product && (
              <DeleteModal product={modal.product} onDelete={handleDelete} />
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default ProductList;
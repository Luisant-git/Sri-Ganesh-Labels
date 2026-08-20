import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";
import {
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  uploadImage,
  getCategories,
} from "../api";

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

const SubCategoryList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ type: null, subCategory: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subCategoriesData, categoriesData] = await Promise.all([
          getSubCategories(),
          getCategories(),
        ]);
        setSubCategories(subCategoriesData);
        setCategories(categoriesData);
      } catch (err) {
        const errorMsg = `Failed to load data: ${err.message}`;
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openModal = async (type, subCategory) => {
    if (type === "view" || type === "edit") {
      try {
        const fullSubCategory = await getSubCategory(subCategory.id);
        setModal({ type, subCategory: fullSubCategory });
      } catch (err) {
        toast.error(`Failed to load subcategory details: ${err.message}`);
      }
    } else {
      setModal({ type, subCategory });
    }
  };
  const closeModal = () => setModal({ type: null, subCategory: null });

  const handleEdit = async (updatedSubCategory) => {
    try {
      await updateSubCategory(updatedSubCategory.id, updatedSubCategory);
      setSubCategories(
        subCategories.map((sc) =>
          sc.id === updatedSubCategory.id
            ? {
                ...sc,
                ...updatedSubCategory,
                category: categories.find(
                  (c) => c.id === updatedSubCategory.categoryId
                ),
              }
            : sc
        )
      );
      toast.success("Subcategory updated successfully!");
      closeModal();
    } catch (err) {
      toast.error(`Failed to update subcategory: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubCategory(id);
      setSubCategories(subCategories.filter((sc) => sc.id !== id));
      toast.success("Subcategory deleted successfully!");
      closeModal();
    } catch (err) {
      toast.error(`Failed to delete subcategory: ${err.message}`);
    }
  };

  const ViewModal = ({ subCategory }) => (
    <div className="modal-content view-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h2>Subcategory Details</h2>
      <img
        src={subCategory.image || "/placeholder.svg"}
        alt={subCategory.name}
        className="modal-product-image"
      />
      <div className="modal-product-info">
        <p>
          <strong>Name:</strong> {subCategory.name}
        </p>
        <p>
          <strong>Parent Category:</strong>{" "}
          {subCategory.category?.name || "N/A"}
        </p>
        <p>
          <strong>Description:</strong> {subCategory.description || "N/A"}
        </p>
        {subCategory.sizeChart && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Size Chart:</strong></p>
            <img
              src={subCategory.sizeChart}
              alt="Size Chart"
              style={{ maxWidth: '100%', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const EditModal = ({ subCategory, onSave }) => {
    const [form, setForm] = useState({
      name: subCategory.name,
      description: subCategory.description || "",
      image: subCategory.image || "",
      sizeChart: subCategory.sizeChart || "",
      categoryId: subCategory.categoryId,
      orderNumber: subCategory.orderNumber || 0,
    });
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [sizeChartUploading, setSizeChartUploading] = useState(false);

    const handleSizeChartUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setSizeChartUploading(true);
        try {
          const uploadResult = await uploadImage(file);
          setForm((f) => ({ ...f, sizeChart: uploadResult.url }));
          toast.success("Size chart uploaded successfully!");
        } catch (err) {
          toast.error("Failed to upload size chart");
        } finally {
          setSizeChartUploading(false);
        }
      }
    };

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageUploading(true);
        try {
          const uploadResult = await uploadImage(file);
          setForm((f) => ({ ...f, image: uploadResult.url }));
          toast.success("Image uploaded successfully!");
        } catch (err) {
          toast.error("Failed to upload image");
        } finally {
          setImageUploading(false);
        }
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        await onSave({ ...subCategory, ...form });
      } finally {
        setSaving(false);
      }
    };

    return (
      <form className="modal-content edit-modal" onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h2>Edit Subcategory</h2>
        <div className="form-group">
          <label className="form-label">Image</label>
          <div className="image-edit-section">
            {form.image ? (
              <div className="image-preview-wrapper">
                <img src={form.image} alt="Subcategory" className="current-image" />
                <button
                  type="button"
                  className="change-image-btn"
                  onClick={() => document.getElementById("edit-image-upload").click()}
                  disabled={imageUploading}
                >
                  <Upload size={14} />
                  {imageUploading ? "Uploading..." : "Change"}
                </button>
              </div>
            ) : (
              <div className="image-upload-area" onClick={() => document.getElementById("edit-image-upload").click()}>
                <Upload size={28} />
                <p>{imageUploading ? "Uploading..." : "Upload image"}</p>
                <span>PNG, JPG</span>
              </div>
            )}
            <input
              type="file"
              id="edit-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              disabled={imageUploading}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Parent Category *</label>
          <select
            className="form-select"
            value={form.categoryId}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: parseInt(e.target.value) }))
            }
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Order Number</label>
          <input
            type="number"
            className="form-input"
            value={form.orderNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, orderNumber: parseInt(e.target.value) || 0 }))
            }
            min="0"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Size Chart (Optional)</label>
          <div className="image-edit-section">
            {form.sizeChart ? (
              <div className="image-preview-wrapper">
                <img src={form.sizeChart} alt="Size Chart" className="current-image" />
                <button
                  type="button"
                  className="change-image-btn"
                  onClick={() => document.getElementById("edit-sizechart-upload").click()}
                  disabled={sizeChartUploading}
                >
                  <Upload size={14} />
                  {sizeChartUploading ? "Uploading..." : "Change"}
                </button>
              </div>
            ) : (
              <div className="image-upload-area" onClick={() => document.getElementById("edit-sizechart-upload").click()}>
                <Upload size={28} />
                <p>{sizeChartUploading ? "Uploading..." : "Upload size chart"}</p>
                <span>PNG, JPG</span>
              </div>
            )}
            <input
              type="file"
              id="edit-sizechart-upload"
              accept="image/*"
              onChange={handleSizeChartUpload}
              style={{ display: "none" }}
              disabled={sizeChartUploading}
            />
          </div>
        </div>
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
            disabled={saving || imageUploading || sizeChartUploading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  };

  const DeleteModal = ({ subCategory, onDelete }) => (
    <div className="modal-content delete-modal">
      <h2>Delete Subcategory</h2>
      <p>
        Are you sure you want to delete <strong>{subCategory.name}</strong>?
      </p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={closeModal}>
          Cancel
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(subCategory.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (value, row) => (
        <img
          src={value || "/placeholder.svg"}
          alt={row.name}
          className="product-thumbnail"
        />
      ),
    },
    { key: "name", label: "Subcategory Name" },
    {
      key: "category",
      label: "Parent Category",
      render: (value) => value?.name || "N/A",
    },
    {
      key: "orderNumber",
      label: "Order",
      render: (value) => value || 0,
    },
    { key: "description", label: "Description" },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => new Date(value).toLocaleDateString("en-GB"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="action-buttons">
          <button
            className="action-btn view"
            title="View"
            onClick={() => openModal("view", row)}
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit"
            onClick={() => openModal("edit", row)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => openModal("delete", row)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="subcategory-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Sub Categories</h1>
          <p>Manage your product subcategories</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-sub-category")}
        >
          <Plus size={20} />
          Add Sub Category
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading subcategories...</div>
      ) : (
        <>
          <DataTable
            data={subCategories}
            columns={columns}
            searchTerm={searchTerm}
            searchKey="name"
          />

          <Modal open={modal.type === "view"} onClose={closeModal}>
            {modal.subCategory && <ViewModal subCategory={modal.subCategory} />}
          </Modal>
          <Modal open={modal.type === "edit"} onClose={closeModal}>
            {modal.subCategory && (
              <EditModal subCategory={modal.subCategory} onSave={handleEdit} />
            )}
          </Modal>
          <Modal open={modal.type === "delete"} onClose={closeModal}>
            {modal.subCategory && (
              <DeleteModal
                subCategory={modal.subCategory}
                onDelete={handleDelete}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default SubCategoryList;

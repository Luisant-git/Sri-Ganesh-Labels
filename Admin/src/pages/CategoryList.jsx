import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, X, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";
import {
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
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

const CategoryList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ type: null, category: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        const errorMsg = `Failed to load categories: ${err.message}`;
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const openModal = async (type, category) => {
    if (type === "view" || type === "edit") {
      try {
        const fullCategory = await getCategory(category.id);
        setModal({ type, category: fullCategory });
      } catch (err) {
        toast.error(`Failed to load category details: ${err.message}`);
      }
    } else {
      setModal({ type, category });
    }
  };
  const closeModal = () => setModal({ type: null, category: null });

  const handleEdit = async (updatedCategory) => {
    try {
      await updateCategory(updatedCategory.id, updatedCategory);
      setCategories(
        categories.map((c) =>
          c.id === updatedCategory.id ? { ...c, ...updatedCategory } : c
        )
      );
      toast.success("Category updated successfully!");
      closeModal();
    } catch (err) {
      toast.error(`Failed to update category: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted successfully!");
      closeModal();
    } catch (err) {
      toast.error(`Failed to delete category: ${err.message}`);
    }
  };

  const ViewModal = ({ category }) => (
    <div className="modal-content view-modal">
      <h2>Category Details</h2>
      <img
        src={category.image || "/placeholder.svg"}
        alt={category.name}
        className="modal-product-image"
      />
      <div className="modal-product-info">
        <p>
          <strong>Name:</strong> {category.name}
        </p>
        <p>
          <strong>Description:</strong> {category.description || "N/A"}
        </p>
      </div>
    </div>
  );

  const EditModal = ({ category, onSave }) => {
    const [form, setForm] = useState({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

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
        await onSave({ ...category, ...form });
      } finally {
        setSaving(false);
      }
    };

    return (
      <form className="modal-content edit-modal" onSubmit={handleSubmit}>
        <h2>Edit Category</h2>
        <div className="form-group">
          <label className="form-label">Image</label>
          <div className="image-edit-section">
            {form.image ? (
              <div className="image-preview-wrapper">
                <img src={form.image} alt="Category" className="current-image" />
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
            disabled={saving || imageUploading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  };

  const DeleteModal = ({ category, onDelete }) => (
    <div className="modal-content delete-modal">
      <h2>Delete Category</h2>
      <p>
        Are you sure you want to delete <strong>{category.name}</strong>?
      </p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={closeModal}>
          Cancel
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(category.id)}
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
    { key: "name", label: "Category Name" },
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
    <div className="category-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Categories</h1>
          <p>Manage your product categories</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-category")}
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading categories...</div>
      ) : (
        <>
          <DataTable
            data={categories}
            columns={columns}
            searchTerm={searchTerm}
            searchKey="name"
          />

          <Modal open={modal.type === "view"} onClose={closeModal}>
            {modal.category && <ViewModal category={modal.category} />}
          </Modal>
          <Modal open={modal.type === "edit"} onClose={closeModal}>
            {modal.category && (
              <EditModal category={modal.category} onSave={handleEdit} />
            )}
          </Modal>
          <Modal open={modal.type === "delete"} onClose={closeModal}>
            {modal.category && (
              <DeleteModal category={modal.category} onDelete={handleDelete} />
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default CategoryList;

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
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
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

const BrandList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState([]);
  const [modal, setModal] = useState({ type: null, brand: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const brandsData = await getBrands();
        setBrands(brandsData);
      } catch (err) {
        const errorMsg = `Failed to load brands: ${err.message}`;
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const openModal = async (type, brand) => {
    if (type === "view" || type === "edit") {
      try {
        const fullBrand = await getBrand(brand.id);
        setModal({ type, brand: fullBrand });
      } catch (err) {
        toast.error(`Failed to load brand details: ${err.message}`);
      }
    } else {
      setModal({ type, brand });
    }
  };
  const closeModal = () => setModal({ type: null, brand: null });

  const handleEdit = async (updatedBrand) => {
    try {
      await updateBrand(updatedBrand.id, updatedBrand);
      setBrands(
        brands.map((b) =>
          b.id === updatedBrand.id ? { ...b, ...updatedBrand } : b
        )
      );
      toast.success("Brand updated successfully!");
      closeModal();
    } catch (err) {
      toast.error(`Failed to update brand: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBrand(id);
      setBrands(brands.filter((b) => b.id !== id));
      toast.success("Brand deleted successfully!");
      closeModal();
    } catch (err) {
      toast.error(`Failed to delete brand: ${err.message}`);
    }
  };

  const ViewModal = ({ brand }) => (
    <div className="modal-content view-modal">
      <h2>Brand Details</h2>
      <img
        src={brand.image || "/placeholder.svg"}
        alt={brand.name}
        className="modal-product-image"
      />
      <div className="modal-product-info">
        <p>
          <strong>Name:</strong> {brand.name}
        </p>
        <p>
          <strong>Description:</strong> {brand.description || "N/A"}
        </p>
        <p>
          <strong>Status:</strong> {brand.status || "active"}
        </p>
      </div>
    </div>
  );

  const EditModal = ({ brand, onSave }) => {
    const [form, setForm] = useState({
      name: brand.name,
      description: brand.description || "",
      image: brand.image || "",
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
        await onSave({ ...brand, ...form });
      } finally {
        setSaving(false);
      }
    };

    return (
      <form className="modal-content edit-modal" onSubmit={handleSubmit}>
        <h2>Edit Brand</h2>
        <label>
          Brand Logo
          <div className="image-edit-section">
            {form.image && (
              <img
                src={form.image}
                alt="Brand"
                className="current-image"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
            )}
            <div
              className="image-upload-area"
              onClick={() =>
                document.getElementById("edit-image-upload").click()
              }
            >
              <input
                type="file"
                id="edit-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <div className="upload-label">
                <Upload size={24} />
                <span>{imageUploading ? "Uploading..." : "Change Image"}</span>
              </div>
            </div>
          </div>
        </label>
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
            rows={6}
            placeholder="Enter brand description..."
            style={{
              minHeight: '150px',
              padding: '12px',
              fontSize: '14px',
              lineHeight: '1.5',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              resize: 'vertical'
            }}
          />
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
            disabled={saving || imageUploading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  };

  const DeleteModal = ({ brand, onDelete }) => (
    <div className="modal-content delete-modal">
      <h2>Delete Brand</h2>
      <p>
        Are you sure you want to delete <strong>{brand.name}</strong>?
      </p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={closeModal}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(brand.id)}>
          Delete
        </button>
      </div>
    </div>
  );

  const columns = [
    {
      key: "image",
      label: "Logo",
      render: (value, row) => (
        <img
          src={value || "/placeholder.svg"}
          alt={row.name}
          className="product-thumbnail"
        />
      ),
    },
    { key: "name", label: "Brand Name" },
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
    <div className="brand-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Brands</h1>
          <p>Manage your product brands</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-brand")}
        >
          <Plus size={20} />
          Add Brand
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading brands...</div>
      ) : (
        <>
          <DataTable
            data={brands}
            columns={columns}
            searchTerm={searchTerm}
            searchKey="name"
          />

          <Modal open={modal.type === "view"} onClose={closeModal}>
            {modal.brand && <ViewModal brand={modal.brand} />}
          </Modal>
          <Modal open={modal.type === "edit"} onClose={closeModal}>
            {modal.brand && (
              <EditModal brand={modal.brand} onSave={handleEdit} />
            )}
          </Modal>
          <Modal open={modal.type === "delete"} onClose={closeModal}>
            {modal.brand && (
              <DeleteModal brand={modal.brand} onDelete={handleDelete} />
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default BrandList;

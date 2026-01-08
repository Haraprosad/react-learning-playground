import { type FormEvent, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  updateProduct,
  clearEditingProduct,
} from "./productsSlice";
import { type AppDispatch, type RootState } from "../../../app/store";

const ProductForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, editingProductId } = useSelector(
    (state: RootState) => state.productsR
  );

  const productToEdit = products.find((p) => p.id === editingProductId) || null;

  const initialFormData = useMemo(() => {
    if (productToEdit) {
      return {
        id: productToEdit.id.toString(),
        name: productToEdit.name,
        price: productToEdit.price.toString(),
      };
    }
    return {
      id: "",
      name: "",
      price: "",
    };
  }, [productToEdit]);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert("Please fill in all fields");
      return;
    }

    if (productToEdit) {
      // Update existing product
      const updatedProduct = {
        id: productToEdit.id,
        name: formData.name,
        price: parseFloat(formData.price),
      };
      dispatch(
        updateProduct({ id: productToEdit.id, product: updatedProduct })
      );
      // Reset form
      setFormData({
        id: "",
        name: "",
        price: "",
      });
    } else {
      // Create new product
      const newProduct = {
        id: Date.now().toString(), // Temporary ID generation
        name: formData.name,
        price: parseFloat(formData.price),
      };
      dispatch(createProduct(newProduct));
      // Reset form
      setFormData({
        id: "",
        name: "",
        price: "",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      name: "",
      price: "",
    });
    dispatch(clearEditingProduct());
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>{productToEdit ? "Edit Product" : "Add New Product"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Product Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            placeholder="Enter product name"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="price"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Price:
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            style={{ width: "100%", padding: "8px" }}
            placeholder="Enter price"
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {productToEdit ? "Update Product" : "Add Product"}
        </button>
        {productToEdit && (
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default ProductForm;

import { useState, type FormEvent, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createProduct, updateProduct, type Product } from "./productsSlice";
import { type AppDispatch } from "../../../app/store";

interface ProductFormProps {
  productToEdit: Product | null;
  onCancel: () => void;
}

const ProductForm = ({ productToEdit, onCancel }: ProductFormProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [products, setProducts] = useState({
    id: "",
    name: "",
    price: "",
  });

  useEffect(() => {
    if (productToEdit) {
      setProducts({
        id: productToEdit.id.toString() ?? "",
        name: productToEdit.name ?? "",
        price: productToEdit.price.toString() ?? "",
      });
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProducts((prevProducts) => ({
      ...prevProducts,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!products.name || !products.price) {
      alert("Please fill in all fields");
      return;
    }

    if (productToEdit) {
      // Update existing product
      const updatedProduct = {
        id: productToEdit.id,
        name: products.name,
        price: parseFloat(products.price),
      };
      dispatch(
        updateProduct({ id: productToEdit.id, product: updatedProduct })
      );
      // Reset form
      setProducts({
        id: "",
        name: "",
        price: "",
      });
      onCancel();
    } else {
      // Create new product
      const newProduct = {
        id: Date.now().toString(), // Temporary ID generation
        name: products.name,
        price: parseFloat(products.price),
      };
      dispatch(createProduct(newProduct));
      // Reset form
      setProducts({
        id: "",
        name: "",
        price: "",
      });
    }
  };

  const handleCancel = () => {
    setProducts({
      id: "",
      name: "",
      price: "",
    });
    onCancel();
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
            value={products.name}
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
            value={products.price}
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

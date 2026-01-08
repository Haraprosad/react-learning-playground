import { useState } from "react";
import "./App.css";
import ProductListView from "./features/products/ProductListView";
import ProductForm from "./features/products/ProductForm";
import type { Product } from "./features/products/productsSlice";

function App() {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
  };

  const handleCancelEdit = () => {
    setProductToEdit(null);
  };

  return (
    <>
      <ProductForm productToEdit={productToEdit} onCancel={handleCancelEdit} />
      <ProductListView onHandleEdit={handleEdit} />
    </>
  );
}

export default App;

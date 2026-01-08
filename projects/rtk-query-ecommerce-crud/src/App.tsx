import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductsView from "../features/products/ProductsView";
import ProductsForm from "../features/products/ProductsForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductsView />} />
        <Route path="/products/add" element={<ProductsForm />} />
        <Route path="/products/edit/:id" element={<ProductsForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import "./App.css";
import ProductListView from "./features/products/ProductListView";
import ProductForm from "./features/products/ProductForm";

function App() {
  return (
    <>
      <ProductForm />
      <ProductListView />
    </>
  );
}

export default App;

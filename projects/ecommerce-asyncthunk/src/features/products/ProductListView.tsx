import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteProduct, fetchProducts, type Product } from "./productsSlice";
import { type AppDispatch, type RootState } from "../../../app/store";

interface ProductListViewProps {
  onHandleEdit: (product: Product) => void;
}

const ProductListView = ({ onHandleEdit }: ProductListViewProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading, error } = useSelector(
    (state: RootState) => state.productsR
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Products</h1>
      <div>
        {products.length === 0 ? (
          <p>No products available</p>
        ) : (
          <ul>
            {products.map((product: Product) => (
              <li key={product.id}>
                {product.name} - ${product.price}
                <button
                  onClick={() => dispatch(deleteProduct(product.id))}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
                <button
                  onClick={() => onHandleEdit(product)}
                  style={{ marginLeft: "10px" }}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductListView;

import {
  useDeleteProductMutation,
  useGetProductsQuery,
  type Product,
} from "../../src/services/productsApi";
import { useNavigate } from "react-router-dom";

const ProductsView = () => {
  const { data, isLoading, isError, error } = useGetProductsQuery(undefined);
  const navigate = useNavigate();

  const [deleteProduct] = useDeleteProductMutation();
  const handleDelete = async (id: number) => {
    await deleteProduct(id);
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error: {error.toString()}</p>}
      {!isLoading && !isError && data && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
            }}
          >
            <h1 style={{ margin: 0 }}>Products</h1>
            <button
              onClick={() => navigate("/products/add")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Add Product
            </button>
          </div>
          {data.length === 0 ? (
            <p>No products available</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px",
                padding: "20px",
              }}
            >
              {data.map((product: Product) => (
                <div
                  key={product.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ fontSize: "16px", margin: "10px 0" }}>
                    {product.title}
                  </h3>
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    {product.category}
                  </p>
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      color: "#333",
                    }}
                  >
                    ${product.price}
                  </p>
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/products/edit/${product.id}`, {
                          state: { product },
                        })
                      }
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsView;

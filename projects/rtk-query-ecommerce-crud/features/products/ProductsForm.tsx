import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useAddProductMutation,
  useUpdateProductMutation,
  useGetProductQuery,
} from "../../src/services/productsApi";
import { type Product } from "../../src/services/productsApi";
import { useEffect } from "react";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  rating: z.object({
    rate: z.number().min(0).max(5, "Rating must be between 0 and 5"),
    count: z.number().min(0, "Count must be positive"),
  }),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductsForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  // Try to get product from router state first (instant)
  const productFromState = location.state?.product as Product | undefined;

  // Only fetch from API if:
  // 1. We're in edit mode AND
  // 2. We don't have product from state (direct URL access/refresh)
  const { data: productFromAPI, isLoading: isLoadingProduct } =
    useGetProductQuery(Number(id), {
      skip: !isEditMode || !!productFromState,
    });

  // Use state data if available (instant), otherwise API data
  const product = productFromState || productFromAPI;

  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      price: 0,
      description: "",
      category: "",
      rating: { rate: 0, count: 0 },
    },
  });

  useEffect(() => {
    if (product && isEditMode) {
      reset({
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        rating: product.rating,
      });
    }
  }, [product, isEditMode, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditMode && product) {
        await updateProduct({
          ...data,
          id: product.id,
          rating: data.rating,
        }).unwrap();
      } else {
        await addProduct({ ...data, rating: data.rating } as Omit<
          Product,
          "id"
        >).unwrap();
      }
      reset();
      navigate("/");
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  if (isLoadingProduct && !productFromState) {
    return <div style={{ padding: "20px" }}>Loading product...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? "Update Product" : "Add New Product"}
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          {...register("title")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Price</label>
        <input
          {...register("price", { valueAsNumber: true })}
          type="number"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.price && (
          <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Category</label>
        <input
          {...register("category")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <input
            {...register("rating.rate", { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            max="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.rating?.rate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.rating.rate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Review Count</label>
          <input
            {...register("rating.count", { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.rating?.count && (
            <p className="text-red-500 text-sm mt-1">
              {errors.rating.count.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isAdding || isUpdating}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isAdding || isUpdating
          ? "Submitting..."
          : isEditMode
          ? "Update Product"
          : "Add Product"}
      </button>
    </form>
  );
};

export default ProductsForm;

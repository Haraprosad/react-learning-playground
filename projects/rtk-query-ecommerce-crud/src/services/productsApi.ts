import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
}

export const productsApi = createApi({
    reducerPath: "productsApi",
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3003/' }),
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        getProducts: builder.query<Product[], void>({
            query: () => 'products',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Products' as const, id })),
                        { type: 'Products', id: 'LIST' }
                      ]
                    : [{ type: 'Products', id: 'LIST' }],
        }),
        getProduct: builder.query<Product, number>({
            query: (id) => `products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Products', id }],
        }),
        deleteProduct: builder.mutation<{ success: boolean; id: number }, number>({
            query: (id) => ({
                url: `products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Products', id },
                { type: 'Products', id: 'LIST' }
            ],
        }),
        addProduct: builder.mutation<Product, Omit<Product, 'id'>>({
            query: (body) => ({
                url: `products/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Products', id: 'LIST' }],
        }),
        updateProduct: builder.mutation<Product, Product>({
            query: ({ id, ...body }) => ({
                url: `products/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Products', id },
                { type: 'Products', id: 'LIST' }
            ],
        }),
    }),
})

export const { useGetProductsQuery, useGetProductQuery, useDeleteProductMutation, useAddProductMutation, useUpdateProductMutation } = productsApi;
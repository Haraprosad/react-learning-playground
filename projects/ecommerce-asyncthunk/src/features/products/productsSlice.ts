import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios';

export interface Product{
    id: string;
    name: string;
    price: number;
}


interface ProductsState {
    isLoading: boolean;
    products: Product[],
    error: string | null;
    editingProductId: string | null;
}

const initialState: ProductsState = {
    isLoading: false,
    products: [],
    error: null,
    editingProductId: null,
}

const BASE_URL = 'http://localhost:3003/products';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async () => {
       
            const response = await axios.get(BASE_URL);
            const data = response.data;
            return data;
        
    }
)

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id:string) => {
       
            await axios.delete(`${BASE_URL}/${id}`);
            return id;
        
    }
)

export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (product:Product) => {
       
            const response = await axios.post(`${BASE_URL}`, product);
            return response.data;
        
    }
)

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({id, product}: {id: string, product: Product}) => {
       
            const response = await axios.put(`${BASE_URL}/${id}`, product);
            return response.data;
        
    }
)

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setEditingProduct: (state, action: PayloadAction<string>) => {
      state.editingProductId = action.payload;
    },
    clearEditingProduct: (state) => {
      state.editingProductId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.products = action.payload;
        state.error = null;
    });
      builder.addCase(fetchProducts.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || 'Failed to fetch products';
      });
      builder.addCase(deleteProduct.fulfilled, (state, action) => {
          state.products = state.products.filter(product => product.id !== action.payload)
      });
      builder.addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
          state.products.push(action.payload);
      });
        builder.addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {           
            const index = state.products.findIndex(product => product.id === action.payload.id);
            if (index !== -1) {
                state.products[index] = action.payload;
            }
            state.editingProductId = null;
        });
  },
})

export const { setEditingProduct, clearEditingProduct } = productsSlice.actions;


export default productsSlice.reducer
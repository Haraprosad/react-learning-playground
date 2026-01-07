import { configureStore } from '@reduxjs/toolkit';
import booksReducer from '../features/books/bookSlice';

const store = configureStore({
    reducer: {
        booksR : booksReducer
    },
})

export default store;

export type RootState = ReturnType<typeof store.getState>;
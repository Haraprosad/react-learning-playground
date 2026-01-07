import { createSlice } from '@reduxjs/toolkit';

export interface Book {
    id: number;
    title: string;
    author: string;
    price: number;
}
interface BooksState {
    books: Book[];
}

const initialState: BooksState = {
    books: [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 10.99 },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 8.99 },
        { id: 3, title: '1984', author: 'George Orwell', price: 9.99 }
    ]
}

const bookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        deleteBook: (state, action) => {
            const  id  = action.payload;
            state.books = state.books.filter(book => book.id !== id);
        },
        
        updateBook: (state, action) => {
            const updatedBook = action.payload;
            const index = state.books.findIndex(book => book.id === updatedBook.id);
            if (index !== -1) {
                state.books[index] = updatedBook;
            }
        },
        addBook: (state, action) => {
            state.books.push(action.payload);
        }
    }
})

export const { deleteBook, addBook, updateBook } = bookSlice.actions;
export default bookSlice.reducer;
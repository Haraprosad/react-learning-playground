import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { deleteBook, type Book } from "../features/books/bookSlice";
    
const BookList = ({ onHandleEdit }: { onHandleEdit: (book: Book) => void }) => {
  const books = useSelector((state: RootState) => state.booksR.books);
    const dispatch = useDispatch();
    const handleDelete = (id: number) => {
        dispatch(deleteBook(id));
    }
    const handleEdit = (book:Book)=>{
        // Implement edit functionality here
        onHandleEdit(book);
    }
    return (
    <div>
      <h2>Book List</h2>
      {books && books.length > 0 ? (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
                  {book.title} by {book.author} - ${book.price}
                  <button onClick={() => handleDelete(book.id)}>Delete</button>
                  <button onClick={()=> handleEdit(book)}>Edit</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No books available.</p>
      )}
    </div>
  );
};

export default BookList;

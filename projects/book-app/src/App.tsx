import { useState } from "react";
import "./App.css";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import type { Book } from "./features/books/bookSlice";

function App() {
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const handleEdit = (book:Book) => {
    setBookToEdit(book);
  }
  const handleCancelEdit = () => {
    setBookToEdit(null);
  }
  return (
    <>
      <BookForm bookToEdit={bookToEdit} onCancel={handleCancelEdit} />
      <BookList onHandleEdit={handleEdit}/>
    </>
  );
}

export default App;

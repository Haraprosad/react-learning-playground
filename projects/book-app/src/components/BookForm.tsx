import React, { useEffect, useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { addBook, updateBook, type Book } from "../features/books/bookSlice";
import { useDispatch } from "react-redux";

interface BookFormProps {
  bookToEdit: Book | null;
  onCancel: () => void;
}

const BookForm = ({ bookToEdit, onCancel }: BookFormProps) => {
  const [book, setBook] = useState({
    title: "",
    author: "",
    price: 0,
  });

  useEffect(() => {
    if (bookToEdit) {
      setBook(bookToEdit);
    } else {
        setBook({ title: "", author: "", price: 0 });
    }
  }, [bookToEdit]);

  const dispatch = useDispatch();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBook({
      ...book,
      [name]: value,
    });
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would typically dispatch an action to add the book to the store
    console.log({ ...book, id: nanoid() });

    if (bookToEdit) {
      dispatch(updateBook(book));
    } else {
      dispatch(addBook({ ...book, id: nanoid() }));
    }

    setBook({ title: "", author: "", price: 0 });
    // Reset form
  };

  const onCancelClick = () => {
    onCancel();
  };
  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a New Book</h2>
      <div>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={book.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Author:</label>
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={book.author}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={book.price}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">{bookToEdit ? "Update" : "Add Book"}</button>
      {bookToEdit && (
        <button type="button" onClick={onCancelClick}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default BookForm;

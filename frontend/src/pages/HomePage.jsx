import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Replace with your FastAPI backend URL
    axios.get('http://localhost:8000/api/books')
      .then(res => setBooks(res.data))
      .catch(err => console.error("Error fetching books:", err));
  }, []);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-900">បណ្ណាល័យឌីជីថល BELTEI</h1>

      {/* Search Input */}
      <div className="max-w-xl mx-auto mb-12">
        <input
          type="text"
          placeholder="ស្វែងរកចំណងជើង ឬ អ្នកនិពន្ធ..."
          className="w-full p-4 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500 text-lg">មិនឃើញមានសៀវភៅដែលអ្នកស្វែងរកទេ។</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;

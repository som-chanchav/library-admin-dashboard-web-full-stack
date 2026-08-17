import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      {/* Book Cover Image */}
      <img
        src={book.cover_image || "https://via.placeholder.com/300x400?text=No+Cover"}
        alt={book.title}
        className="w-full h-64 object-cover"
      />

      <div className="p-4 flex flex-col justify-between h-40">
        <div>
          <h3 className="text-xl font-bold text-gray-800 truncate" title={book.title}>{book.title}</h3>
          <p className="text-sm text-gray-600 truncate" title={book.author}>ដោយ៖ {book.author || 'មិនស្គាល់អ្នកនិពន្ធ'}</p>
        </div>

        {/* Read Button */}
        <button
          onClick={() => navigate(`/read/${book.id}`)}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          អានសៀវភៅនេះ
        </button>
      </div>
    </div>
  );
};

export default BookCard;

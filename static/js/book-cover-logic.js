function normalizeIsbn(isbn) {
  return (isbn || '').replace(/-/g, '');
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function categoryKeyword(book) {
  const category = (book.category || '').toLowerCase();
  if (category.includes('literature')) return 'literature';
  if (category.includes('language')) return 'language';
  if (category.includes('cook')) return 'cooking';
  if (category.includes('travel')) return 'travel';
  if (category.includes('novel')) return 'novel';
  if (category.includes('medical')) return 'medical';
  if (category.includes('education')) return 'education';
  return 'library';
}

function getBookCoverUrl(book) {
  if (book.cover_image) return book.cover_image;
  if (KHMER_COVERS[book.isbn]) return KHMER_COVERS[book.isbn];
  const isbn = normalizeIsbn(book.isbn);
  if (COVER_MAP[isbn]) return COVER_MAP[isbn];
  if (isbn.length >= 10) return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

  const seed = encodeURIComponent(
    `${book.id || 'book'}-${slugify(book.title) || 'library'}-${categoryKeyword(book)}`
  );
  return `https://picsum.photos/seed/${seed}/400/600`;
}

function bookCardHTML(book) {
  const status = (book.copies_available ?? 0) > 0 ? 'available' : 'borrowed';
  const statusLabel = status === 'available' ? 'Available' : 'Borrowed';
  const statusClass = status === 'available' ? 'badge-success' : 'badge-danger';
  const coverUrl = getBookCoverUrl(book) || '/static/images/book-placeholder.svg';
  const displayCategory = book.category || 'General';

  return `<article class="book-card" onclick="navigate('books')">
    <div class="book-card-cover">
      <img src="${coverUrl}" alt="${book.title}" loading="lazy" onerror="this.onerror=null;this.src='/static/images/book-placeholder.svg';">
      <span class="book-card-badge ${statusClass}">${statusLabel}</span>
    </div>
    <div class="book-card-body">
      <div class="title">${book.title}</div>
      <div class="meta">${displayCategory}</div>
    </div>
  </article>`;
}

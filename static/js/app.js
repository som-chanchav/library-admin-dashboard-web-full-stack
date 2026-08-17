/* BELTEI Library Admin Dashboard — Premium UI & i18n */
const API = '/api';
let charts = {};
let cache = { categories: [], authors: [], publishers: [], members: [], books: [] };

async function handleImportExcel(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/import-books`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const detail = payload?.detail || payload || res.statusText;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return res.json();
}

async function handleExportExcel() {
  const res = await fetch(`${API}/export-books`);
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const detail = payload?.detail || payload || res.statusText;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `books-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const ADMIN_TRANSLATIONS = {
  en: {
    nav_sec_overview: 'Overview',
    nav_sec_management: 'Management',
    nav_sec_catalog: 'Catalog',
    nav_sec_analytics: 'Analytics',
    nav_sec_system: 'System',
    nav_dashboard: 'Dashboard',
    nav_books: 'Books',
    nav_members: 'Members',
    nav_borrowings: 'Borrow & Return',
    nav_receipts: 'Receipts',
    nav_reservations: 'Reservations',
    nav_requests: 'Borrow Requests',
    nav_early_returns: 'Early Returns',
    nav_categories: 'Categories',
    nav_authors: 'Authors & Publishers',
    nav_reports: 'Reports',
    nav_fines: 'Fines',
    nav_settings: 'Settings & RBAC',
    role_admin: 'Administrator',
    welcome_greeting: 'Welcome back, Admin',
    welcome_sub: 'Your digital library at a glance — track books, members, borrowings, and fines in real time.',
    btn_add_book: 'Add Book',
    btn_new_borrow: 'New Borrow',
    title_featured_books: 'Featured Books',
    sub_featured_books: 'Recently added & popular titles',
    btn_view_all: 'View All',
    title_chart_trends: 'Monthly Borrowing Trends',
    sub_chart_trends: 'Book borrow activity over the last 6 months',
    title_chart_status: 'Book Status Distribution',
    sub_chart_status: 'Copy inventory by status',
    title_recent_borrowing: 'Recent Borrowing',
    title_recent_returns: 'Recent Returns',
    title_popular_books: 'Popular Books',
    sub_popular_books: 'Most borrowed titles in the library',
    title_recent_activity: 'Recent Activity',
    title_member_dist: 'Member Distribution',
    sub_member_dist: 'Students, teachers & staff breakdown',
    title_receipt_history: 'Receipt History',
    sub_receipt_history: 'All generated borrow and return receipts',
    btn_search: 'Search',
    btn_add_member: 'Add Member',
    btn_process_overdue: 'Process Overdue Fines',
    btn_new_reservation: 'New Reservation',
    btn_add_category: 'Add Category',
    btn_add_author: 'Add Author',
    btn_add_publisher: 'Add Publisher',
    title_authors: 'Authors',
    title_publishers: 'Publishers',
    rpt_popular: 'Most Borrowed Books',
    rpt_damaged: 'Damaged / Lost / Repair',
    rpt_borrowing: 'Members Currently Borrowing',
    rpt_fines: 'Members with Unpaid Fines',
    title_unpaid_fines: 'Unpaid Fines — ពិន័យមិនទាន់បង់',
    sub_requests: 'Member requests waiting for staff review.',
    search_placeholder: 'Search books, members, ISBN...',
    search_books: 'Search title, author, ISBN...',
    search_members: 'Search members...',
    th_member: 'Member',
    th_book: 'Book',
    th_date: 'Date',
    th_status: 'Status',
  },
  km: {
    nav_sec_overview: 'ទិដ្ឋភាពទូទៅ',
    nav_sec_management: 'ការគ្រប់គ្រង',
    nav_sec_catalog: 'កាតាឡុកសៀវភៅ',
    nav_sec_analytics: 'ការវិភាគ & របាយការណ៍',
    nav_sec_system: 'ប្រព័ន្ធ & ការកំណត់',
    nav_dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    nav_books: 'សៀវភៅ',
    nav_members: 'សមាជិក',
    nav_borrowings: 'ខ្ចី និងសង',
    nav_receipts: 'បង្កាន់ដៃ',
    nav_reservations: 'ការកក់ទុក',
    nav_requests: 'ការស្នើសុំខ្ចីសៀវភៅ',
    nav_early_returns: 'សងមុនថ្ងៃ',
    nav_categories: 'ប្រភេទសៀវភៅ',
    nav_authors: 'អ្នកនិពន្ធ & អ្នកបោះពុម្ព',
    nav_reports: 'របាយការណ៍',
    nav_fines: 'ការផាកពិន័យ',
    nav_settings: 'ការកំណត់ & សិទ្ធិ',
    role_admin: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
    welcome_greeting: 'សូមស្វាគមន៍មកកាន់ Admin',
    welcome_sub: 'បណ្ណាល័យឌីជីថលរបស់អ្នក — តាមដានសៀវភៅ សមាជិក ការខ្ចី និងការពិន័យជាក់ស្តែង។',
    btn_add_book: 'បន្ថែមសៀវភៅ',
    btn_new_borrow: 'ខ្ចីសៀវភៅថ្មី',
    title_featured_books: 'សៀវភៅពេញនិយម',
    sub_featured_books: 'ទើបបញ្ចូលថ្មី & មានអ្នកអានច្រើន',
    btn_view_all: 'មើលទាំងអស់',
    title_chart_trends: 'និន្នាការខ្ចីសៀវភៅប្រចាំខែ',
    sub_chart_trends: 'សកម្មភាពខ្ចីសៀវភៅក្នុងរយៈពេល ៦ ខែកន្លងមក',
    title_chart_status: 'ស្ថានភាពសៀវភៅក្នុងស្តុក',
    sub_chart_status: 'ចំនួនច្បាប់តាមស្ថានភាព',
    title_recent_borrowing: 'ការខ្ចីថ្មីៗ',
    title_recent_returns: 'ការសងថ្មីៗ',
    title_popular_books: 'សៀវភៅដែលខ្ចីច្រើនបំផុត',
    sub_popular_books: 'ចំណងជើងសៀវភៅដែលមានអ្នកខ្ចីច្រើនជាងគេ',
    title_recent_activity: 'សកម្មភាពថ្មីៗ',
    title_member_dist: 'ការបែងចែកសមាជិក',
    sub_member_dist: 'ចំនួនសិស្ស គ្រូ និងបុគ្គលិក',
    title_receipt_history: 'ប្រវត្តិបង្កាន់ដៃ',
    sub_receipt_history: 'បង្កាន់ដៃខ្ចី និងសងទាំងអស់ដែលបានបង្កើត',
    btn_search: 'ស្វែងរក',
    btn_add_member: 'បន្ថែមសមាជិក',
    btn_process_overdue: 'ដំណើរការពិន័យហួសកាលកំណត់',
    btn_new_reservation: 'ការកក់ទុកថ្មី',
    btn_add_category: 'បន្ថែមប្រភេទ',
    btn_add_author: 'បន្ថែមអ្នកនិពន្ធ',
    btn_add_publisher: 'បន្ថែមអ្នកបោះពុម្ព',
    title_authors: 'អ្នកនិពន្ធ',
    title_publishers: 'អ្នកបោះពុម្ពផ្សាយ',
    rpt_popular: 'សៀវភៅដែលខ្ចីច្រើនបំផុត',
    rpt_damaged: 'សៀវភៅខូច / បាត់ / កំពុងជួសជុល',
    rpt_borrowing: 'សមាជិកកំពុងខ្ចីសៀវភៅ',
    rpt_fines: 'សមាជិកមិនទាន់បង់ប្រាក់ពិន័យ',
    title_unpaid_fines: 'ប្រាក់ពិន័យមិនទាន់បង់',
    sub_requests: 'សំណើខ្ចីសៀវភៅពីសមាជិកកំពុងរង់ចាំការអនុម័ត។',
    search_placeholder: 'ស្វែងរកសៀវភៅ សមាជិក លេខ ISBN...',
    search_books: 'ស្វែងរកចំណងជើង អ្នកនិពន្ធ ISBN...',
    search_members: 'ស្វែងរកសមាជិក...',
    th_member: 'សមាជិក',
    th_book: 'សៀវភៅ',
    th_date: 'កាលបរិច្ឆេទ',
    th_status: 'ស្ថានភាព',
  }
};

let adminLang = localStorage.getItem('admin_lang') || 'en';

const pageMeta = {
  en: {
    requests: { title: 'Borrow Requests', subtitle: 'Review member borrowing requests' },
    dashboard: { title: 'Dashboard', subtitle: 'Library statistics & overview' },
    books: { title: 'Books', subtitle: 'Manage book catalog & copies' },
    members: { title: 'Members', subtitle: 'Students, teachers & staff' },
    borrowings: { title: 'Borrow & Return', subtitle: 'Track lending activity' },
    reservations: { title: 'Reservations', subtitle: 'Book reservation queue' },
    'early-returns': { title: 'Early Returns', subtitle: 'Process early book returns before due date' },
    categories: { title: 'Categories', subtitle: 'Book classification' },
    authors: { title: 'Authors & Publishers', subtitle: 'Catalog metadata' },
    reports: { title: 'Reports', subtitle: 'Analytics & insights' },
    fines: { title: 'Fines', subtitle: 'Late return penalties' },
    receipts: { title: 'Receipts', subtitle: 'Receipt history & printing' },
    settings: { title: 'Settings', subtitle: 'RBAC & system configuration' },
  },
  km: {
    requests: { title: 'ការស្នើសុំខ្ចីសៀវភៅ', subtitle: 'ពិនិត្យ ផ្ទៀងផ្ទាត់ និងអនុម័តសំណើខ្ចីសៀវភៅរបស់សិស្ស គ្រូ និងបុគ្គលិក' },
    'early-returns': { title: 'សងមុនថ្ងៃកំណត់', subtitle: 'ការគ្រប់គ្រងសមាជិកដែលចង់សងសៀវភៅមុនកាលកំណត់' },
    dashboard: { title: 'ផ្ទាំងគ្រប់គ្រង', subtitle: 'ស្ថិតិបណ្ណាល័យ និងទិដ្ឋភាពរួម' },
    books: { title: 'បញ្ជីសៀវភៅ', subtitle: 'គ្រប់គ្រងកាតាឡុកសៀវភៅ និងចំនួនច្បាប់' },
    members: { title: 'សមាជិកបណ្ណាល័យ', subtitle: 'សិស្ស និស្សិត គ្រូបង្រៀន និងបុគ្គលិក' },
    borrowings: { title: 'ខ្ចី និងសងសៀវភៅ', subtitle: 'តាមដានសកម្មភាពខ្ចី-សង' },
    reservations: { title: 'ការកក់សៀវភៅទុក', subtitle: 'បញ្ជីរង់ចាំការកក់សៀវភៅទុក' },
    categories: { title: 'ប្រភេទសៀវភៅ', subtitle: 'ការចាត់ថ្នាក់ប្រភេទសៀវភៅ' },
    authors: { title: 'អ្នកនិពន្ធ & អ្នកបោះពុម្ព', subtitle: 'ព័ត៌មានលម្អិតអ្នកនិពន្ធ និងរោងពុម្ព' },
    reports: { title: 'របាយការណ៍វិភាគ', subtitle: 'ទិន្នន័យស្ថិតិ និងការវិភាគបណ្ណាល័យ' },
    fines: { title: 'ការផាកពិន័យ', subtitle: 'ការគ្រប់គ្រងប្រាក់ពិន័យហួសកាលកំណត់' },
    receipts: { title: 'ប្រវត្តិបង្កាន់ដៃ', subtitle: 'បង្កាន់ដៃខ្ចី-សង និងការបោះពុម្ព' },
    settings: { title: 'ការកំណត់ប្រព័ន្ធ', subtitle: 'សិទ្ធិអ្នកប្រើប្រាស់ RBAC និងម៉ាស៊ីនបោះពុម្ព' },
  }
};

function getPageMeta(page) {
  const langObj = pageMeta[adminLang] || pageMeta.en;
  return langObj[page] || { title: page, subtitle: '' };
}

function setAdminLang(lang) {
  adminLang = (lang === 'km') ? 'km' : 'en';
  localStorage.setItem('admin_lang', adminLang);
  applyAdminLanguage();
  
  const menu = document.getElementById('adminLangMenu');
  if (menu) menu.classList.remove('show');

  toast(adminLang === 'km' ? '🌐 បានប្តូរទៅជា ភាសាខ្មែរ ជោគជ័យ' : '🌐 Switched to English successfully', 'success');
}

function applyAdminLanguage() {
  const flagEl = document.getElementById('adminCurrentLangFlag');
  const textEl = document.getElementById('adminCurrentLangText');
  const optEn = document.getElementById('langOptEn');
  const optKm = document.getElementById('langOptKm');

  if (flagEl) flagEl.textContent = adminLang === 'km' ? '🇰🇭' : '🇬🇧';
  if (textEl) textEl.textContent = adminLang === 'km' ? 'KM' : 'EN';
  if (optEn) optEn.classList.toggle('active', adminLang === 'en');
  if (optKm) optKm.classList.toggle('active', adminLang === 'km');

  // Translate all [data-i18n]
  const dict = ADMIN_TRANSLATIONS[adminLang] || ADMIN_TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Translate all [data-i18n-placeholder]
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Update current active page header
  const activeNavItem = document.querySelector('.nav-item.active');
  const currentPage = activeNavItem ? activeNavItem.dataset.page : 'dashboard';
  const meta = getPageMeta(currentPage);
  const pTitle = document.getElementById('pageTitle');
  const pSub = document.getElementById('pageSubtitle');
  if (pTitle) pTitle.textContent = meta.title;
  if (pSub) pSub.textContent = meta.subtitle;
}

// Dropdown click listener
document.getElementById('adminLangBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('adminLangMenu');
  if (menu) menu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  const wrap = document.getElementById('adminLangDropdownWrap');
  const menu = document.getElementById('adminLangMenu');
  if (menu && wrap && !wrap.contains(e.target)) {
    menu.classList.remove('show');
  }
});

const COVER_MAP = {
  '9780451524934': 'https://covers.openlibrary.org/b/isbn/9780451524934-L.jpg',
  '9780062316095': 'https://covers.openlibrary.org/b/isbn/9780062316095-L.jpg',
  '9780132350884': 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
  '9780393285023': 'https://covers.openlibrary.org/b/isbn/9780393285023-L.jpg',
  '9781593279929': 'https://covers.openlibrary.org/b/isbn/9781593279929-L.jpg',
};

const KHMER_COVERS = {
  '978-99950-1-001': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
  '978-99950-2-045': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  '978-99950-3-112': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

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

function generatedBookCoverUrl(book) {
  if (typeof generateBookCoverDataUrl === 'function') {
    return generateBookCoverDataUrl(book);
  }
  return null;
}

function bookCoverOnError(img) {
  if (img.dataset.coverFallback === '1') return;
  img.onerror = null;
  const generated = generatedBookCoverUrl({
    title: img.alt,
    author: img.dataset.author || '',
    category: img.dataset.category || 'General',
  });
  if (generated && !img.src.startsWith('data:image/svg+xml')) {
    img.dataset.coverFallback = '1';
    img.src = generated;
    return;
  }
  img.src = '/static/images/book-placeholder.svg';
}

function bookCoverOnLoad(img) {
  if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
    bookCoverOnError(img);
  }
}

function bookCoverImgTag(book) {
  const url = getBookCoverUrl(book) || '/static/images/book-placeholder.svg';
  const author = (book.author || book.author_name || '').replace(/"/g, '&quot;');
  const category = (book.category || book.category_name || 'General').replace(/"/g, '&quot;');
  const title = (book.title || '').replace(/"/g, '&quot;');
  return `<img src="${url}" alt="${title}" loading="lazy" data-author="${author}" data-category="${category}" onload="bookCoverOnLoad(this)" onerror="bookCoverOnError(this)">`;
}

function getBookCoverUrl(book) {
  if (book.cover_image) return book.cover_image;
  if (KHMER_COVERS[book.isbn]) return KHMER_COVERS[book.isbn];
  const isbn = normalizeIsbn(book.isbn);
  if (COVER_MAP[isbn]) return COVER_MAP[isbn];

  const generated = generatedBookCoverUrl(book);
  if (generated) return generated;

  if (isbn.length >= 10) return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

  return '/static/images/book-placeholder.svg';
}

function bookCoverHTML(book, size = 'table') {
  const url = getBookCoverUrl(book);
  const initials = (book.title || 'BK').slice(0, 2).toUpperCase();
  const color = book.cover_color || '#3b82f6';

  if (url) {
    if (size === 'card') {
      return `<div class="book-card-cover">
        ${bookCoverImgTag(book)}
        <span class="book-card-badge ${book.copies_available > 0 ? 'badge-success' : 'badge-danger'}">${book.copies_available > 0 ? 'Available' : 'Borrowed'}</span>
      </div>`;
    }
    return `<div class="book-cover" style="background:${color}">
      ${bookCoverImgTag(book)}
    </div>`;
  }

  if (size === 'card') {
    return `<div class="book-card-cover fallback" style="background:linear-gradient(145deg, ${color}, ${color}88)">
      <span class="cover-title">${initials}</span>
      <span class="book-card-badge ${book.copies_available > 0 ? 'badge-success' : 'badge-danger'}">${book.copies_available > 0 ? 'Available' : 'Borrowed'}</span>
    </div>`;
  }
  return `<div class="book-cover" style="background:linear-gradient(145deg, ${color}, ${color}99)">${initials}</div>`;
}

function bookCardHTML(book) {
  const status = (book.copies_available ?? 0) > 0 ? 'available' : 'borrowed';
  const statusLabel = status === 'available' ? 'Available' : 'Borrowed';
  const statusClass = status === 'available' ? 'badge-success' : 'badge-danger';
  const displayCategory = book.category || 'General';

  return `<article class="book-card" onclick="navigate('books')">
    <div class="book-card-cover">
      ${bookCoverImgTag(book)}
      <span class="book-card-badge ${statusClass}">${statusLabel}</span>
    </div>
    <div class="book-card-body">
      <div class="title">${book.title}</div>
      <div class="meta">${displayCategory}</div>
    </div>
  </article>`;
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

async function openReceiptPreview(borrowingId, type) {
  try {
    const res = await fetch(`${API}/receipts?transaction_id=TRX-${borrowingId}`);
    if (!res.ok) throw new Error('Unable to fetch receipt');
    const items = await res.json();
    if (!items.length) { toast('Receipt not found', 'error'); return; }
    const r = items[0];
    const paper = localStorage.getItem('receipt_paper') || 'A4';
    const pdfUrl = `${API}/receipts/${r.type.toLowerCase()}/${r.receipt_number}.pdf${paper ? `?size=${encodeURIComponent(paper)}` : ''}`;
    openModal(`${r.type} Receipt — ${r.receipt_number}`, `<iframe src="${pdfUrl}" style="width:800px;height:600px;border:0"></iframe>`, `<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-primary" onclick="window.open('${pdfUrl}','_blank')">🖨 Print Receipt</button><button class="btn btn-secondary" onclick="downloadPdf('${r.type.toLowerCase()}','${r.receipt_number}')">📄 Save PDF</button>`);
  } catch (e) { toast(e.message, 'error'); }
}

function downloadPdf(type, receiptNumber) {
  const paper = localStorage.getItem('receipt_paper') || 'A4';
  const url = `${API}/receipts/${type}/${receiptNumber}.pdf${paper ? `?size=${encodeURIComponent(paper)}` : ''}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = `${receiptNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function badge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function openModal(title, bodyHTML, footerHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalFooter').innerHTML = footerHTML || '';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalClose').onclick = closeModal;
document.getElementById('modalOverlay').onclick = (e) => {
  if (e.target.id === 'modalOverlay') closeModal();
};

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  const meta = getPageMeta(page);
  document.getElementById('pageTitle').textContent = meta.title;
  document.getElementById('pageSubtitle').textContent = meta.subtitle;
  document.getElementById('sidebar').classList.remove('open');

  const loaders = {
    dashboard: loadDashboard,
    books: loadBooks,
    members: loadMembers,
    borrowings: loadBorrowings,
    reservations: loadReservations,
    requests: loadBorrowRequests,
    'early-returns': loadEarlyReturns,
    categories: loadCategories,
    authors: loadAuthorsPage,
    reports: loadReports,
    fines: loadFines,
    receipts: loadReceipts,
    settings: loadSettings,
  };
  loaders[page]?.();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.onclick = () => navigate(item.dataset.page);
});

document.getElementById('menuToggle').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};

document.getElementById('globalSearch').onkeydown = (e) => {
  if (e.key === 'Enter') {
    navigate('books');
    document.getElementById('bookSearch').value = e.target.value;
    loadBooks();
  }
};

document.getElementById('notifyBtn').onclick = async () => {
  try {
    const r = await fetchJSON(`${API}/system/send-reminders`, { method: 'POST' });
    toast(`Sent ${r.sent} due date reminders`);
  } catch (e) { toast(e.message, 'error'); }
};

/* ── Theme Toggle ── */
function initTheme() {
  const saved = localStorage.getItem('libra-theme') || 'dark';
  setTheme(saved);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('libra-theme', theme);
  const isDark = theme === 'dark';
  document.getElementById('themeIconDark').style.display = isDark ? 'block' : 'none';
  document.getElementById('themeIconLight').style.display = isDark ? 'none' : 'block';
  if (charts.trends) loadDashboard();
}

document.getElementById('themeToggle').onclick = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
};

document.getElementById('printBooksBtn')?.addEventListener('click', () => window.print());
document.getElementById('importBooksInput')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const result = await handleImportExcel(file);
    toast(`Imported ${result.count} books`);
    loadBooks();
  } catch (err) {
    toast(err.message || 'Import failed', 'error');
  } finally {
    e.target.value = '';
  }
});
document.getElementById('exportBooksBtn')?.addEventListener('click', async () => {
  try {
    await handleExportExcel();
    toast('Export ready');
  } catch (err) {
    toast(err.message || 'Export failed', 'error');
  }
});

/* ── Command Palette ── */
const commandPages = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Overview & statistics' },
  { id: 'books', label: 'Books', hint: 'Manage books & copies' },
  { id: 'members', label: 'Members', hint: 'Students, teachers & staff' },
  { id: 'borrowings', label: 'Borrow & Return', hint: 'Lending activity' },
  { id: 'receipts', label: 'Receipts', hint: 'Receipt history' },
  { id: 'reservations', label: 'Reservations', hint: 'Reservation queue' },
  { id: 'requests', label: 'Borrow Requests', hint: 'Review requests' },
  { id: 'early-returns', label: 'Early Returns / សងមុនថ្ងៃ', hint: 'Process early book returns' },
  { id: 'categories', label: 'Categories', hint: 'Book categories' },
  { id: 'authors', label: 'Authors & Publishers', hint: 'Authors catalog' },
  { id: 'reports', label: 'Reports', hint: 'Analytics & summaries' },
  { id: 'fines', label: 'Fines', hint: 'Overdue penalties' },
  { id: 'settings', label: 'Settings', hint: 'RBAC & printers' },
];

function openCommandPalette() {
  document.getElementById('commandOverlay').classList.add('open');
  const input = document.getElementById('commandInput');
  input.value = '';
  renderCommandResults('');
  input.focus();
}

function closeCommandPalette() {
  document.getElementById('commandOverlay').classList.remove('open');
}

function renderCommandResults(q) {
  const filtered = commandPages.filter(p =>
    p.label.toLowerCase().includes(q.toLowerCase()) ||
    p.id.includes(q.toLowerCase())
  );
  document.getElementById('commandResults').innerHTML = filtered.map(p => `
    <div class="command-item" data-page="${p.id}">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
      <span class="cmd-label">${p.label}</span>
      <span class="cmd-hint">${p.hint}</span>
    </div>`).join('') || '<div class="empty-state">No results found</div>';

  document.querySelectorAll('.command-item').forEach(el => {
    el.onclick = () => {
      navigate(el.dataset.page);
      closeCommandPalette();
    };
  });
}

document.getElementById('commandInput').oninput = (e) => renderCommandResults(e.target.value);
document.getElementById('commandOverlay').onclick = (e) => {
  if (e.target.id === 'commandOverlay') closeCommandPalette();
};

document.getElementById('searchBoxTrigger').onclick = (e) => {
  if (e.target.tagName !== 'INPUT') openCommandPalette();
};

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openCommandPalette();
  }
  if (e.key === 'Escape') closeCommandPalette();
});

function chartDefaults() {
  const muted = cssVar('--text-muted') || 'rgba(148,163,184,0.95)';
  Chart.defaults.color = muted;
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = 'Inter, sans-serif';
}

function chartColors() {
  return [
    cssVar('--chart-1') || '#3b82f6',
    cssVar('--chart-2') || '#22c55e',
    cssVar('--chart-3') || '#ef4444',
    cssVar('--chart-4') || '#f59e0b',
    cssVar('--chart-5') || '#6366f1',
    cssVar('--chart-6') || '#06b6d4',
  ];
}

const statIcons = {
  books: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"/></svg>',
  available: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  borrowed: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4"/></svg>',
  members: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>',
  lost: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>',
  damaged: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
  borrowers: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
  fines: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
};

function statCard(color, icon, label, value, meta, change) {
  return `<div class="stat-card ${color}">
    <div class="stat-header">
      <div class="stat-icon ${color}">${icon}</div>
      ${change ? `<span class="stat-change ${change.type}">${change.text}</span>` : ''}
    </div>
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-meta">${meta}</div>
  </div>`;
}

async function loadDashboard() {
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = Array(8).fill('<div class="skeleton skeleton-stat"></div>').join('');

  const [stats, chartsData, activity, popular, books] = await Promise.all([
    fetchJSON(`${API}/dashboard/stats`),
    fetchJSON(`${API}/dashboard/charts`),
    fetchJSON(`${API}/dashboard/activity`),
    fetchJSON(`${API}/reports/popular`),
    fetchJSON(`${API}/books`),
  ]);

  cache.books = books;

  const isKm = adminLang === 'km';
  document.getElementById('statsGrid').innerHTML = [
    statCard('blue', statIcons.books, isKm ? 'សៀវភៅសរុប' : 'Total Books', stats.total_books, isKm ? `${stats.total_copies} ក្បាលក្នុងបណ្ណាល័យ` : `${stats.total_copies} copies in library`, { type: 'up', text: isKm ? 'កាតាឡុក' : 'Catalog' }),
    statCard('green', statIcons.available, isKm ? 'សៀវភៅអាចខ្ចីបាន' : 'Available Books', stats.available_copies, isKm ? `${stats.borrowed_copies} កំពុងត្រូវបានខ្ចី` : `${stats.borrowed_copies} currently borrowed`),
    statCard('purple', statIcons.borrowed, isKm ? 'សៀវភៅកំពុងខ្ចី' : 'Borrowed Books', stats.borrowed_copies, isKm ? `${stats.active_borrowings} ប្រតិបត្តិការសកម្ម` : `${stats.active_borrowings} active transactions`),
    statCard('cyan', statIcons.members, isKm ? 'សមាជិកបណ្ណាល័យ' : 'Members', stats.active_members, isKm ? `${stats.pending_reservations} ការកក់ទុកកំពុងរង់ចាំ` : `${stats.pending_reservations} pending reservations`),
    statCard('red', statIcons.lost, isKm ? 'សៀវភៅបាត់បង់' : 'Lost Books', stats.lost_copies, isKm ? 'ត្រូវការត្រួតពិនិត្យស្តុក' : 'Requires inventory review'),
    statCard('orange', statIcons.damaged, isKm ? 'សៀវភៅខូចខាត' : 'Damaged Books', stats.damaged_copies, isKm ? 'កំពុងជួសជុល ឬខូចខាត' : 'Under repair or damaged'),
    statCard('pink', statIcons.borrowers, isKm ? 'អ្នកកំពុងខ្ចីសកម្ម' : 'Active Borrowers', stats.active_borrowings, isKm ? `${stats.overdue_borrowings} ហួសកាលកំណត់` : `${stats.overdue_borrowings} overdue items`),
    statCard('amber', statIcons.fines, isKm ? 'ប្រាក់ពិន័យមិនទាន់បង់' : 'Unpaid Fines', `$${stats.unpaid_fines.toFixed(2)}`, isKm ? `អត្រា: $${stats.fine_rate}/ថ្ងៃ` : `Rate: $${stats.fine_rate}/day`),
  ].join('');

  const featured = books.slice(0, 6);
  document.getElementById('featuredBooks').innerHTML = featured.length
    ? featured.map(bookCardHTML).join('')
    : `<div class="empty-state">${isKm ? 'មិនទាន់មានសៀវភៅនៅឡើយទេ' : 'No books in catalog yet'}</div>`;

  const borrows = activity.filter(a => a.type === 'borrow');
  const returns = activity.filter(a => a.type === 'return');

  document.getElementById('recentBorrowsTable').innerHTML = borrows.length
    ? borrows.slice(0, 5).map(a => `
      <tr>
        <td>${a.member}</td>
        <td>${a.book}</td>
        <td>${formatDate(a.date)}</td>
        <td>${badge(a.status)}</td>
      </tr>`).join('')
    : `<tr><td colspan="4" class="empty-state">${isKm ? 'មិនមានទិន្នន័យខ្ចីថ្មីៗ' : 'No recent borrows'}</td></tr>`;

  document.getElementById('recentReturnsTable').innerHTML = returns.length
    ? returns.slice(0, 5).map(a => `
      <tr>
        <td>${a.member}</td>
        <td>${a.book}</td>
        <td>${formatDate(a.date)}</td>
        <td>${badge('returned')}</td>
      </tr>`).join('')
    : `<tr><td colspan="4" class="empty-state">${isKm ? 'មិនមានទិន្នន័យសងថ្មីៗ' : 'No recent returns'}</td></tr>`;

  document.getElementById('activityList').innerHTML = activity.length
    ? activity.map(a => `
      <li class="activity-item">
        <div class="activity-icon ${a.type}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4"/></svg>
        </div>
        <div class="activity-content">
          <div class="title">${a.member} — ${a.book}</div>
          <div class="desc">${a.status} · ${a.type}</div>
        </div>
        <div class="activity-time">${formatDate(a.date)}</div>
      </li>`).join('')
    : `<li class="empty-state">${isKm ? 'មិនមានសកម្មភាពថ្មីៗទេ' : 'No recent activity'}</li>`;

  chartDefaults();
  Object.values(charts).forEach(c => c.destroy?.());
  charts = {};

  const colors = chartColors();
  const primary = colors[0];

  charts.trends = new Chart(document.getElementById('chartTrends'), {
    type: 'line',
    data: {
      labels: chartsData.borrow_trends.labels,
      datasets: [{
        label: isKm ? 'ចំនួនខ្ចី' : 'Borrows',
        data: chartsData.borrow_trends.data,
        borderColor: primary,
        backgroundColor: `${primary}18`,
        fill: true,
        tension: 0.42,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: primary,
        borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { precision: 0 } },
        x: { grid: { display: false } },
      },
    },
  });

  charts.status = new Chart(document.getElementById('chartStatus'), {
    type: 'doughnut',
    data: {
      labels: chartsData.status_distribution.labels,
      datasets: [{
        data: chartsData.status_distribution.data,
        backgroundColor: colors,
        borderWidth: 0,
        spacing: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, pointStyle: 'circle' } } },
    },
  });

  charts.popular = new Chart(document.getElementById('chartPopular'), {
    type: 'bar',
    data: {
      labels: popular.slice(0, 6).map(p => p.title.length > 18 ? p.title.slice(0, 16) + '…' : p.title),
      datasets: [{
        label: isKm ? 'ចំនួនខ្ចី' : 'Borrows',
        data: popular.slice(0, 6).map(p => p.count),
        backgroundColor: popular.slice(0, 6).map((_, i) => `${colors[i % colors.length]}99`),
        borderRadius: 10,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { precision: 0 } },
        y: { grid: { display: false } },
      },
    },
  });

  charts.members = new Chart(document.getElementById('chartMembers'), {
    type: 'bar',
    data: {
      labels: chartsData.member_types.labels,
      datasets: [{
        data: chartsData.member_types.data,
        backgroundColor: [colors[0], colors[4], colors[5]].map(c => `${c}99`),
        borderRadius: 10,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { precision: 0 } },
        x: { grid: { display: false } },
      },
    },
  });

  updatePendingBadges();
}

async function loadBooks() {
  const searchScope = document.getElementById('bookSearchField')?.value || 'all';
  const q = (document.getElementById('bookSearch')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('bookCategoryFilter')?.value || '';
  const statusFilter = document.getElementById('bookStatusFilter')?.value || '';

  // 1. Fetch Books and Copy Summary Stats
  const [books, stats] = await Promise.all([
    fetchJSON(`${API}/books${cat ? `?category_id=${cat}` : ''}`).catch(() => []),
    fetchJSON(`${API}/books/stats/summary`).catch(() => null)
  ]);

  cache.books = books;

  // 2. Update KPI Stats Headers
  if (stats) {
    const tEl = document.getElementById('bookStatTitles');
    const tcEl = document.getElementById('bookStatTotalCopies');
    const aEl = document.getElementById('bookStatAvailable');
    const bEl = document.getElementById('bookStatBorrowed');
    const dEl = document.getElementById('bookStatDamaged');
    const lEl = document.getElementById('bookStatLost');
    const rEl = document.getElementById('bookStatRepair');

    if (tEl) tEl.textContent = stats.total_titles || 0;
    if (tcEl) tcEl.textContent = `${stats.total_copies || 0} ច្បាប់សរុប`;
    if (aEl) aEl.textContent = stats.available_copies || 0;
    if (bEl) bEl.textContent = stats.borrowed_copies || 0;
    if (dEl) dEl.textContent = stats.damaged_copies || 0;
    if (lEl) lEl.textContent = stats.lost_copies || 0;
    if (rEl) rEl.textContent = stats.repair_copies || 0;
  }

  // 3. Multi-Field Filtering (Objective 6)
  let filtered = books;

  if (q) {
    filtered = filtered.filter(b => {
      const title = (b.title || '').toLowerCase();
      const author = (b.author || '').toLowerCase();
      const category = (b.category || '').toLowerCase();
      const isbn = (b.isbn || '').toLowerCase();
      const copyCodes = (b.copies || []).map(c => (c.copy_code || '').toLowerCase()).join(' ');

      if (searchScope === 'title') return title.includes(q);
      if (searchScope === 'author') return author.includes(q);
      if (searchScope === 'category') return category.includes(q);
      if (searchScope === 'code') return isbn.includes(q) || copyCodes.includes(q);
      
      // 'all' fields
      return title.includes(q) || author.includes(q) || category.includes(q) || isbn.includes(q) || copyCodes.includes(q);
    });
  }

  // 4. Status Filtering (Objective 5)
  if (statusFilter) {
    filtered = filtered.filter(b => {
      if (statusFilter === 'available') return (b.copies_available || 0) > 0;
      if (statusFilter === 'borrowed') return (b.copies_borrowed || 0) > 0;
      if (statusFilter === 'damaged') return (b.copies_damaged || 0) > 0;
      if (statusFilter === 'lost') return (b.copies_lost || 0) > 0;
      if (statusFilter === 'repair') return (b.copies_repair || 0) > 0;
      return true;
    });
  }

  // 5. Render Books Table with Detailed Copy Statuses
  const table = document.getElementById('booksTable');
  if (!table) return;

  if (!filtered.length) {
    table.innerHTML = `<tr><td colspan="6" class="empty-state" style="padding:28px;">✨ រកមិនឃើញសៀវភៅតាមលក្ខខណ្ឌស្វែងរកនេះទេ / No matching books found</td></tr>`;
    return;
  }

  table.innerHTML = filtered.map(b => {
    // Badges for copy statuses
    const statusBadges = [];
    if (b.copies_available > 0) {
      statusBadges.push(`<span class="badge" style="background:rgba(16,185,129,0.2); color:#34d399; font-weight:700; font-size:0.75rem; border:1px solid rgba(16,185,129,0.3);">🟢 ${b.copies_available} មានស្តុក</span>`);
    }
    if (b.copies_borrowed > 0) {
      statusBadges.push(`<span class="badge" style="background:rgba(59,130,246,0.2); color:#60a5fa; font-weight:700; font-size:0.75rem; border:1px solid rgba(59,130,246,0.3);">🔵 ${b.copies_borrowed} កំពុងខ្ចី</span>`);
    }
    if (b.copies_damaged > 0) {
      statusBadges.push(`<span class="badge" style="background:rgba(245,158,11,0.2); color:#fbbf24; font-weight:700; font-size:0.75rem; border:1px solid rgba(245,158,11,0.3);">🟠 ${b.copies_damaged} ខូច</span>`);
    }
    if (b.copies_lost > 0) {
      statusBadges.push(`<span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171; font-weight:700; font-size:0.75rem; border:1px solid rgba(239,68,68,0.3);">🔴 ${b.copies_lost} បាត់</span>`);
    }
    if (b.copies_repair > 0) {
      statusBadges.push(`<span class="badge" style="background:rgba(6,182,212,0.2); color:#22d3ee; font-weight:700; font-size:0.75rem; border:1px solid rgba(6,182,212,0.3);">🟡 ${b.copies_repair} ជួសជុល</span>`);
    }
    if (!statusBadges.length) {
      statusBadges.push(`<span class="badge badge-secondary" style="font-size:0.75rem;">មិនទាន់មានច្បាប់</span>`);
    }

    return `
      <tr>
        <td>
          <div class="book-cell" style="display:flex; align-items:center; gap:10px;">
            ${bookCoverHTML(b)}
            <div class="book-info">
              <strong class="title" style="color:#fff; font-size:0.88rem; display:block;">${b.title}</strong>
              <div class="meta" style="font-size:0.75rem; color:var(--text-muted);">✍️ ${b.author || 'មិនស្គាល់អ្នកនិពន្ធ'}</div>
            </div>
          </div>
        </td>
        <td>
          <code style="font-size:0.8rem; color:#93c5fd; font-weight:700;">${b.isbn || '—'}</code>
          <div style="font-size:0.72rem; color:var(--text-muted);">ID: #${b.id}</div>
        </td>
        <td>
          <span class="badge" style="background:rgba(255,255,255,0.08); color:#e2e8f0; font-size:0.78rem;">📂 ${b.category || 'ទូទៅ'}</span>
        </td>
        <td>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            ${statusBadges.join('')}
          </div>
        </td>
        <td>
          <strong style="color:#fff; font-size:0.9rem;">${b.copies_total || 0}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">ក្បាល</span>
        </td>
        <td>
          <div style="display:flex; gap:5px; align-items:center;">
            <button class="btn btn-sm btn-primary" onclick="viewCopies(${b.id})" style="padding:5px 10px; font-size:0.78rem; font-weight:700; background:linear-gradient(135deg, #0284c7, #2563eb); border:none; border-radius:6px; display:inline-flex; align-items:center; gap:4px;" title="គ្រប់គ្រងច្បាប់សៀវភៅ & ស្ថានភាព">
              <span>🔎 ច្បាប់ (${b.copies_total || 0})</span>
            </button>
            <button class="btn btn-sm btn-secondary" onclick="editBookModal(${b.id})" style="padding:5px 8px; font-size:0.78rem; border-radius:6px;" title="កែប្រែព័ត៌មាន">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteBookAction(${b.id})" style="padding:5px 8px; font-size:0.78rem; border-radius:6px;" title="លុបសៀវភៅ">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterBooksByStatus(status) {
  const statusSelect = document.getElementById('bookStatusFilter');
  if (statusSelect) statusSelect.value = status;
  
  // Highlight active status card
  document.querySelectorAll('.book-status-card').forEach(card => {
    const cardStatus = card.getAttribute('data-status') || '';
    if (cardStatus === status) {
      card.classList.add('active-filter');
    } else {
      card.classList.remove('active-filter');
    }
  });

  loadBooks();
  
  const statusNames = {
    '': 'សៀវភៅទាំងអស់',
    'available': 'សៀវភៅមានក្នុងស្តុក (Available)',
    'borrowed': 'សៀវភៅកំពុងខ្ចី (Borrowed)',
    'damaged': 'សៀវភៅខូចខាត (Damaged)',
    'lost': 'សៀវភៅបាត់បង់ (Lost)',
    'repair': 'សៀវភៅកំពុងជួសជុល (In Repair)'
  };
  toast(`🔍 កំពុងច្រោះ៖ ${statusNames[status] || status}`);
}

function resetBookFilters() {
  const sField = document.getElementById('bookSearchField');
  const sInput = document.getElementById('bookSearch');
  const cat = document.getElementById('bookCategoryFilter');
  const status = document.getElementById('bookStatusFilter');

  if (sField) sField.value = 'all';
  if (sInput) sInput.value = '';
  if (cat) cat.value = '';
  if (status) status.value = '';

  document.querySelectorAll('.book-status-card').forEach(card => card.classList.remove('active-filter'));

  loadBooks();
  toast('🔄 បានកំណត់តម្រងឡើងវិញ / Filters reset');
}

function viewCopies(bookId) {
  const book = (cache.books || []).find(b => b.id === bookId);
  if (!book) return;

  const copies = book.copies || [];

  openModal(`🔎 គ្រប់គ្រងច្បាប់ & ស្ថានភាព — «${book.title}»`, `
    <div style="margin-bottom:12px; font-size:0.85rem; color:#94a3b8; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div>
        <span>ISBN: <code style="color:#60a5fa;">${book.isbn}</code></span> | 
        <span>ចំនួនច្បាប់សរុប៖ <strong style="color:#fff;">${copies.length}</strong> ក្បាល</span>
      </div>
      <div style="font-size:0.78rem; color:#34d399;">
        💡 លោកអ្នកអាចផ្លាស់ប្តូរស្ថានភាពច្បាប់នីមួយៗ (មានស្តុក / កំពុងខ្ចី / បាត់ / ខូច / ជួសជុល)
      </div>
    </div>
    <div style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>កូដក្បាល (Barcode)</th>
            <th>ស្ថានភាពបច្ចុប្បន្ន</th>
            <th>ទីតាំងទុក (Location)</th>
            <th>កំណត់សម្គាល់ (Condition Note)</th>
            <th>កែប្រែស្ថានភាព</th>
          </tr>
        </thead>
        <tbody>
          ${!copies.length ? '<tr><td colspan="5" class="empty-state">មិនទាន់មានច្បាប់សៀវភៅនៅឡើយទេ</td></tr>' : copies.map(c => `
            <tr>
              <td><code style="color:#f59e0b; font-weight:800; font-size:0.85rem;">${c.copy_code}</code></td>
              <td>
                ${c.status === 'available' ? '<span class="badge" style="background:#059669; color:#fff;">🟢 មានក្នុងស្តុក</span>' : 
                  (c.status === 'borrowed' ? '<span class="badge" style="background:#2563eb; color:#fff;">🔵 កំពុងខ្ចី</span>' :
                  (c.status === 'damaged' ? '<span class="badge" style="background:#d97706; color:#fff;">🟠 ខូចខាត</span>' :
                  (c.status === 'lost' ? '<span class="badge" style="background:#dc2626; color:#fff;">🔴 បាត់បង់</span>' :
                  '<span class="badge" style="background:#0891b2; color:#fff;">🟡 កំពុងជួសជុល</span>')))}
              </td>
              <td>
                <input type="text" id="copy_loc_${c.id}" value="${c.location || ''}" placeholder="ឧ. Shelf A-1" style="padding:4px 8px; font-size:0.8rem; border-radius:6px; background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); width:110px;">
              </td>
              <td>
                <input type="text" id="copy_note_${c.id}" value="${c.condition_note || ''}" placeholder="ស្ថានភាពសៀវភៅ..." style="padding:4px 8px; font-size:0.8rem; border-radius:6px; background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); width:140px;">
              </td>
              <td>
                <div style="display:flex; align-items:center; gap:6px;">
                  <select id="copy_status_${c.id}" class="filter-select" style="padding:4px 8px; font-size:0.78rem; border-radius:6px; font-weight:700;">
                    <option value="available" ${c.status === 'available' ? 'selected' : ''}>🟢 មានក្នុងស្តុក</option>
                    <option value="borrowed" ${c.status === 'borrowed' ? 'selected' : ''}>🔵 កំពុងខ្ចី</option>
                    <option value="damaged" ${c.status === 'damaged' ? 'selected' : ''}>🟠 ខូចខាត</option>
                    <option value="lost" ${c.status === 'lost' ? 'selected' : ''}>🔴 បាត់បង់</option>
                    <option value="repair" ${c.status === 'repair' ? 'selected' : ''}>🟡 ជួសជុល</option>
                  </select>
                  <button class="btn btn-sm btn-primary" onclick="saveCopyChanges(${c.id})" style="padding:4px 8px; font-size:0.75rem; font-weight:700; border-radius:6px;">💾 Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `, '<button class="btn btn-secondary" onclick="closeModal()">បិទ (Close)</button>');
}

async function saveCopyChanges(copyId) {
  const status = document.getElementById(`copy_status_${copyId}`)?.value || 'available';
  const location = document.getElementById(`copy_loc_${copyId}`)?.value || '';
  const condition_note = document.getElementById(`copy_note_${copyId}`)?.value || '';

  try {
    await fetchJSON(`${API}/copies/${copyId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, location, condition_note })
    });
    toast('✅ បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពច្បាប់សៀវភៅជោគជ័យ!', 'success');
    loadBooks();
    loadDashboard();
  } catch (e) {
    toast(`Error: ${e.message}`, 'error');
  }
}

async function loadMembers() {
  const q = document.getElementById('memberSearch')?.value || '';
  const members = await fetchJSON(`${API}/members?q=${encodeURIComponent(q)}`);
  cache.members = members;

  document.getElementById('membersTable').innerHTML = members.map(m => `
    <tr>
      <td><code>${m.member_code}</code></td>
      <td>${m.full_name}</td>
      <td>${badge(m.member_type)}</td>
      <td>${m.department || '—'}</td>
      <td>${m.email}</td>
      <td>${m.is_active ? badge('available') : badge('lost')}</td>
      <td><button class="btn btn-sm btn-secondary" onclick="viewHistory(${m.id}, '${m.full_name.replace(/'/g, "\\'")}')">History</button></td>
    </tr>`).join('');
}

async function viewHistory(memberId, name) {
  const history = await fetchJSON(`${API}/members/${memberId}/history`);
  openModal(`Borrow History — ${name}`, `
    <table class="data-table">
      <thead><tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th></tr></thead>
      <tbody>${history.map(h => `
        <tr><td>${h.book}</td><td>${formatDate(h.borrowed_at)}</td><td>${formatDate(h.due_date)}</td><td>${formatDate(h.returned_at)}</td><td>${badge(h.status)}</td></tr>`).join('')}
      </tbody>
    </table>`, '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
}

// Helper to update sidebar pending badges
async function updatePendingBadges() {
  try {
    const pendingItems = await fetchJSON(`${API}/borrow-requests?status=pending`);
    const count = pendingItems ? pendingItems.length : 0;
    
    const rBadge = document.getElementById('navRequestsBadge');
    if (rBadge) {
      rBadge.textContent = count;
      rBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    return pendingItems;
  } catch (err) {
    return [];
  }
}

async function loadBorrowings() {
  const status = document.getElementById('borrowFilter')?.value || '';
  const url = `${API}/borrowings${status ? `?status=${status}` : ''}`;
  const items = await fetchJSON(url);

  const table = document.getElementById('borrowingsTable');
  if (table) {
    table.innerHTML = items.length ? items.map(b => `
      <tr>
        <td>${b.member}</td>
        <td>${b.book}</td>
        <td><code>${b.copy_code}</code></td>
        <td>${formatDate(b.borrowed_at)}</td>
        <td>${formatDate(b.due_date)}</td>
        <td>${badge(b.status)}</td>
        <td>${b.status !== 'returned' ? `<button class="btn btn-sm btn-success" onclick="returnBook(${b.id})">Return</button>` : '—'}</td>
      </tr>`).join('') : '<tr><td colspan="7" class="empty-state">No borrowings found for this filter</td></tr>';
  }
}

async function viewBorrowRequestDetails(id) {
  try {
    const items = await fetchJSON(`${API}/borrow-requests?status=all`);
    const r = items.find(x => x.id === id);
    if (!r) {
      toast('Request details not found', 'error');
      return;
    }

    const isPending = r.status === 'pending';
    openModal(`Borrow Request Details — ${r.reference_code || `REQ-2026-${r.id}`}`, `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:12px 16px; border-radius:8px;">
          <div>
            <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Status</span>
            <div style="margin-top:2px;">${badge(r.status)}</div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Tracking Code</span>
            <div style="font-family:monospace; font-weight:800; font-size:1.05rem; color:#60a5fa;">${r.reference_code || `REQ-2026-${r.id}`}</div>
          </div>
        </div>

        <table class="data-table" style="font-size:0.88rem;">
          <tr><th style="width:35%;">Applicant Name</th><td><strong>${r.member}</strong> (${r.member_code || 'ID'})</td></tr>
          <tr><th>Borrower Role</th><td style="text-transform:capitalize;">${r.member_type || 'Student'}</td></tr>
          <tr><th>Phone Number</th><td>${r.phone || '—'}</td></tr>
          <tr><th>Email / Gmail</th><td>${r.email || '—'}</td></tr>
          <tr><th>Department</th><td>${r.department || '—'}</td></tr>
          <tr><th>Book Title</th><td><strong>${r.book}</strong></td></tr>
          <tr><th>Requested Loan Period</th><td><strong>${r.days} Days</strong></td></tr>
          <tr><th>Application Date</th><td>${formatDate(r.requested_at)}</td></tr>
          <tr><th>Applicant Note / Purpose</th><td style="font-style:italic; color:#cbd5e1;">${r.notes || 'Academic research & coursework study'}</td></tr>
        </table>
      </div>
    `, isPending ? `
      <button class="btn btn-success" onclick="closeModal(); reviewBorrowRequest(${r.id}, 'approve');">✓ Approve & Issue Book</button>
      <button class="btn btn-danger" onclick="closeModal(); reviewBorrowRequest(${r.id}, 'reject');">✕ Reject Request</button>
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    ` : '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function returnBook(id) {
  try {
    const res = await fetchJSON(`${API}/borrowings/${id}/return`, { method: 'POST' });
    toast('Book returned successfully');
    loadBorrowings();
    openReceiptPreview(res.id, 'RETURN');
  } catch (e) { toast(e.message, 'error'); }
}

async function loadReservations() {
  const items = await fetchJSON(`${API}/reservations`);
  document.getElementById('reservationsTable').innerHTML = items.map(r => `
    <tr>
      <td>${r.member}</td><td>${r.book}</td>
      <td>${formatDate(r.reserved_at)}</td><td>${formatDate(r.expires_at)}</td>
      <td>${badge(r.status)}</td>
    </tr>`).join('');
}

let currentBorrowRequests = [];

async function loadBorrowRequests() {
  try {
    // 1. Fetch all requests to compute summary KPI stats
    const allRequests = await fetchJSON(`${API}/borrow-requests?status=all`).catch(() => []);
    const pendingCount = allRequests.filter(r => r.status === 'pending').length;
    const approvedCount = allRequests.filter(r => r.status === 'approved').length;
    const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;

    const pStat = document.getElementById('reqStatPending');
    const aStat = document.getElementById('reqStatApproved');
    const rStat = document.getElementById('reqStatRejected');
    if (pStat) pStat.textContent = pendingCount;
    if (aStat) aStat.textContent = approvedCount;
    if (rStat) rStat.textContent = rejectedCount;

    const rBadge = document.getElementById('navRequestsBadge');
    if (rBadge) {
      rBadge.textContent = pendingCount;
      rBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    // 2. Fetch filtered requests
    const filterVal = document.getElementById('requestsStatusFilter')?.value || 'pending';
    const items = await fetchJSON(`${API}/borrow-requests?status=${filterVal}`);
    currentBorrowRequests = items || [];
    renderBorrowRequestsTable(currentBorrowRequests);
  } catch (err) {
    const table = document.getElementById('requestsTable');
    if (table) table.innerHTML = `<tr><td colspan="8" class="empty-state">Error loading requests: ${err.message}</td></tr>`;
  }
}

function renderBorrowRequestsTable(items) {
  const table = document.getElementById('requestsTable');
  if (!table) return;

  if (!items || !items.length) {
    table.innerHTML = `<tr><td colspan="8" class="empty-state" style="padding:28px;">✨ មិនមានសំណើក្នុងបញ្ជីនេះទេ / No borrow requests found</td></tr>`;
    return;
  }

  table.innerHTML = items.map(r => {
    const isPending = r.status === 'pending';
    const isApproved = r.status === 'approved';
    const isRejected = r.status === 'rejected';

    let statusBadge = `<span class="badge" style="background:#f59e0b; color:#000; font-weight:700;">⏳ Pending</span>`;
    if (isApproved) statusBadge = `<span class="badge" style="background:#10b981; color:#fff; font-weight:700;">✓ Approved</span>`;
    if (isRejected) statusBadge = `<span class="badge" style="background:#ef4444; color:#fff; font-weight:700;">✕ Rejected</span>`;

    return `
      <tr>
        <td><code style="color:#60a5fa; font-weight:800; font-size:0.85rem;">${r.reference_code || `REQ-2026-${String(r.id).padStart(4, '0')}`}</code></td>
        <td>
          <strong style="color:#fff;">${r.member}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${r.member_code || ''}</div>
        </td>
        <td>
          <span class="badge badge-secondary" style="text-transform:capitalize;">${r.member_type || 'Student'}</span>
          <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">📞 ${r.phone || '—'}</div>
        </td>
        <td><strong style="color:#e2e8f0;">${r.book}</strong></td>
        <td><span class="badge" style="background:#2563eb; color:#fff; font-weight:700;">${r.days} Days</span></td>
        <td>${formatDate(r.requested_at)}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
            ${isPending ? `
              <button class="btn btn-sm btn-success" onclick="reviewBorrowRequest(${r.id}, 'approve')" style="font-weight:700; background:#059669; border-color:#059669;">
                ✓ Confirm & Approve
              </button>
              <button class="btn btn-sm btn-danger" onclick="reviewBorrowRequest(${r.id}, 'reject')" style="background:#dc2626; border-color:#dc2626;">
                ✕ Reject
              </button>
            ` : ''}
            <button class="btn btn-sm btn-secondary" onclick="viewBorrowRequestDetails(${r.id})" title="View application details">
              👁️ Details
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterBorrowRequestsTable() {
  const q = (document.getElementById('requestsSearchInput')?.value || '').toLowerCase().trim();
  if (!q) {
    renderBorrowRequestsTable(currentBorrowRequests);
    return;
  }

  const filtered = currentBorrowRequests.filter(r => 
    (r.member && r.member.toLowerCase().includes(q)) ||
    (r.reference_code && r.reference_code.toLowerCase().includes(q)) ||
    (r.book && r.book.toLowerCase().includes(q)) ||
    (r.phone && r.phone.toLowerCase().includes(q)) ||
    (r.email && r.email.toLowerCase().includes(q))
  );
  renderBorrowRequestsTable(filtered);
}

async function reviewBorrowRequest(id, action) {
  try {
    const res = await fetchJSON(`${API}/borrow-requests/${id}/${action}`, { method: 'POST', body: JSON.stringify({}) });
    if (action === 'approve') {
      toast(`✅ Request approved successfully! Active loan created.`);
    } else {
      toast(`⚠️ Request has been rejected.`);
    }
    loadBorrowRequests();
    updatePendingBadges();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Early Returns Management ── */
let currentEarlyReturnsList = [];

async function loadEarlyReturns() {
  try {
    const filterType = document.getElementById('earlyFilterSelect')?.value || 'active';
    const items = await fetchJSON(`${API}/early-returns?filter_type=${filterType}`);
    currentEarlyReturnsList = items || [];

    // Update KPI Counters
    if (filterType === 'active') {
      const eligibleEl = document.getElementById('earlyStatEligible');
      if (eligibleEl) eligibleEl.textContent = currentEarlyReturnsList.length;
      
      const badge = document.getElementById('navEarlyReturnBadge');
      if (badge) {
        badge.textContent = currentEarlyReturnsList.length;
        badge.style.display = currentEarlyReturnsList.length > 0 ? 'inline-block' : 'none';
      }
    } else {
      const completedEl = document.getElementById('earlyStatCompleted');
      if (completedEl) completedEl.textContent = currentEarlyReturnsList.length;
    }

    renderEarlyReturnsTable(currentEarlyReturnsList);
  } catch (err) {
    const table = document.getElementById('earlyReturnsTable');
    if (table) table.innerHTML = `<tr><td colspan="8" class="empty-state">Error loading early returns: ${err.message}</td></tr>`;
  }
}

function renderEarlyReturnsTable(items) {
  const table = document.getElementById('earlyReturnsTable');
  if (!table) return;

  if (!items || !items.length) {
    table.innerHTML = `<tr><td colspan="8" class="empty-state" style="padding:28px;">✨ មិនមានទិន្នន័យក្នុងបញ្ជីនេះទេ / No records found</td></tr>`;
    return;
  }

  const filterType = document.getElementById('earlyFilterSelect')?.value || 'active';

  table.innerHTML = items.map((r, idx) => {
    const isCompleted = r.status === 'returned';

    let remainingBadge = '';
    if (isCompleted) {
      remainingBadge = `<span class="badge" style="background:#10b981; color:#fff; font-weight:700;">✓ បានសងមុន ${r.days_remaining} ថ្ងៃ</span>`;
    } else {
      remainingBadge = `<span class="badge" style="background:#059669; color:#fff; font-weight:800; font-size:0.82rem; padding:4px 10px;">⚡ នៅសល់ ${r.days_remaining} ថ្ងៃទៀត</span>`;
    }

    return `
      <tr>
        <td>
          <code style="color:#60a5fa; font-weight:800; font-size:0.85rem;">TRX-${String(r.id).padStart(4, '0')}</code>
        </td>
        <td>
          <strong style="color:#fff;">${r.member_name}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${r.member_code}</div>
        </td>
        <td>
          <span class="badge badge-secondary" style="text-transform:capitalize;">${r.member_type}</span>
          <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">📞 ${r.phone || '—'}</div>
        </td>
        <td>
          <strong style="color:#e2e8f0;">${r.book_title}</strong>
        </td>
        <td>
          <code style="color:#f59e0b; font-weight:700;">${r.copy_code}</code>
        </td>
        <td>
          <div style="font-size:0.8rem; color:#94a3b8;">
            <span>${formatDate(r.borrowed_at)}</span>
            <span style="color:#60a5fa; font-weight:bold;"> ➡️ </span>
            <span style="color:#e2e8f0; font-weight:600;">${formatDate(r.due_date)}</span>
          </div>
        </td>
        <td>
          ${remainingBadge}
        </td>
        <td>
          ${!isCompleted ? `
            <button class="btn btn-sm btn-success" onclick="confirmEarlyReturnAction(${r.id}, '${(r.member_name || '').replace(/'/g, "\\'")}', '${(r.book_title || '').replace(/'/g, "\\'")}', ${r.days_remaining})" style="font-weight:700; background:linear-gradient(135deg, #059669, #10b981); border:none; box-shadow:0 2px 8px rgba(16,185,129,0.35); padding:6px 12px; display:inline-flex; align-items:center; gap:5px; border-radius:8px;">
              <span>✓</span> <span>បានសងមុនថ្ងៃកំណត់</span>
            </button>
          ` : `
            <span style="font-size:0.78rem; color:#34d399; font-weight:700;">✓ រួចរាល់ (Returned)</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function filterEarlyReturnsTable() {
  const q = (document.getElementById('earlySearchInput')?.value || '').toLowerCase().trim();
  if (!q) {
    renderEarlyReturnsTable(currentEarlyReturnsList);
    return;
  }
  const filtered = currentEarlyReturnsList.filter(r =>
    (r.member_name && r.member_name.toLowerCase().includes(q)) ||
    (r.member_code && r.member_code.toLowerCase().includes(q)) ||
    (r.book_title && r.book_title.toLowerCase().includes(q)) ||
    (r.copy_code && r.copy_code.toLowerCase().includes(q)) ||
    (r.phone && r.phone.toLowerCase().includes(q)) ||
    (r.department && r.department.toLowerCase().includes(q))
  );
  renderEarlyReturnsTable(filtered);
}

async function confirmEarlyReturnAction(id, memberName, bookTitle, daysRemaining) {
  if (!confirm(`តើអ្នកពិតជាចង់ទទួលសៀវភៅ «${bookTitle}» ពីសមាជិក «${memberName}» ដែលបានសងមុនកាលកំណត់ (${daysRemaining} ថ្ងៃ) មែនទេ?`)) {
    return;
  }

  try {
    const res = await fetchJSON(`${API}/early-returns/${id}/confirm`, { method: 'POST' });
    toast(`🎉 ${res.message || 'បានទទួលសៀវភៅសងមុនថ្ងៃកំណត់ជោគជ័យ!'}`, 'success');
    loadEarlyReturns();
    loadDashboard();
    updatePendingBadges();
  } catch (err) {
    toast(`Error: ${err.message}`, 'error');
  }
}

async function loadReceipts() {
  const q = document.getElementById('receiptSearch')?.value || '';
  let url = `${API}/receipts`;
  if (q) url += `?transaction_id=${encodeURIComponent(q)}`;
  const items = await fetchJSON(url);
  document.getElementById('receiptsTable').innerHTML = items.map(r => `
    <tr>
      <td><code>${r.receipt_number}</code></td>
      <td>${r.member_name || '—'}</td>
      <td>${r.book_title || '—'}</td>
      <td>${r.type}</td>
      <td>${new Date(r.date).toLocaleString()}</td>
      <td>$0.00</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openReceiptPreview(${r.id}, '${r.type}')">👁 View</button>
        <button class="btn btn-sm btn-primary" onclick="window.open('${API}/receipts/${r.type.toLowerCase()}/${r.receipt_number}.pdf','_blank')">🖨 Print</button>
        <button class="btn btn-sm btn-secondary" onclick="downloadPdf('${r.type.toLowerCase()}','${r.receipt_number}')">📄 PDF</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7" class="empty-state">No receipts</td></tr>';
}

async function loadCategories() {
  cache.categories = await fetchJSON(`${API}/categories`);
  document.getElementById('categoriesTable').innerHTML = cache.categories.map(c => `
    <tr><td>${c.name}</td><td>${c.name_km || '—'}</td><td>${c.description || '—'}</td></tr>`).join('');
}

async function loadAuthorsPage() {
  const [authors, publishers] = await Promise.all([
    fetchJSON(`${API}/authors`),
    fetchJSON(`${API}/publishers`),
  ]);
  cache.authors = authors;
  cache.publishers = publishers;

  document.getElementById('authorsTable').innerHTML = authors.map(a => `
    <tr><td>${a.name}</td><td>${a.nationality || '—'}</td><td>${(a.bio || '').slice(0, 60)}</td></tr>`).join('');

  document.getElementById('publishersTable').innerHTML = publishers.map(p => `
    <tr><td>${p.name}</td><td>${p.email || '—'}</td><td>${p.phone || '—'}</td></tr>`).join('');
}

/* ── Comprehensive Reports & Analytics Suite ── */
let currentReportRange = 'month';
let currentReportData = null;
let currentReportTransactions = [];

async function loadReports() {
  await fetchReportsAnalytics(currentReportRange);
}

function selectReportPreset(range) {
  currentReportRange = range;
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === range);
  });
  fetchReportsAnalytics(range);
}

function applyCustomReportDateRange() {
  const start = document.getElementById('rptStartDate')?.value;
  const end = document.getElementById('rptEndDate')?.value;
  if (!start || !end) {
    toast('សូមជ្រើសរើសកាលបរិច្ឆេទ «ពីថ្ងៃ» និង «ដល់ថ្ងៃ» / Please select start and end date', 'warning');
    return;
  }
  if (start > end) {
    toast('កាលបរិច្ឆេទចាប់ផ្តើមមិនអាចធំជាងកាលបរិច្ឆេទបញ្ចប់ទេ / Start date must be before end date', 'error');
    return;
  }
  document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));
  currentReportRange = 'custom';
  fetchReportsAnalytics('custom', start, end);
}

async function fetchReportsAnalytics(rangeType, startDate = '', endDate = '') {
  try {
    const data = await fetchJSON(`${API}/reports/analytics?range_type=${rangeType}&start_date=${startDate}&end_date=${endDate}`);
    currentReportData = data;
    currentReportTransactions = data.transactions || [];

    // 1. Period Badge
    const pBadge = document.getElementById('rptCurrentPeriodBadge');
    if (pBadge) pBadge.textContent = data.period_label || 'របាយការណ៍';

    // Sync date pickers with active range
    const sInput = document.getElementById('rptStartDate');
    const eInput = document.getElementById('rptEndDate');
    if (rangeType !== 'custom') {
      if (data.start_date && sInput) sInput.value = data.start_date;
      if (data.end_date && eInput) eInput.value = data.end_date;
    }

    // 2. Summary KPI Cards
    const s = data.summary || {};
    const bType = s.borrowers_by_type || {};

    if (document.getElementById('rptStatBorrowers')) {
      document.getElementById('rptStatBorrowers').textContent = s.unique_borrowers || 0;
      document.getElementById('rptStatBorrowersMeta').textContent = `សិស្ស: ${bType.student || 0} | គ្រូ: ${bType.teacher || 0} | បុគ្គលិក: ${bType.staff || 0}`;
    }
    if (document.getElementById('rptStatTotalLoans')) {
      document.getElementById('rptStatTotalLoans').textContent = s.total_loans || 0;
      document.getElementById('rptStatActiveLoans').textContent = `កំពុងខ្ចីសកម្ម: ${s.active_loans || 0} ក្បាល`;
    }
    if (document.getElementById('rptStatReturned')) {
      document.getElementById('rptStatReturned').textContent = s.returned_loans || 0;
      document.getElementById('rptStatOnTimeRate').textContent = s.on_time_rate || '100%';
    }
    if (document.getElementById('rptStatRequests')) {
      document.getElementById('rptStatRequests').textContent = s.total_requests || 0;
      document.getElementById('rptStatRequestsMeta').textContent = `អនុម័ត: ${s.approved_requests || 0} | រង់ចាំ: ${s.pending_requests || 0}`;
    }
    if (document.getElementById('rptStatOverdue')) {
      document.getElementById('rptStatOverdue').textContent = s.overdue_loans || 0;
    }
    if (document.getElementById('rptStatFines')) {
      document.getElementById('rptStatFines').textContent = `$${(s.total_fines_amount || 0).toFixed(2)}`;
      document.getElementById('rptStatFinesMeta').textContent = `បានបង់: $${(s.paid_fines_amount || 0).toFixed(2)} | នៅជំពាក់: $${(s.unpaid_fines_amount || 0).toFixed(2)}`;
    }

    // 3. Top Borrowed Books Ranking
    const topBooksEl = document.getElementById('rptTopBooksList');
    if (topBooksEl) {
      if (!data.top_books || !data.top_books.length) {
        topBooksEl.innerHTML = '<div class="empty-state" style="padding:16px;">✨ មិនមានទិន្នន័យខ្ចីក្នុងកាលបរិច្ឆេទនេះទេ / No book loans in this period</div>';
      } else {
        const maxCount = data.top_books[0]?.count || 1;
        topBooksEl.innerHTML = data.top_books.map((b, idx) => {
          const rankClass = idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : 'rank-default'));
          const pct = Math.round((b.count / maxCount) * 100);
          return `
            <div class="report-item-row">
              <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
                <span class="rank-badge ${rankClass}">#${idx + 1}</span>
                <div style="width:34px; height:46px; border-radius:6px; background:${b.cover_color || '#3b82f6'}; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                  ${b.cover_image ? `<img src="${b.cover_image}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:16px;">📖</span>`}
                </div>
                <div style="min-width:0; flex:1;">
                  <strong style="color:#fff; font-size:0.86rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.title}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted); display:flex; gap:8px;">
                    <span>✍️ ${b.author}</span>
                    <span>📂 ${b.category}</span>
                  </div>
                  <div style="width:100%; background:rgba(255,255,255,0.08); height:4px; border-radius:9999px; margin-top:5px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #3b82f6, #60a5fa); border-radius:9999px;"></div>
                  </div>
                </div>
              </div>
              <div style="text-align:right; margin-left:14px;">
                <span class="badge" style="background:#2563eb; color:#fff; font-weight:800; font-size:0.82rem; padding:4px 10px;">${b.count} ដង</span>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">ខ្ចីសរុប</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 4. Top Active Borrowers Ranking
    const topBorrowersEl = document.getElementById('rptTopBorrowersList');
    if (topBorrowersEl) {
      if (!data.top_borrowers || !data.top_borrowers.length) {
        topBorrowersEl.innerHTML = '<div class="empty-state" style="padding:16px;">✨ មិនមានទិន្នន័យអ្នកខ្ចីក្នុងកាលបរិច្ឆេទនេះទេ / No active borrowers</div>';
      } else {
        topBorrowersEl.innerHTML = data.top_borrowers.map((m, idx) => {
          const rankClass = idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : 'rank-default'));
          const initials = (m.full_name || 'MB').slice(0, 2).toUpperCase();
          return `
            <div class="report-item-row">
              <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
                <span class="rank-badge ${rankClass}">#${idx + 1}</span>
                <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #4f46e5, #06b6d4); color:#fff; font-weight:800; font-size:0.75rem; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  ${initials}
                </div>
                <div style="min-width:0; flex:1;">
                  <strong style="color:#fff; font-size:0.86rem; display:block;">${m.full_name}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted); display:flex; gap:6px; flex-wrap:wrap;">
                    <span class="badge badge-secondary" style="font-size:0.7rem; padding:1px 6px;">${m.member_type}</span>
                    <span>${m.member_code}</span>
                    <span>${m.department || ''}</span>
                  </div>
                </div>
              </div>
              <div style="text-align:right; margin-left:14px;">
                <span class="badge" style="background:#059669; color:#fff; font-weight:800; font-size:0.82rem; padding:4px 10px;">${m.count} ក្បាល</span>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">សៀវភៅបានខ្ចី</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 5. Detailed Transactions Table
    renderReportTransactionsTable(currentReportTransactions);

  } catch (err) {
    toast(`Error loading analytics: ${err.message}`, 'error');
  }
}

function renderReportTransactionsTable(items) {
  const tbody = document.getElementById('rptTransactionsBody');
  const countBadge = document.getElementById('rptTableCountBadge');
  if (countBadge) countBadge.textContent = `សរុប ${items?.length || 0} ប្រតិបត្តិការ`;
  if (!tbody) return;

  if (!items || !items.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state" style="padding:24px;">✨ មិនមានទិន្នន័យប្រតិបត្តិការក្នុងកាលបរិច្ឆេទនេះទេ / No transactions in this period</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(t => {
    let statusBadge = `<span class="badge" style="background:#2563eb; color:#fff; font-weight:700;">📖 កំពុងខ្ចី (Active)</span>`;
    if (t.status === 'returned') statusBadge = `<span class="badge" style="background:#10b981; color:#fff; font-weight:700;">✓ បានសង (Returned)</span>`;
    if (t.status === 'overdue') statusBadge = `<span class="badge" style="background:#ef4444; color:#fff; font-weight:700;">⚠️ ហួសកំណត់ (Overdue)</span>`;

    return `
      <tr>
        <td>
          <strong style="color:#e2e8f0; font-size:0.84rem;">${formatDate(t.borrowed_at)}</strong>
        </td>
        <td>
          <strong style="color:#fff;">${t.member_name}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${t.member_code}</div>
        </td>
        <td>
          <span class="badge badge-secondary" style="text-transform:capitalize;">${t.member_type}</span>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${t.department || '—'}</div>
        </td>
        <td>
          <strong style="color:#e2e8f0;">${t.book_title}</strong>
          <div style="font-size:0.75rem; color:#60a5fa;">📂 ${t.category}</div>
        </td>
        <td><code style="color:#f59e0b; font-weight:700;">${t.copy_code}</code></td>
        <td>
          <span style="font-size:0.82rem; color:${t.status === 'overdue' ? '#f87171' : '#cbd5e1'}; font-weight:600;">
            ${formatDate(t.due_date)}
          </span>
        </td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function filterReportTable() {
  const q = (document.getElementById('rptTableSearchInput')?.value || '').toLowerCase().trim();
  if (!q) {
    renderReportTransactionsTable(currentReportTransactions);
    return;
  }
  const filtered = currentReportTransactions.filter(t => 
    (t.member_name && t.member_name.toLowerCase().includes(q)) ||
    (t.member_code && t.member_code.toLowerCase().includes(q)) ||
    (t.book_title && t.book_title.toLowerCase().includes(q)) ||
    (t.copy_code && t.copy_code.toLowerCase().includes(q)) ||
    (t.department && t.department.toLowerCase().includes(q)) ||
    (t.category && t.category.toLowerCase().includes(q))
  );
  renderReportTransactionsTable(filtered);
}

function exportReportsCSV() {
  if (!currentReportTransactions || !currentReportTransactions.length) {
    toast('គ្មានទិន្នន័យសម្រាប់ទាញយកទេ / No transaction data to export', 'warning');
    return;
  }

  const start = document.getElementById('rptStartDate')?.value || '';
  const end = document.getElementById('rptEndDate')?.value || '';
  const url = `${API}/reports/export-excel?range_type=${currentReportRange || 'month'}&start_date=${start}&end_date=${end}`;
  
  toast('📊 កំពុងបង្កើតឯកសារ Excel (.xlsx)...');
  window.location.href = url;
}

function printOfficialReport() {
  if (!currentReportData) {
    toast('ទិន្នន័យមិនទាន់រួចរាល់ទេ / Report data not ready', 'warning');
    return;
  }
  const s = currentReportData.summary || {};
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast('សូមអនុញ្ញាត Popup Window ដើម្បីបោះពុម្ព', 'warning');
    return;
  }

  const tableRows = (currentReportTransactions || []).map((t, idx) => `
    <tr>
      <td style="text-align:center;">${idx + 1}</td>
      <td>${formatDate(t.borrowed_at)}</td>
      <td><strong>${t.member_name}</strong> (${t.member_code})</td>
      <td>${t.member_type}</td>
      <td>${t.book_title}</td>
      <td>${t.copy_code}</td>
      <td>${formatDate(t.due_date)}</td>
      <td style="text-align:center; text-transform:uppercase; font-weight:bold;">${t.status}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="UTF-8">
      <title>BELTEI Library Official Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Kantumruy Pro', 'Inter', sans-serif; color: #1e293b; padding: 30px; font-size: 13px; line-height: 1.5; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-box { display: flex; align-items: center; gap: 14px; }
        .logo-box img { width: 55px; height: 55px; object-contain: contain; }
        .title-box h1 { font-size: 18px; margin: 0; color: #1e3a8a; font-weight: 700; }
        .title-box p { font-size: 12px; margin: 2px 0 0 0; color: #64748b; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; background: #f8fafc; }
        .kpi-card .label { font-size: 11px; color: #64748b; font-weight: 600; }
        .kpi-card .val { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
        th { background: #f1f5f9; color: #334155; font-weight: 700; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; padding-top: 20px; }
        .sign-box { text-align: center; width: 200px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-box">
          <img src="/static/images/beltei-logo.png" alt="Logo">
          <div class="title-box">
            <h1>សាកលវិទ្យាល័យ ប៊ែលធី អន្តរជាតិ · បណ្ណាល័យកណ្តាល</h1>
            <p>BELTEI INTERNATIONAL UNIVERSITY · CENTRAL LIBRARY MANAGEMENT SYSTEM</p>
          </div>
        </div>
        <div style="text-align:right;">
          <strong style="color:#2563eb; font-size:14px;">របាយការណ៍ស្ថិតិ & អ្នកខ្ចីសៀវភៅ</strong>
          <div style="font-size:11px; color:#64748b; margin-top:3px;">${currentReportData.period_label}</div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card"><div class="label">អ្នកខ្ចីសរុប (Borrowers)</div><div class="val">${s.unique_borrowers || 0} នាក់</div></div>
        <div class="kpi-card"><div class="label">សៀវភៅបានខ្ចីសរុប</div><div class="val">${s.total_loans || 0} ក្បាល</div></div>
        <div class="kpi-card"><div class="label">សៀវភៅបានសងរួច</div><div class="val">${s.returned_loans || 0} ក្បាល</div></div>
        <div class="kpi-card"><div class="label">ប្រាក់ពិន័យប្រមូលបាន</div><div class="val">$${(s.total_fines_amount || 0).toFixed(2)}</div></div>
      </div>

      <h3 style="font-size:14px; margin: 0 0 8px 0; color:#1e293b;">បញ្ជីលម្អិតប្រតិបត្តិការខ្ចី-សង (Detailed Loan Records)</h3>
      <table>
        <thead>
          <tr>
            <th>ល.រ</th>
            <th>កាលបរិច្ឆេទ</th>
            <th>អ្នកខ្ចី</th>
            <th>ប្រភេទ</th>
            <th>ចំណងជើងសៀវភៅ</th>
            <th>កូដក្បាល</th>
            <th>ថ្ងៃកំណត់សង</th>
            <th>ស្ថានភាព</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="8" style="text-align:center;">គ្មានទិន្នន័យ</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        <div class="sign-box">
          <p>អ្នករៀបចំរបាយការណ៍</p>
          <br><br><br>
          <p>.......................................</p>
        </div>
        <div class="sign-box">
          <p>ប្រធានគ្រប់គ្រងបណ្ណាល័យ</p>
          <br><br><br>
          <p>.......................................</p>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

async function loadFines() {
  const fines = await fetchJSON(`${API}/fines`);
  document.getElementById('finesTable').innerHTML = fines.map(f => `
    <tr>
      <td>${f.member}</td>
      <td><strong>$${f.amount.toFixed(2)}</strong></td>
      <td>${f.reason}</td>
      <td>${formatDate(f.created_at)}</td>
      <td><button class="btn btn-sm btn-success" onclick="payFine(${f.id})">Mark Paid</button></td>
    </tr>`).join('') || '<tr><td colspan="5" class="empty-state">No unpaid fines</td></tr>';
}

async function payFine(id) {
  try {
    await fetchJSON(`${API}/fines/${id}/pay`, { method: 'POST' });
    toast('Fine marked as paid');
    loadFines();
  } catch (e) { toast(e.message, 'error'); }
}

async function loadSettings() {
  const users = await fetchJSON(`${API}/users`);
  document.getElementById('usersTable').innerHTML = users.map(u => `
    <tr>
      <td>${u.username}</td><td>${u.full_name}</td><td>${u.email}</td>
      <td>${badge(u.role)}</td>
      <td>${u.is_active ? badge('available') : badge('lost')}</td>
    </tr>`).join('');

  const paper = localStorage.getItem('receipt_paper') || 'A4';
  const printer = localStorage.getItem('receipt_printer') || '';
  const copies = localStorage.getItem('receipt_copies') || '1';
  document.getElementById('paperSizeSelect').value = paper;
  document.getElementById('printerName').value = printer;
  document.getElementById('copiesCount').value = copies;

  document.getElementById('savePrinterSettings').onclick = () => {
    localStorage.setItem('receipt_paper', document.getElementById('paperSizeSelect').value);
    localStorage.setItem('receipt_printer', document.getElementById('printerName').value.trim());
    localStorage.setItem('receipt_copies', document.getElementById('copiesCount').value || '1');
    toast('Printer settings saved');
  };
}

async function ensureCatalogCache() {
  if (!cache.categories.length) cache.categories = await fetchJSON(`${API}/categories`);
  if (!cache.authors.length) cache.authors = await fetchJSON(`${API}/authors`);
  if (!cache.publishers.length) cache.publishers = await fetchJSON(`${API}/publishers`);
  if (!cache.members.length) cache.members = await fetchJSON(`${API}/members`);
  if (!cache.books.length) cache.books = await fetchJSON(`${API}/books`);
}

function selectOptions(items, labelKey = 'name', valueKey = 'id') {
  return items.map(i => `<option value="${i[valueKey]}">${i[labelKey]}</option>`).join('');
}

document.getElementById('addBookBtn').onclick = async () => {
  await ensureCatalogCache();
  openModal('Add New Book', `
    <div class="form-group"><label>Title</label><input id="f_title" placeholder="Book title"></div>
    <div class="form-row">
      <div class="form-group"><label>ISBN</label><input id="f_isbn" placeholder="978-..."></div>
      <div class="form-group"><label>Year</label><input id="f_year" type="number" placeholder="2024"></div>
    </div>
    <div class="form-group">
      <label>Cover Image</label>
      <input id="f_cover_image_url" placeholder="Image URL">
      <input id="f_cover_image_file" type="file" accept="image/*">
      <small style="opacity:.7">Select an image file or paste a URL for this book cover.</small>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Category</label><select id="f_category"><option value="">—</option>${selectOptions(cache.categories)}</select></div>
      <div class="form-group"><label>Author</label><select id="f_author"><option value="">—</option>${selectOptions(cache.authors)}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Publisher</label><select id="f_publisher"><option value="">—</option>${selectOptions(cache.publishers)}</select></div>
      <div class="form-group"><label>Copies</label><input id="f_copies" type="number" value="1" min="1"></div>
    </div>
    <div class="form-group"><label>Description</label><textarea id="f_desc"></textarea></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="saveBookBtn">Save Book</button>`);

  document.getElementById('saveBookBtn').onclick = async () => {
    try {
      let coverImage = document.getElementById('f_cover_image_url').value.trim() || null;
      const fileInput = document.getElementById('f_cover_image_file');
      if (fileInput.files && fileInput.files.length) {
        const uploadData = new FormData();
        uploadData.append('file', fileInput.files[0]);
        const uploadResponse = await fetch(`${API}/upload-cover`, {
          method: 'POST',
          body: uploadData,
        });
        if (!uploadResponse.ok) {
          const err = await uploadResponse.json().catch(() => ({}));
          throw new Error(err.detail || 'Cover upload failed');
        }
        const uploadResult = await uploadResponse.json();
        coverImage = uploadResult.url;
      }

      const body = {
        title: document.getElementById('f_title').value,
        isbn: document.getElementById('f_isbn').value,
        publication_year: parseInt(document.getElementById('f_year').value) || null,
        cover_image: coverImage,
        category_id: parseInt(document.getElementById('f_category').value) || null,
        author_id: parseInt(document.getElementById('f_author').value) || null,
        publisher_id: parseInt(document.getElementById('f_publisher').value) || null,
        copies_count: parseInt(document.getElementById('f_copies').value) || 1,
        description: document.getElementById('f_desc').value,
      };
      await fetchJSON(`${API}/books`, { method: 'POST', body: JSON.stringify(body) });
      toast('Book added successfully');
      closeModal();
      loadBooks();
    } catch (e) { toast(e.message, 'error'); }
  };
};

document.getElementById('addMemberBtn').onclick = () => {
  openModal('Add Member', `
    <div class="form-row">
      <div class="form-group"><label>Member Code</label><input id="m_code" placeholder="STU-004"></div>
      <div class="form-group"><label>Type</label><select id="m_type"><option value="student">Student</option><option value="teacher">Teacher</option><option value="staff">Staff</option></select></div>
    </div>
    <div class="form-group"><label>Full Name</label><input id="m_name"></div>
    <div class="form-row">
      <div class="form-group"><label>Email</label><input id="m_email" type="email"></div>
      <div class="form-group"><label>Phone</label><input id="m_phone"></div>
    </div>
    <div class="form-group"><label>Department</label><input id="m_dept"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="saveMemberBtn">Save Member</button>`);

  document.getElementById('saveMemberBtn').onclick = async () => {
    try {
      await fetchJSON(`${API}/members`, { method: 'POST', body: JSON.stringify({
        member_code: document.getElementById('m_code').value,
        full_name: document.getElementById('m_name').value,
        email: document.getElementById('m_email').value,
        phone: document.getElementById('m_phone').value,
        member_type: document.getElementById('m_type').value,
        department: document.getElementById('m_dept').value,
      })});
      toast('Member added');
      closeModal();
      loadMembers();
    } catch (e) { toast(e.message, 'error'); }
  };
};

document.getElementById('newBorrowBtn').onclick = async () => {
  await ensureCatalogCache();
  const availableCopies = cache.books.flatMap(b => b.copies.filter(c => c.status === 'available').map(c => ({ ...c, bookTitle: b.title })));

  if (!cache.members.length || !availableCopies.length) {
    openModal('New Borrow', '<div class="empty-state">No members or available copies are available right now.</div>', '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
    return;
  }

  openModal('New Borrow', `
    <div class="form-group"><label>Member</label><select id="b_member">${selectOptions(cache.members, 'full_name')}</select></div>
    <div class="form-group"><label>Book Copy</label><select id="b_copy">${availableCopies.map(c => `<option value="${c.id}">${c.bookTitle} — ${c.copy_code}</option>`).join('')}</select></div>
    <div class="form-group"><label>Days</label><input id="b_days" type="number" value="14" min="1" max="90"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="saveBorrowBtn">Borrow</button>`);

  document.getElementById('saveBorrowBtn').onclick = async () => {
    const memberId = Number(document.getElementById('b_member').value);
    const copyId = Number(document.getElementById('b_copy').value);
    const days = Number(document.getElementById('b_days').value);

    if (!memberId || !copyId || !Number.isFinite(days) || days < 1 || days > 90) {
      toast('Please choose a member, a valid copy, and a valid loan period.', 'error');
      return;
    }

    try {
        const res = await fetchJSON(`${API}/borrowings`, { method: 'POST', body: JSON.stringify({
          member_id: memberId,
          copy_id: copyId,
          days,
        })});
        toast('Book borrowed');
        closeModal();
        loadBorrowings();
        openReceiptPreview(res.id, 'BORROW');
    } catch (e) { toast(e.message, 'error'); }
  };
};

document.getElementById('newReservationBtn').onclick = async () => {
  await ensureCatalogCache();

  if (!cache.members.length || !cache.books.length) {
    openModal('New Reservation', '<div class="empty-state">No members or books are available to reserve right now.</div>', '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
    return;
  }

  openModal('New Reservation', `
    <div class="form-group"><label>Member</label><select id="r_member">${selectOptions(cache.members, 'full_name')}</select></div>
    <div class="form-group"><label>Book</label><select id="r_book">${selectOptions(cache.books, 'title')}</select></div>
    <div class="form-group"><label>Hold Days</label><input id="r_days" type="number" value="7" min="1"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="saveResBtn">Reserve</button>`);

  document.getElementById('saveResBtn').onclick = async () => {
    const memberId = Number(document.getElementById('r_member').value);
    const bookId = Number(document.getElementById('r_book').value);
    const days = Number(document.getElementById('r_days').value);

    if (!memberId || !bookId || !Number.isFinite(days) || days < 1 || days > 30) {
      toast('Please choose a member, a valid book, and a valid reservation period.', 'error');
      return;
    }

    try {
      await fetchJSON(`${API}/reservations`, { method: 'POST', body: JSON.stringify({
        member_id: memberId,
        book_id: bookId,
        days,
      })});
      toast('Reservation created');
      closeModal();
      loadReservations();
    } catch (e) { toast(e.message, 'error'); }
  };
};

document.getElementById('addCategoryBtn').onclick = () => {
  openModal('Add Category', `
    <div class="form-group"><label>Name (English)</label><input id="c_name"></div>
    <div class="form-group"><label>Name (Khmer)</label><input id="c_name_km"></div>
    <div class="form-group"><label>Description</label><textarea id="c_desc"></textarea></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="saveCatBtn">Save</button>`);

  document.getElementById('saveCatBtn').onclick = async () => {
    try {
      await fetchJSON(`${API}/categories`, { method: 'POST', body: JSON.stringify({
        name: document.getElementById('c_name').value,
        name_km: document.getElementById('c_name_km').value,
        description: document.getElementById('c_desc').value,
      })});
      toast('Category added');
      closeModal();
      loadCategories();
      cache.categories = [];
    } catch (e) { toast(e.message, 'error'); }
  };
};

document.getElementById('addAuthorBtn').onclick = () => {
  openModal('Add Author', `
    <div class="form-group"><label>Name</label><input id="a_name"></div>
    <div class="form-group"><label>Nationality</label><input id="a_nat"></div>
    <div class="form-group"><label>Bio</label><textarea id="a_bio"></textarea></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="saveAuthBtn">Save</button>`);

  document.getElementById('saveAuthBtn').onclick = async () => {
    try {
      await fetchJSON(`${API}/authors`, { method: 'POST', body: JSON.stringify({
        name: document.getElementById('a_name').value,
        nationality: document.getElementById('a_nat').value,
        bio: document.getElementById('a_bio').value,
      })});
      toast('Author added');
      closeModal();
      loadAuthorsPage();
    } catch (e) { toast(e.message, 'error'); }
  };
};

document.getElementById('addPublisherBtn').onclick = () => {
  openModal('Add Publisher', `
    <div class="form-group"><label>Name</label><input id="p_name"></div>
    <div class="form-row">
      <div class="form-group"><label>Email</label><input id="p_email"></div>
      <div class="form-group"><label>Phone</label><input id="p_phone"></div>
    </div>
    <div class="form-group"><label>Address</label><input id="p_addr"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="savePubBtn">Save</button>`);

  document.getElementById('savePubBtn').onclick = async () => {
    try {
      await fetchJSON(`${API}/publishers`, { method: 'POST', body: JSON.stringify({
        name: document.getElementById('p_name').value,
        email: document.getElementById('p_email').value,
        phone: document.getElementById('p_phone').value,
        address: document.getElementById('p_addr').value,
      })});
      toast('Publisher added');
      closeModal();
      loadAuthorsPage();
    } catch (e) { toast(e.message, 'error'); }
  };
};

document.getElementById('processOverdueBtn').onclick = async () => {
  try {
    const r = await fetchJSON(`${API}/system/process-overdue`, { method: 'POST' });
    toast(`Processed ${r.processed} overdue items`);
    loadBorrowings();
    loadFines();
  } catch (e) { toast(e.message, 'error'); }
};

document.getElementById('bookSearch')?.addEventListener('input', debounce(loadBooks, 250));
document.getElementById('bookSearchField')?.addEventListener('change', loadBooks);
document.getElementById('bookCategoryFilter')?.addEventListener('change', loadBooks);
document.getElementById('bookStatusFilter')?.addEventListener('change', loadBooks);
document.getElementById('memberSearch')?.addEventListener('input', debounce(loadMembers, 300));
document.getElementById('borrowFilter')?.addEventListener('change', loadBorrowings);

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

async function initCategoryFilter() {
  cache.categories = await fetchJSON(`${API}/categories`);
  const sel = document.getElementById('bookCategoryFilter');
  if (sel) {
    sel.innerHTML = '<option value="">📂 គ្រប់ប្រភេទ (All Categories)</option>' +
      cache.categories.map(c => `<option value="${c.id}">${c.name_km || c.name}</option>`).join('');
  }
}

initTheme();
initCategoryFilter();
applyAdminLanguage();
navigate('dashboard');

// Initial check for early return counts
fetchJSON(`${API}/early-returns?filter_type=active`).then(items => {
  const badge = document.getElementById('navEarlyReturnBadge');
  if (badge && items) {
    badge.textContent = items.length;
    badge.style.display = items.length > 0 ? 'inline-block' : 'none';
  }
}).catch(() => {});

// Global Window Exports
window.loadBooks = loadBooks;
window.filterBooksByStatus = filterBooksByStatus;
window.resetBookFilters = resetBookFilters;
window.viewCopies = viewCopies;
window.saveCopyChanges = saveCopyChanges;

window.loadReports = loadReports;
window.selectReportPreset = selectReportPreset;
window.applyCustomReportDateRange = applyCustomReportDateRange;
window.exportReportsCSV = exportReportsCSV;
window.printOfficialReport = printOfficialReport;
window.filterReportTable = filterReportTable;

window.loadEarlyReturns = loadEarlyReturns;
window.filterEarlyReturnsTable = filterEarlyReturnsTable;
window.confirmEarlyReturnAction = confirmEarlyReturnAction;

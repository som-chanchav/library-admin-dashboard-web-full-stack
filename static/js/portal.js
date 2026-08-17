// BELTEI Library - Member Portal Interactive & Multi-View Engine
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

let allBooks = [];
let displayedBooks = [];
let currentTab = 'dashboard';
let activeCategory = 'All';
let browseCategory = 'All';
let browseSearchQuery = '';
let browseAvailFilter = 'all';
let currentLang = localStorage.getItem('portal_lang') || 'en';
let memberData = null;

// Complete bilingual translations dictionary
const TRANSLATIONS = {
  en: {
    member_portal: 'Member Portal',
    search_placeholder: 'Search books by title, author, ISBN, or subject...',
    search_btn: 'Search',
    sign_out: 'Sign Out',
    nav_dashboard: 'Dashboard',
    nav_browse: 'Browse Books',
    nav_my_library: 'My Library',
    nav_my_loans: 'My Loans',
    nav_requests: 'Borrow Requests',
    nav_reservations: 'Reservations',
    nav_history: 'History',
    nav_fines: 'Fines & Payments',
    nav_notifications: 'Notifications',
    nav_profile: 'Profile',
    nav_faq: 'Help & FAQ',
    nav_contact: 'Contact Library',
    library_info: 'Library Information',
    opening_hours: 'Opening Hours',
    hours_weekday: 'Mon - Fri: 7:30 AM - 8:00 PM',
    hours_weekend: 'Sat - Sun: 8:00 AM - 5:00 PM',
    promo_title: 'Read more,<br>Learn more.',
    promo_sub: 'Books are your best friends.',
    welcome_prefix: 'Welcome back,',
    welcome_sub: 'Discover, borrow and manage books from BELTEI Library.',
    kpi_my_books: 'My Books',
    kpi_borrowed: 'Borrowed',
    kpi_due_soon: 'Due Soon',
    kpi_reserved: 'Reserved',
    link_view_all_books: 'View all books →',
    link_view_my_loans: 'View my loans →',
    link_view_due_books: 'View due books →',
    link_view_reservations: 'View reservations →',
    title_current_loans: 'My Current Loans',
    title_due_soon: 'Due Soon',
    link_view_all: 'View All →',
    loan_borrowed_prefix: 'Borrowed:',
    loan_due_prefix: 'Due:',
    loan_8days_remaining: '8 days remaining',
    loan_2days_remaining: '2 days remaining',
    btn_view_book: 'View Book',
    title_browse_categories: 'Browse by Category',
    link_view_all_categories: 'View All Categories →',
    cat_all: 'All',
    cat_cs: 'Computer Science',
    cat_programming: 'Programming',
    cat_database: 'Database',
    cat_business: 'Business',
    cat_engineering: 'Engineering',
    cat_ai: 'Artificial Intelligence',
    cat_literature: 'Literature',
    cat_science: 'Science',
    cat_more: 'More',
    title_recommended: 'Recommended for You',
    status_available: 'Available',
    status_out_of_stock: 'Out of Stock',
    btn_view_details: 'View Details',
    btn_choose_book: 'Choose Book',
    footer_copyright: '© 2026 BELTEI Library Management System. All rights reserved.',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Service',
    borrow_duration: 'Borrow duration:',
    btn_request_book: 'Request Book',
    author_prefix: 'Author:',
    browse_title: 'Browse All Books',
    browse_subtext: 'Search, filter by category, and choose books to borrow.',
    btn_back_dashboard: 'Back to Dashboard',
    filter_all_status: 'All Status',
    filter_available_only: 'Available Only',
    showing_prefix: 'Showing',
    books_suffix: 'books',
    loans_subtext: 'Track your borrowed books and return due dates.',
    reservations_subtext: 'Books you have placed on hold.',
    fines_subtext: 'Review fine balances, make instant payments (KHQR/Bakong/Card), and view receipts.',
    fines_unpaid_label: 'Total Outstanding Balance',
    fines_paid_label: 'Total Settled Fines',
    fines_status_label: 'Borrowing Privileges',
    fines_unpaid_title: 'Outstanding Invoices (Unpaid Fines)',
    fines_history_title: 'Payment History & Receipts',
    btn_pay_fine: 'Pay Fine (KHQR)',
    btn_view_receipt: 'View Receipt',
    btn_pay_all: 'Pay All Balance',
    notifs_subtext: 'Important due date reminders, loan alerts, and library announcements.',
    btn_mark_all_read: 'Mark All as Read',
    no_loans: 'No active book borrowings.',
    no_reservations: 'No reserved books.',
    no_history: 'No past return history.',
    status_active: 'Active Loan',
    status_overdue: 'Overdue',
    status_pending: 'Pending Hold',
    status_returned: 'Returned',
    status_ready: 'Ready for Pickup',
    days_remaining_suffix: 'days remaining',
    returned_on: 'Returned on:'
  },
  km: {
    member_portal: 'បណ្ណាល័យនិស្សិត',
    search_placeholder: 'ស្វែងរកសៀវភៅតាមចំណងជើង, អ្នកនិពន្ធ, ISBN ឬមុខវិជ្ជា...',
    search_btn: 'ស្វែងរក',
    sign_out: 'ចាកចេញ',
    nav_dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    nav_browse: 'រកមើលសៀវភៅ',
    nav_my_library: 'បណ្ណាល័យខ្ញុំ',
    nav_my_loans: 'សៀវភៅកំពុងខ្ចី',
    nav_requests: 'សំណើខ្ចីសៀវភៅ',
    nav_reservations: 'ការកក់ទុក',
    nav_history: 'ប្រវត្តិខ្ចី-សង',
    nav_fines: 'ការពិន័យ & បង់ប្រាក់',
    nav_notifications: 'ការជូនដំណឹង',
    nav_profile: 'ព័ត៌មានផ្ទាល់ខ្លួន',
    nav_faq: 'ជំនួយ & សំណួរញឹកញាប់',
    nav_contact: 'ទាក់ទងបណ្ណាល័យ',
    library_info: 'ព័ត៌មានបណ្ណាល័យ',
    opening_hours: 'ម៉ោងបើកបម្រើ',
    hours_weekday: 'ច័ន្ទ - សុក្រ: 7:30 ព្រឹក - 8:00 យប់',
    hours_weekend: 'សៅរ៍ - អាទិត្យ: 8:00 ព្រឹក - 5:00 ល្ងាច',
    promo_title: 'អានកាន់តែច្រើន,<br>ចេះកាន់តែច្រើន។',
    promo_sub: 'សៀវភៅជាមិត្តដ៏ល្អបំផុតរបស់អ្នក។',
    welcome_prefix: 'សូមស្វាគមន៍មកវិញ,',
    welcome_sub: 'ស្វែងរក ខ្ចី និងគ្រប់គ្រងសៀវភៅពីបណ្ណាល័យ BELTEI។',
    kpi_my_books: 'សៀវភៅខ្ញុំ',
    kpi_borrowed: 'កំពុងខ្ចី',
    kpi_due_soon: 'ជិតដល់ថ្ងៃសង',
    kpi_reserved: 'បានកក់ទុក',
    link_view_all_books: 'មើលសៀវភៅទាំងអស់ →',
    link_view_my_loans: 'មើលសៀវភៅកំពុងខ្ចី →',
    link_view_due_books: 'មើលសៀវភៅជិតដល់ថ្ងៃ →',
    link_view_reservations: 'មើលការកក់ទុក →',
    title_current_loans: 'សៀវភៅខ្ញុំកំពុងខ្ចី',
    title_due_soon: 'ជិតដល់ថ្ងៃសង',
    link_view_all: 'មើលទាំងអស់ →',
    loan_borrowed_prefix: 'បានខ្ចី៖',
    loan_due_prefix: 'ថ្ងៃសង៖',
    loan_8days_remaining: '៨ ថ្ងៃទៀតដល់កំណត់',
    loan_2days_remaining: '២ ថ្ងៃទៀតដល់កំណត់',
    btn_view_book: 'មើលសៀវភៅ',
    title_browse_categories: 'រុករកតាមប្រភេទសៀវភៅ',
    link_view_all_categories: 'មើលប្រភេទទាំងអស់ →',
    cat_all: 'ទាំងអស់',
    cat_cs: 'វិទ្យាសាស្ត្រកុំព្យូទ័រ',
    cat_programming: 'ការសរសេរកូដ',
    cat_database: 'មូលដ្ឋានទិន្នន័យ',
    cat_business: 'ធុរកិច្ច & ពាណិជ្ជកម្ម',
    cat_engineering: 'វិស្វកម្ម',
    cat_ai: 'បញ្ញាសិប្បនិម្មិត (AI)',
    cat_literature: 'អក្សរសាស្ត្រ',
    cat_science: 'វិទ្យាសាស្ត្រ',
    cat_more: 'ផ្សេងៗ',
    title_recommended: 'សៀវភៅណែនាំសម្រាប់អ្នក',
    status_available: 'មានក្នុងស្តុក',
    status_out_of_stock: 'អស់ពីស្តុក',
    btn_view_details: 'មើលព័ត៌មានលម្អិត',
    btn_choose_book: 'ជ្រើសរើសសៀវភៅ',
    footer_copyright: '© ២០២៦ ប្រព័ន្ធគ្រប់គ្រងបណ្ណាល័យប៊ែលធី។ រក្សាសិទ្ធិគ្រប់យ៉ាង។',
    footer_privacy: 'គោលការណ៍ឯកជនភាព',
    footer_terms: 'លក្ខខណ្ឌប្រើប្រាស់',
    borrow_duration: 'រយៈពេលខ្ចីសៀវភៅ៖',
    btn_request_book: 'ផ្ញើសំណើខ្ចីសៀវភៅ',
    author_prefix: 'អ្នកនិពន្ធ៖',
    browse_title: 'រកមើលសៀវភៅទាំងអស់ (Catalog)',
    browse_subtext: 'ស្វែងរក ជ្រើសរើសតាមមុខវិជ្ជា និងចុចជ្រើសរើសដើម្បីស្នើសុំខ្ចី។',
    btn_back_dashboard: 'ត្រឡប់ទៅផ្ទាំងដើម',
    filter_all_status: 'ស្ថានភាពទាំងអស់',
    filter_available_only: 'មានក្នុងស្តុកតែប៉ុណ្ណោះ',
    showing_prefix: 'បង្ហាញចំនួន',
    books_suffix: 'ក្បាល',
    loans_subtext: 'តាមដានសៀវភៅដែលអ្នកកំពុងខ្ចី និងកាលបរិច្ឆេទសង។',
    reservations_subtext: 'សៀវភៅដែលអ្នកបានកក់ទុកជាមុន។',
    fines_subtext: 'ពិនិត្យមើលទឹកប្រាក់ពិន័យ បង់ប្រាក់ភ្លាមៗតាម KHQR/Bakong និងមើលបង្កាន់ដៃទទួលប្រាក់។',
    fines_unpaid_label: 'ទឹកប្រាក់ដែលត្រូវទូទាត់',
    fines_paid_label: 'ទឹកប្រាក់ដែលបានបង់រួច',
    fines_status_label: 'សិទ្ធិខ្ចីសៀវភៅ',
    fines_unpaid_title: 'វិក្កយបត្រដែលត្រូវទូទាត់',
    fines_history_title: 'ប្រវត្តិបង់ប្រាក់ & បង្កាន់ដៃ',
    btn_pay_fine: 'បង់ប្រាក់ពិន័យ (KHQR)',
    btn_view_receipt: 'មើលបង្កាន់ដៃ',
    btn_pay_all: 'បង់ទាំងអស់',
    notifs_subtext: 'ការរំលឹកកាលបរិច្ឆេទសងសៀវភៅ ការជូនដំណឹង និងសេចក្តីប្រកាសបណ្ណាល័យ។',
    btn_mark_all_read: 'កត់សម្គាល់ថាបានអានទាំងអស់',
    no_loans: 'មិនមានសៀវភៅកំពុងខ្ចីនៅឡើយទេ។',
    no_reservations: 'មិនមានសៀវភៅកក់ទុកឡើយ។',
    no_history: 'មិនមានប្រវត្តិខ្ចី-សងនៅឡើយទេ។',
    status_active: 'កំពុងខ្ចី',
    status_overdue: 'ហួសកំណត់',
    status_pending: 'កំពុងកក់ទុក',
    status_returned: 'បានសងរួចរាល់',
    status_ready: 'បានមកដល់ (អាចមកយក)',
    days_remaining_suffix: 'ថ្ងៃទៀតដល់កំណត់',
    returned_on: 'បានសងថ្ងៃទី៖'
  }
};

// High-fidelity SVG Topic Icons
const TOPIC_SVGS = {
  python: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-3H8v-2h3V8.5h2V11h3v2h-3v3.5h-2z"/><circle cx="9.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="14.5" cy="16.5" r="1.5" fill="currentColor"/></svg>`,
  algo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4m-4.5 3.5L10 13m4 0l2.5 2.5"/></svg>`,
  design: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
  ai: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 00-8 8c0 3.37 2.09 6.25 5.04 7.42.36.14.62.48.62.87V20a2 2 0 002 2h.68a2 2 0 002-2v-1.71c0-.39.26-.73.62-.87A8.003 8.003 0 0020 10a8 8 0 00-8-8z"/><path d="M9 10h6m-3-3v6"/></svg>`,
  pragmatic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  db: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  security: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  business: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  engineering: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  khmer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M9 7h6m-6 4h6"/></svg>`,
  science: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 11-4 0"/></svg>`
};

// Preset Covers with specific artwork and styling
const PRESET_COVERS = {
  'Python Crash Course': { class: 'cover-python', author: 'Eric Matthes', tag: 'Python / Code', icon: 'python' },
  'Introduction to Algorithms': { class: 'cover-algo', author: 'Thomas H. Cormen', tag: 'Algorithms', icon: 'algo' },
  'The Design of Everyday Things': { class: 'cover-design', author: 'Don Norman', tag: 'Design / UX', icon: 'design' },
  'Computer Networking: A Top-Down Approach': { class: 'cover-network', author: 'James F. Kurose', tag: 'Networking', icon: 'network' },
  'Artificial Intelligence: A Modern Approach': { class: 'cover-ai', author: 'Stuart Russell', tag: 'AI & ML', icon: 'ai' },
  'The Pragmatic Programmer': { class: 'cover-pragmatic', author: 'David Thomas', tag: 'Craftsmanship', icon: 'pragmatic' },
  'Database Systems: The Complete Book': { class: 'cover-db', author: 'Raghu Ramakrishnan', tag: 'Database', icon: 'db' },
  'Database Systems': { class: 'cover-db', author: 'Raghu Ramakrishnan', tag: 'Database', icon: 'db' },
  'Clean Code: A Handbook of Agile Software': { class: 'cover-code', author: 'Robert C. Martin', tag: 'Clean Code', icon: 'code' },
  'Clean Code': { class: 'cover-code', author: 'Robert C. Martin', tag: 'Clean Code', icon: 'code' },
  'Business Management & Strategy': { class: 'cover-business', author: 'Michael E. Porter', tag: 'Business', icon: 'business' },
  'Modern Engineering Mathematics': { class: 'cover-engineering', author: 'Glyn James', tag: 'Engineering', icon: 'engineering' },
  'World Literature Classics': { class: 'cover-khmer', author: 'Oxford Press', tag: 'Literature', icon: 'khmer' },
  'General Science & Physics': { class: 'cover-science', author: 'David Halliday', tag: 'Physics', icon: 'science' },
  'Cybersecurity & Network Defense': { class: 'cover-security', author: 'William Stallings', tag: 'Security', icon: 'security' },
  'Deep Learning with Python': { class: 'cover-ai', author: 'François Chollet', tag: 'Deep Learning', icon: 'ai' },
  'Operating System Concepts': { class: 'cover-network', author: 'Abraham Silberschatz', tag: 'Systems', icon: 'network' },
  'រឿងខ្មែរបុរាណ': { class: 'cover-khmer', author: 'Hem Chieu', tag: 'Khmer Classic', icon: 'khmer' },
  'Sapiens': { class: 'cover-khmer', author: 'Yuval Noah Harari', tag: 'History', icon: 'khmer' },
  '1984': { class: 'cover-security', author: 'George Orwell', tag: 'Literature', icon: 'security' },
  'រូបវិទ្យាមធ្យម': { class: 'cover-science', author: 'Hem Chieu', tag: 'Physics', icon: 'science' },
  'Python Programming': { class: 'cover-python', author: 'Robert C. Martin', tag: 'Python', icon: 'python' },
  'Khmer Grammar': { class: 'cover-khmer', author: 'Hem Chieu', tag: 'Khmer Language', icon: 'khmer' }
};

// Fallback curated books dataset
const DEFAULT_RECOMMENDED = [
  { id: 101, title: 'Python Crash Course', author: 'Eric Matthes', available: 4, total: 5, category: 'Programming', isbn: '978-1593279288', year: 2023, description: 'A hands-on, project-based introduction to programming with Python.' },
  { id: 102, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', available: 2, total: 4, category: 'Computer Science', isbn: '978-0262046305', year: 2022, description: 'Comprehensive textbook on modern algorithms and data structures.' },
  { id: 103, title: 'The Design of Everyday Things', author: 'Don Norman', available: 3, total: 3, category: 'Engineering', isbn: '978-0465050659', year: 2013, description: 'The ultimate guide to human-centered design and user experience.' },
  { id: 104, title: 'Computer Networking: A Top-Down Approach', author: 'James F. Kurose', available: 5, total: 6, category: 'Computer Science', isbn: '978-0136681557', year: 2021, description: 'A modern approach to computer networking architectures and protocols.' },
  { id: 105, title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', available: 1, total: 3, category: 'Artificial Intelligence', isbn: '978-0134610993', year: 2020, description: 'The most authoritative introduction to AI theory and practice.' },
  { id: 106, title: 'The Pragmatic Programmer', author: 'David Thomas', available: 4, total: 5, category: 'Programming', isbn: '978-0135957059', year: 2019, description: 'Your journey to mastery in software development and clean code craft.' },
  { id: 107, title: 'Database Systems: The Complete Book', author: 'Raghu Ramakrishnan', available: 3, total: 4, category: 'Database', isbn: '978-0131873254', year: 2020, description: 'Fundamental principles of relational and distributed database management.' },
  { id: 108, title: 'Clean Code: A Handbook of Agile Software', author: 'Robert C. Martin', available: 2, total: 5, category: 'Programming', isbn: '978-0132350884', year: 2021, description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.' },
  { id: 109, title: 'Business Management & Strategy', author: 'Michael E. Porter', available: 5, total: 5, category: 'Business', isbn: '978-0743260152', year: 2022, description: 'Competitive strategy techniques for analyzing industries and competitors.' },
  { id: 110, title: 'Modern Engineering Mathematics', author: 'Glyn James', available: 2, total: 3, category: 'Engineering', isbn: '978-1292080734', year: 2020, description: 'Foundational mathematics for computer and civil engineering students.' },
  { id: 111, title: 'Cybersecurity & Network Defense', author: 'William Stallings', available: 3, total: 4, category: 'Computer Science', isbn: '978-0134772806', year: 2023, description: 'Network security principles, cryptography protocols and threat prevention.' },
  { id: 112, title: 'Deep Learning with Python', author: 'François Chollet', available: 4, total: 5, category: 'Artificial Intelligence', isbn: '978-1617294433', year: 2021, description: 'Written by the creator of Keras, this book introduces deep learning using Python.' },
  { id: 113, title: 'World Literature Classics', author: 'Oxford Press', available: 6, total: 6, category: 'Literature', isbn: '978-0199535569', year: 2021, description: 'Curated anthology of world literary masterpieces and literary critique.' },
  { id: 114, title: 'General Science & Physics', author: 'David Halliday', available: 3, total: 4, category: 'Science', isbn: '978-1118230725', year: 2022, description: 'Principles of physics, optics, electromagnetism and modern sciences.' },
  { id: 115, title: 'Operating System Concepts', author: 'Abraham Silberschatz', available: 2, total: 4, category: 'Computer Science', isbn: '978-1119800361', year: 2022, description: 'The fundamental guide to operating systems architecture and concurrency.' }
];

const ALL_CATEGORIES = [
  'All', 'Computer Science', 'Programming', 'Database', 'Business', 'Engineering',
  'Artificial Intelligence', 'Literature', 'Science'
];

function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return dict[key] || key;
}

// Compute theme, icon and color based on title & category
function computeCoverTheme(book) {
  const title = (book.title || '').toLowerCase();
  const cat = (book.category || '').toLowerCase();

  if (PRESET_COVERS[book.title]) {
    return PRESET_COVERS[book.title];
  }

  if (title.includes('python')) return { class: 'cover-python', tag: 'Python', icon: 'python' };
  if (title.includes('database') || title.includes('sql') || cat.includes('database')) return { class: 'cover-db', tag: 'Database Systems', icon: 'db' };
  if (title.includes('algorithm') || title.includes('data structure')) return { class: 'cover-algo', tag: 'Algorithms & DS', icon: 'algo' };
  if (title.includes('security') || title.includes('cyber')) return { class: 'cover-security', tag: 'Cybersecurity', icon: 'security' };
  if (title.includes('machine learning') || title.includes('deep learning')) return { class: 'cover-ai', tag: 'Machine Learning', icon: 'ai' };
  if (title.includes('artificial') || title.includes('intelligence') || cat.includes('intelligence') || title.includes('neural')) return { class: 'cover-ai', tag: 'Artificial Intelligence', icon: 'ai' };
  if (title.includes('network') || title.includes('cloud') || title.includes('distributed')) return { class: 'cover-network', tag: 'Networks & Cloud', icon: 'network' };
  if (title.includes('code') || title.includes('programming') || title.includes('software') || cat.includes('programming')) return { class: 'cover-code', tag: 'Software & Code', icon: 'code' };
  if (title.includes('finance') || title.includes('business') || title.includes('management') || title.includes('strategy') || cat.includes('business') || cat.includes('finance')) return { class: 'cover-business', tag: 'Business & Finance', icon: 'business' };
  if (title.includes('signal') || title.includes('statistics') || title.includes('engineer') || title.includes('math') || cat.includes('engineering')) return { class: 'cover-engineering', tag: 'Engineering & Math', icon: 'engineering' };
  if (title.includes('biology') || title.includes('physics') || title.includes('science') || cat.includes('science')) return { class: 'cover-science', tag: 'Science & Biology', icon: 'science' };
  if (title.includes('khmer') || title.includes('history') || title.includes('literature') || cat.includes('literature') || cat.includes('history')) return { class: 'cover-khmer', tag: 'Literature & History', icon: 'khmer' };

  const palettes = [
    { class: 'cover-python', tag: book.category || 'Programming', icon: 'python' },
    { class: 'cover-algo', tag: book.category || 'Computer Science', icon: 'algo' },
    { class: 'cover-db', tag: book.category || 'Database', icon: 'db' },
    { class: 'cover-network', tag: book.category || 'Technology', icon: 'network' },
    { class: 'cover-ai', tag: book.category || 'Artificial Intelligence', icon: 'ai' },
    { class: 'cover-code', tag: book.category || 'Software Dev', icon: 'code' },
    { class: 'cover-security', tag: book.category || 'Security', icon: 'security' },
    { class: 'cover-business', tag: book.category || 'Business', icon: 'business' },
    { class: 'cover-engineering', tag: book.category || 'Engineering', icon: 'engineering' },
    { class: 'cover-science', tag: book.category || 'Science', icon: 'science' }
  ];

  const idx = Math.abs(Number(book.id) || 0) % palettes.length;
  return palettes[idx];
}

// Generate Realistic Book Cover HTML
function getCoverHTML(b) {
  const theme = computeCoverTheme(b);
  const iconSVG = TOPIC_SVGS[theme.icon] || TOPIC_SVGS.code;
  const authorName = b.author || theme.author || 'BELTEI';

  if (b.cover_image && !b.cover_image.includes('openlibrary.org')) {
    return `
      <div class="rec-book-cover ${theme.class}" style="position:relative;">
        <img src="${esc(b.cover_image)}" alt="${esc(b.title)}" 
             style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:inherit; z-index:1;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
             onload="if(this.naturalWidth<=1){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
        <div class="fallback-cover-inner" style="display:none; position:absolute; inset:0; flex-direction:column; justify-content:space-between; padding:14px 12px; z-index:2;">
          <span class="cover-topic-tag">${esc(theme.tag || b.category || 'Collection')}</span>
          <div class="cover-art-illustration">${iconSVG}</div>
          <div>
            <h5 class="rec-cover-title">${esc(b.title)}</h5>
            <p class="rec-cover-author">${esc(authorName)}</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="rec-book-cover ${theme.class}">
      <span class="cover-topic-tag">${esc(theme.tag || b.category || 'Collection')}</span>
      
      <div class="cover-art-illustration">
        ${iconSVG}
      </div>

      <div>
        <h5 class="rec-cover-title">${esc(b.title)}</h5>
        <p class="rec-cover-author">${esc(authorName)}</p>
      </div>
    </div>
  `;
}

// Set Language Function
window.setLanguage = lang => {
  currentLang = lang;
  localStorage.setItem('portal_lang', lang);

  const label = $('#currentLangLabel');
  const flag = $('#langCurrentFlag');
  if (label && flag) {
    if (lang === 'km') {
      label.textContent = 'ភាសាខ្មែរ';
      flag.textContent = '🇰🇭';
    } else {
      label.textContent = 'English';
      flag.textContent = '🇬🇧';
    }
  }

  $$('.lang-option-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const dropdown = $('#langSwitchDropdown');
  if (dropdown) dropdown.classList.remove('open');

  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.innerHTML = dict[key];
  });

  const searchInput = $('#portalSearchInput');
  if (searchInput && dict.search_placeholder) {
    searchInput.placeholder = dict.search_placeholder;
  }

  renderRecommendedBooks();
  renderBrowseCategoryChips();
  renderBrowseBooks();
  renderLoansList();
  renderRequestsList();
  renderReservationsList();
  renderHistoryList();
  renderFinesView();
  renderNotificationsList();
};

// Switch Views / Tabs
window.navigateTo = tabName => {
  currentTab = tabName;
  
  $$('.side-nav-item, .sub-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });

  $$('.portal-tab-view').forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active');
  });

  let targetViewId = 'viewDashboard';
  if (tabName === 'browse') targetViewId = 'viewBrowse';
  else if (tabName === 'loans') targetViewId = 'viewLoans';
  else if (tabName === 'requests') targetViewId = 'viewRequests';
  else if (tabName === 'reservations') targetViewId = 'viewReservations';
  else if (tabName === 'history') targetViewId = 'viewHistory';
  else if (tabName === 'fines') targetViewId = 'viewFines';
  else if (tabName === 'notifications') targetViewId = 'viewNotifications';
  else if (tabName === 'profile') targetViewId = 'viewProfile';
  else if (tabName === 'faq') targetViewId = 'viewFaq';
  else if (tabName === 'contact') targetViewId = 'viewContact';

  const targetView = $('#' + targetViewId);
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabName === 'browse') {
    renderBrowseCategoryChips();
    renderBrowseBooks();
    const bSearch = $('#browseSearchInput');
    if (bSearch) bSearch.focus();
  } else if (tabName === 'loans') {
    renderLoansList();
    fetchJSON('/portal/api/me').then(d => { memberData = d; renderLoansList(); }).catch(() => {});
  } else if (tabName === 'requests') {
    renderRequestsList();
    fetchJSON('/portal/api/me').then(d => { memberData = d; renderRequestsList(); }).catch(() => {});
  } else if (tabName === 'reservations') {
    renderReservationsList();
  } else if (tabName === 'history') {
    renderHistoryList();
  } else if (tabName === 'fines') {
    renderFinesView();
  } else if (tabName === 'notifications') {
    renderNotificationsList();
  }
};

// Render Dashboard Recommended Books
function renderRecommendedBooks() {
  const container = $('#recommendedBooksGrid');
  if (!container) return;

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const booksToRender = displayedBooks.length ? displayedBooks : DEFAULT_RECOMMENDED;

  container.innerHTML = booksToRender.slice(0, 6).map(b => {
    const isAvail = (b.available ?? 1) > 0;
    return `
      <article class="rec-book-card" onclick="openBookModal(${b.id})">
        ${getCoverHTML(b)}
        <div class="rec-book-meta">
          <h4 class="rec-book-title" title="${esc(b.title)}">${esc(b.title)}</h4>
          <span class="rec-book-author">${esc(b.author || 'Unknown Author')}</span>
          <div class="rec-avail-tag">
            <span class="rec-avail-dot" style="background-color:${isAvail ? 'var(--emerald)' : 'var(--amber)'};"></span>
            <span>${isAvail ? dict.status_available : dict.status_out_of_stock}</span>
          </div>
        </div>
        <button class="btn-view-details">${dict.btn_choose_book || dict.btn_view_details}</button>
      </article>
    `;
  }).join('');
}

// Render Quick Category Filter Chips in Browse View
function renderBrowseCategoryChips() {
  const container = $('#browseCategoryChips');
  if (!container) return;

  container.innerHTML = ALL_CATEGORIES.map(cat => {
    const isActive = browseCategory === cat;
    const catI18nKey = cat === 'All' ? 'cat_all' : 
                      cat === 'Computer Science' ? 'cat_cs' :
                      cat === 'Programming' ? 'cat_programming' :
                      cat === 'Database' ? 'cat_database' :
                      cat === 'Business' ? 'cat_business' :
                      cat === 'Engineering' ? 'cat_engineering' :
                      cat === 'Artificial Intelligence' ? 'cat_ai' :
                      cat === 'Literature' ? 'cat_literature' :
                      cat === 'Science' ? 'cat_science' : 'cat_more';

    const label = t(catI18nKey) || cat;
    return `
      <button class="browse-chip-btn ${isActive ? 'active' : ''}" onclick="onBrowseCategoryChipClick('${cat}')">
        ${esc(label)}
      </button>
    `;
  }).join('');
}

window.onBrowseCategoryChipClick = cat => {
  browseCategory = cat;
  const select = $('#browseCategorySelect');
  if (select) select.value = cat;
  renderBrowseCategoryChips();
  renderBrowseBooks();
};

window.onBrowseCategoryChange = cat => {
  browseCategory = cat;
  renderBrowseCategoryChips();
  renderBrowseBooks();
};

window.onBrowseAvailChange = val => {
  browseAvailFilter = val;
  renderBrowseBooks();
};

// Render Browse Books Catalog Grid
function renderBrowseBooks() {
  const container = $('#browseBooksGrid');
  if (!container) return;

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let books = allBooks.length ? allBooks : DEFAULT_RECOMMENDED;

  // Filter by category
  if (browseCategory && browseCategory !== 'All') {
    books = books.filter(b => (b.category || '').toLowerCase().includes(browseCategory.toLowerCase()) || (b.title || '').toLowerCase().includes(browseCategory.toLowerCase()));
  }

  // Filter by availability
  if (browseAvailFilter === 'available') {
    books = books.filter(b => (b.available ?? 1) > 0);
  }

  // Filter by live search query
  if (browseSearchQuery) {
    const q = browseSearchQuery.toLowerCase();
    books = books.filter(b => 
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.isbn || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q)
    );
  }

  // Update badge count
  const countBadge = $('#browseCountBadge');
  if (countBadge) {
    countBadge.textContent = `${dict.showing_prefix} ${books.length} ${dict.books_suffix}`;
  }

  if (!books.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--border-subtle);">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:44px; height:44px; color:#64748b; margin-bottom:8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"/></svg>
        <h4 style="color:white; font-size:1.1rem; margin-bottom:4px;">No books match your criteria</h4>
        <p style="color:var(--text-muted); font-size:0.85rem;">Try clearing search keyword or choosing "All Categories".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = books.map(b => {
    const isAvail = (b.available ?? 1) > 0;
    return `
      <article class="rec-book-card" onclick="openBookModal(${b.id})">
        ${getCoverHTML(b)}
        <div class="rec-book-meta">
          <span style="font-size:0.7rem; font-weight:700; color:#60a5fa; text-transform:uppercase;">${esc(b.category || 'General')}</span>
          <h4 class="rec-book-title" title="${esc(b.title)}">${esc(b.title)}</h4>
          <span class="rec-book-author">${esc(b.author || 'Unknown')}</span>
          <div class="rec-avail-tag" style="margin-top:auto;">
            <span class="rec-avail-dot" style="background-color:${isAvail ? 'var(--emerald)' : 'var(--amber)'};"></span>
            <span>${isAvail ? `${b.available ?? 1} in stock` : dict.status_out_of_stock}</span>
          </div>
        </div>
        <button class="btn-view-details" style="background:var(--primary-blue); border-color:var(--primary-blue);">${dict.btn_choose_book || 'Choose Book'}</button>
      </article>
    `;
  }).join('');
}

// Live Search Input in Browse Page
const browseSearchInput = $('#browseSearchInput');
if (browseSearchInput) {
  browseSearchInput.oninput = e => {
    browseSearchQuery = e.target.value.trim();
    renderBrowseBooks();
  };
}

// Filter Dashboard Category Cards
window.filterCategory = categoryName => {
  activeCategory = categoryName;
  $$('.cat-card').forEach(card => {
    card.classList.toggle('active', card.dataset.cat === categoryName);
  });

  if (categoryName === 'All') {
    displayedBooks = [...allBooks];
  } else {
    displayedBooks = allBooks.filter(b => 
      (b.category || '').toLowerCase().includes(categoryName.toLowerCase()) ||
      (b.title || '').toLowerCase().includes(categoryName.toLowerCase())
    );
    if (!displayedBooks.length) {
      displayedBooks = DEFAULT_RECOMMENDED.filter(b => 
        (b.category || '').toLowerCase().includes(categoryName.toLowerCase())
      );
    }
  }

  renderRecommendedBooks();
};

// Open Book Modal Dialog
// Calculate return due date helper
window.updateBorrowReturnDate = () => {
  const dateInput = $('#borrowStartDateInput');
  const daysSelect = $('#borrowDaysSelect');
  const preview = $('#borrowCalculatedDueDate');
  if (!dateInput || !daysSelect || !preview) return;

  const startDateVal = dateInput.value ? new Date(dateInput.value) : new Date();
  const days = parseInt(daysSelect.value, 10) || 14;
  
  const returnDate = new Date(startDateVal);
  returnDate.setDate(returnDate.getDate() + days);

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDate = returnDate.toLocaleDateString(currentLang === 'km' ? 'km-KH' : 'en-US', options);

  preview.textContent = formattedDate;
};

// STEP 1: Open Book Details Modal (View full book overview first)
window.openBookModal = id => {
  let book = allBooks.find(b => b.id === id) || DEFAULT_RECOMMENDED.find(b => b.id === id);
  if (!book) return;

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isAvail = (book.available ?? 1) > 0;
  const modalSlot = $('#dialogContent');

  modalSlot.innerHTML = `
    <div>
      <div style="display:flex; gap:24px; flex-wrap:wrap;">
        <div style="width:145px; flex-shrink:0;">
          ${getCoverHTML(book)}
        </div>
        <div style="flex:1; min-width:260px;">
          <span style="font-size:0.75rem; font-weight:700; color:#60a5fa; text-transform:uppercase; letter-spacing:0.05em;">
            ${esc(book.category || 'General Collection')}
          </span>
          <h2 style="font-size:1.4rem; font-weight:800; color:#ffffff; margin:4px 0 8px;">${esc(book.title)}</h2>
          <p style="font-size:0.86rem; color:#94a3b8; margin-bottom:12px;">${dict.author_prefix} <strong style="color:#ffffff;">${esc(book.author || 'Unknown')}</strong></p>
          
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px;">
            <span style="background:rgba(255,255,255,0.06); padding:4px 10px; border-radius:6px; font-size:0.76rem; color:#cbd5e1;">ISBN: <strong>${esc(book.isbn || '—')}</strong></span>
            <span style="background:rgba(255,255,255,0.06); padding:4px 10px; border-radius:6px; font-size:0.76rem; color:#cbd5e1;">Year: <strong>${esc(book.year || book.publication_year || '2026')}</strong></span>
            <span style="background:${isAvail ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)'}; color:${isAvail ? '#34d399' : '#fbbf24'}; padding:4px 10px; border-radius:6px; font-size:0.76rem; font-weight:700;">
              ${isAvail ? `● Available in Stock (${book.available ?? 1} copies)` : '● Out of Stock (Reserve)'}
            </span>
          </div>

          <p style="font-size:0.88rem; color:#94a3b8; line-height:1.55; margin-bottom:20px; background:rgba(255,255,255,0.03); padding:12px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
            ${esc(book.description || 'A fundamental reference title available in the BELTEI International University collection for academic research and personal study.')}
          </p>

          <!-- Action Button to Step 2: Open Application Form or Login Prompt -->
          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <button onclick="handleBorrowBookClick(${book.id})" style="flex:1; min-width:200px; background:#2563eb; color:white; border:0; padding:12px 22px; border-radius:8px; font-weight:700; font-size:0.92rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(37,99,235,0.4); transition:all 0.2s;">
              <span>📨</span> <span>${currentLang === 'km' ? 'ផ្ញើសំណើខ្ចីសៀវភៅ' : 'Request Book to Borrow'}</span>
            </button>
            <button onclick="bookDialog.close()" style="background:transparent; color:#94a3b8; border:1px solid rgba(255,255,255,0.15); padding:12px 18px; border-radius:8px; font-size:0.85rem; cursor:pointer;">
              ${currentLang === 'km' ? 'បិទ' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const dialog = $('#bookDialog');
  if (dialog && !dialog.open) {
    dialog.showModal();
  }
};

// Handle Borrow Book click with authentication gate
window.handleBorrowBookClick = (bookId) => {
  const book = allBooks.find(b => b.id === bookId) || DEFAULT_RECOMMENDED.find(b => b.id === bookId);
  if (!book) return;

  // If user is not logged in, prompt to login first!
  if (!window.isMemberLoggedIn) {
    showLoginRequiredModal(book);
    return;
  }

  // If user is already logged in, proceed directly to Step 2 Application Form
  openBorrowApplicationForm(bookId);
};

// Show friendly Login Required prompt
window.showLoginRequiredModal = (book) => {
  const modalSlot = $('#dialogContent');
  if (!modalSlot) return;

  modalSlot.innerHTML = `
    <div style="text-align:center; padding:24px 16px;">
      <div style="width:70px; height:70px; background:rgba(37,99,235,0.15); border:1px solid rgba(59,130,246,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 16px; box-shadow:0 0 20px rgba(37,99,235,0.2);">
        🔑
      </div>

      <h3 style="font-size:1.35rem; font-weight:800; color:#ffffff; margin-bottom:8px;">
        ${currentLang === 'km' ? 'សូមចូលគណនីជាមុនសិន' : 'Sign In to Borrow Books'}
      </h3>

      <p style="font-size:0.9rem; color:#94a3b8; max-width:420px; margin:0 auto 20px; line-height:1.55;">
        ${currentLang === 'km' 
          ? `ដើម្បីអាចស្នើសុំខ្ចីសៀវភៅ «<strong style="color:white;">${esc(book.title)}</strong>» សូមចូលគណនីសមាជិកបណ្ណាល័យរបស់អ្នកជាមុនសិន។` 
          : `To submit a borrow application for "<strong style="color:white;">${esc(book.title)}</strong>", please sign in with your library member credentials.`}
      </p>

      <div style="display:flex; flex-direction:column; gap:12px; max-width:320px; margin:0 auto;">
        <a href="/portal/login?redirect_book=${book.id}" style="background:linear-gradient(135deg, #2563eb, #4f46e5); color:white; font-weight:700; font-size:0.92rem; padding:13px 22px; border-radius:10px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 16px rgba(37,99,235,0.4); transition:all 0.2s;">
          <span>🔑</span> <span>${currentLang === 'km' ? 'ចូលគណនីឥឡូវនេះ (Sign In)' : 'Sign In Now'}</span>
        </a>

        <button type="button" onclick="openBookModal(${book.id})" style="background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.12); padding:10px 20px; border-radius:10px; font-weight:600; font-size:0.86rem; cursor:pointer;">
          <span>←</span> <span>${currentLang === 'km' ? 'ត្រឡប់ទៅមើលព័ត៌មានសៀវភៅ' : 'Back to Book Details'}</span>
        </button>
      </div>
    </div>
  `;

  const dialog = $('#bookDialog');
  if (dialog && !dialog.open) {
    dialog.showModal();
  }
};

// STEP 2: Open Detailed Borrow Application Form (Triggered when user clicks 'ផ្ញើសំណើខ្ចីសៀវភៅ')
window.openBorrowApplicationForm = id => {
  let book = allBooks.find(b => b.id === id) || DEFAULT_RECOMMENDED.find(b => b.id === id);
  if (!book) return;

  if (!window.isMemberLoggedIn) {
    showLoginRequiredModal(book);
    return;
  }

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isAvail = (book.available ?? 1) > 0;
  const modalSlot = $('#dialogContent');

  const memberName = memberData?.member?.name || 'Chan Sophea';
  const memberCode = memberData?.member?.code || 'STU-001';
  const memberEmail = memberData?.member?.email || 'sophea@student.edu.kh';
  const memberPhone = memberData?.member?.phone || '+855 12 345 678';
  const memberDept = memberData?.member?.department || 'Computer Science & IT';
  const memberType = memberData?.member?.member_type || 'student';
  const todayStr = new Date().toISOString().split('T')[0];
  
  const defaultReturnDate = new Date();
  defaultReturnDate.setDate(defaultReturnDate.getDate() + 14);
  const defaultReturnStr = defaultReturnDate.toLocaleDateString(currentLang === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  modalSlot.innerHTML = `
    <div>
      <!-- Back Navigation Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <button type="button" onclick="openBookModal(${book.id})" style="background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.12); padding:6px 14px; border-radius:9999px; font-size:0.8rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
          <span>←</span> <span>${currentLang === 'km' ? 'ត្រឡប់ទៅមើលព័ត៌មានសៀវភៅ' : 'Back to Book Details'}</span>
        </button>
        <span style="font-size:0.75rem; font-weight:700; color:#60a5fa; text-transform:uppercase; letter-spacing:0.05em;">
          STEP 2: APPLICATION FORM
        </span>
      </div>

      <!-- Book Overview Banner -->
      <div style="display:flex; gap:18px; align-items:center; background:rgba(30,41,59,0.7); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); margin-bottom:18px;">
        <div class="loan-thumb-wrapper" style="width:105px; min-width:105px;">
          ${getCoverHTML(book)}
        </div>
        <div style="flex:1; min-width:180px;">
          <span style="font-size:0.7rem; font-weight:700; color:#60a5fa; text-transform:uppercase; letter-spacing:0.05em;">
            ${esc(book.category || 'General')}
          </span>
          <h4 style="font-size:1.15rem; font-weight:800; color:#ffffff; margin:3px 0 5px;">${esc(book.title)}</h4>
          <p style="font-size:0.84rem; color:#94a3b8; margin:0;">${dict.author_prefix} <strong style="color:white;">${esc(book.author || 'Unknown')}</strong> | ISBN: ${esc(book.isbn || '—')}</p>
        </div>
      </div>

      <!-- Application Form -->
      <form onsubmit="submitBorrowRequest(event, ${book.id})" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Section 1: Applicant Profile -->
        <div style="background:rgba(15,23,42,0.6); padding:16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
          <div style="font-size:0.88rem; font-weight:700; color:#60a5fa; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
            <span>👤</span> <span>${currentLang === 'km' ? 'ព័ត៌មានអ្នកស្នើសុំខ្ចីសៀវភៅ (Applicant Information)' : 'Applicant Profile Information'}</span>
          </div>

          <!-- Grid: Member Role + Member ID -->
          <div class="borrow-form-grid-2" style="margin-bottom:12px;">
            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>🎓</span> <span>${currentLang === 'km' ? 'ប្រភេទអ្នកខ្ចី (Borrower Role)' : 'Borrower Role'}</span>
              </label>
              <select name="member_type" class="borrow-form-select">
                <option value="student" ${memberType === 'student' ? 'selected' : ''}>${currentLang === 'km' ? 'និស្សិត (Student)' : 'Student'}</option>
                <option value="teacher" ${memberType === 'teacher' ? 'selected' : ''}>${currentLang === 'km' ? 'សាស្ត្រាចារ្យ / គ្រូ (Teacher / Lecturer)' : 'Teacher / Lecturer'}</option>
                <option value="staff" ${memberType === 'staff' ? 'selected' : ''}>${currentLang === 'km' ? 'បុគ្គលិក (Staff / Administration)' : 'Staff Member'}</option>
              </select>
            </div>

            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>🆔</span> <span>${currentLang === 'km' ? 'អត្តលេខ / លេខកូដសម្គាល់' : 'Member / Student ID'}</span>
              </label>
              <input type="text" name="member_code" value="${esc(memberCode)}" class="borrow-form-input" readonly style="opacity:0.85; background:#040814;">
            </div>
          </div>

          <!-- Grid: Full Name + Phone -->
          <div class="borrow-form-grid-2" style="margin-bottom:12px;">
            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>✍️</span> <span>${currentLang === 'km' ? 'ឈ្មោះពេញ (Full Name)' : 'Full Name'}</span>
              </label>
              <input type="text" name="full_name" value="${esc(memberName)}" required class="borrow-form-input" placeholder="e.g. Chan Sophea">
            </div>

            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>📞</span> <span>${currentLang === 'km' ? 'លេខទូរស័ព្ទ (Phone Number)' : 'Phone Number'}</span>
              </label>
              <input type="tel" name="phone" value="${esc(memberPhone)}" required class="borrow-form-input" placeholder="e.g. +855 12 345 678">
            </div>
          </div>

          <!-- Grid: Gmail / Email + Faculty / Department -->
          <div class="borrow-form-grid-2" style="margin-bottom:12px;">
            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>✉️</span> <span>${currentLang === 'km' ? 'អ៊ីមែល / Gmail (Email Address)' : 'Email / Gmail'}</span>
              </label>
              <input type="email" name="email" value="${esc(memberEmail)}" required class="borrow-form-input" placeholder="name@domain.edu.kh">
            </div>

            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>🏛️</span> <span>${currentLang === 'km' ? 'មហាវិទ្យាល័យ / ដេប៉ាតឺម៉ង់ (Department)' : 'Faculty / Department'}</span>
              </label>
              <input type="text" name="department" value="${esc(memberDept)}" class="borrow-form-input" placeholder="e.g. Faculty of Computer Science">
            </div>
          </div>

          <!-- Address / Residence -->
          <div class="borrow-form-group">
            <label class="borrow-form-label">
              <span>📍</span> <span>${currentLang === 'km' ? 'ទីតាំងរស់នៅបច្ចុប្បន្ន (Current Residence Address)' : 'Current Residence Address'}</span>
            </label>
            <input type="text" name="address" value="Phnom Penh, Cambodia" required class="borrow-form-input" placeholder="e.g. St 271, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh">
          </div>
        </div>

        <!-- Section 2: Loan Duration & Schedule -->
        <div style="background:rgba(15,23,42,0.6); padding:16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
          <div style="font-size:0.88rem; font-weight:700; color:#38bdf8; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
            <span>📅</span> <span>${currentLang === 'km' ? 'កាលបរិច្ឆេទខ្ចី & ថ្ងៃសង (Borrow Schedule)' : 'Borrow Period & Schedule'}</span>
          </div>

          <div class="borrow-form-grid-2" style="margin-bottom:12px;">
            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>📆</span> <span>${currentLang === 'km' ? 'ថ្ងៃស្នើសុំខ្ចី (Borrow Date)' : 'Borrow Date'}</span>
              </label>
              <input type="date" id="borrowStartDateInput" name="borrow_date" value="${todayStr}" onchange="updateBorrowReturnDate()" class="borrow-form-input">
            </div>

            <div class="borrow-form-group">
              <label class="borrow-form-label">
                <span>⏱️</span> <span>${currentLang === 'km' ? 'រយៈពេលខ្ចី (Duration)' : 'Loan Duration'}</span>
              </label>
              <select id="borrowDaysSelect" name="days" onchange="updateBorrowReturnDate()" class="borrow-form-select">
                <option value="7">7 ថ្ងៃ (7 Days)</option>
                <option value="14" selected>14 ថ្ងៃ / 2 សប្តាហ៍ (14 Days Standard)</option>
                <option value="21">21 ថ្ងៃ / 3 សប្តាហ៍ (21 Days)</option>
                <option value="30">30 ថ្ងៃ / 1 ខែ (30 Days Maximum)</option>
              </select>
            </div>
          </div>

          <!-- Calculated Return Due Date Callout -->
          <div style="background:rgba(16,185,129,0.1); border:1px dashed rgba(16,185,129,0.3); padding:10px 14px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:0.82rem; font-weight:600; color:#cbd5e1;">
              ${currentLang === 'km' ? 'ថ្ងៃកំណត់ត្រូវសងសៀវភៅត្រឡប់មកវិញ៖' : 'Calculated Return Due Date:'}
            </span>
            <span id="borrowCalculatedDueDate" style="font-size:0.95rem; font-weight:800; color:#34d399;">
              ${defaultReturnStr}
            </span>
          </div>

          <!-- Notes / Purpose of borrowing -->
          <div class="borrow-form-group">
            <label class="borrow-form-label">
              <span>📝</span> <span>${currentLang === 'km' ? 'គោលបំណង ឬកំណត់ចំណាំ (Purpose / Notes)' : 'Purpose of Borrowing / Notes'}</span>
            </label>
            <textarea name="notes" rows="2" class="borrow-form-textarea" placeholder="${currentLang === 'km' ? 'ឧ. សម្រាប់ស្រាវជ្រាវមុខវិជ្ជា និងរៀបចំគម្រោងសារណា...' : 'e.g. For final semester thesis research and course study...'}"></textarea>
          </div>
        </div>

        <!-- Section 3: Agreement Checkbox -->
        <div style="display:flex; align-items:flex-start; gap:10px; padding:4px 2px;">
          <input type="checkbox" id="borrowAgreementCheck" required checked style="margin-top:3px; accent-color:#2563eb; width:16px; height:16px; cursor:pointer;">
          <label for="borrowAgreementCheck" style="font-size:0.8rem; color:#cbd5e1; cursor:pointer; line-height:1.4;">
            ${currentLang === 'km' ? 'ខ្ញុំសន្យាថានឹងថែរក្សាសៀវភៅនេះឱ្យបានល្អ មិនឱ្យខូចខាត និងយកមកប្រគល់ជូនបណ្ណាល័យប៊ែលធីវិញឱ្យទាន់កាលកំណត់។' : 'I agree to comply with BELTEI Library policies, keep the book in pristine condition, and return it on or before the due date.'}
          </label>
        </div>

        <!-- Action Submit Buttons -->
        <div style="display:flex; gap:12px; margin-top:6px;">
          <button type="submit" style="flex:2; background:#2563eb; color:white; border:0; padding:12px 20px; border-radius:8px; font-weight:700; font-size:0.92rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(37,99,235,0.4);">
            <span>📨</span> <span>${currentLang === 'km' ? 'បញ្ជាក់ & ផ្ញើសំណើខ្ចី (Confirm & Submit)' : 'Confirm & Submit Application'}</span>
          </button>
          <button type="button" onclick="bookDialog.close()" style="flex:1; background:transparent; color:#cbd5e1; border:1px solid rgba(255,255,255,0.15); padding:12px 16px; border-radius:8px; font-size:0.85rem; cursor:pointer;">
            ${currentLang === 'km' ? 'បោះបង់' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  `;

  const dialog = $('#bookDialog');
  if (dialog && !dialog.open) {
    dialog.showModal();
  }
};

window.openBookByName = title => {
  const b = allBooks.find(x => x.title.toLowerCase().includes(title.toLowerCase())) || 
            DEFAULT_RECOMMENDED.find(x => x.title.toLowerCase().includes(title.toLowerCase())) ||
            { id: 999, title, author: 'Author', available: 1 };
  openBookModal(b.id);
};

// Helper to parse review_note details string
function parseRequestDetails(req) {
  const note = req.note || '';
  const match = (field) => {
    const reg = new RegExp(`${field}:\\s*([^|]+)`, 'i');
    const m = note.match(reg);
    return m ? m[1].trim() : '';
  };

  const bookId = req.book_id || (req.book ? (allBooks.find(b => b.title === req.book)?.id) : null);
  const matchedBook = allBooks.find(b => b.id === bookId || b.title === (req.book_title || req.book)) || {
    id: bookId,
    title: req.book_title || req.book || 'Library Book',
    author: req.book_author || 'BELTEI University',
    category: req.book_category || 'General Collection',
    isbn: req.book_isbn || '—'
  };

  const memberName = req.member_name || memberData?.member?.name || 'Chan Sophea';
  const memberCode = req.member_code || memberData?.member?.code || 'STU-001';
  const memberType = req.member_type || match('Role') || memberData?.member?.member_type || 'Student';
  const phone = req.phone || match('Tel') || memberData?.member?.phone || '+855 12 345 678';
  const email = req.email || match('Email') || memberData?.member?.email || 'member@edu.kh';
  const dept = req.department || match('Dept') || memberData?.member?.department || 'Information Technology';
  const address = req.address || match('Address') || 'Phnom Penh, Cambodia';
  const notes = req.notes || match('Note') || 'Academic study and research';
  const days = req.desired_days || req.days || 14;
  const reqDate = req.requested_at || req.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const refCode = req.reference_code || `REQ-2026-${String(req.id || 1).padStart(4, '0')}`;

  let dueDateStr = req.due_date;
  if (!dueDateStr) {
    const dt = new Date();
    dt.setDate(dt.getDate() + Number(days));
    dueDateStr = dt.toLocaleDateString(currentLang === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return {
    id: req.id,
    reference_code: refCode,
    status: req.status || 'pending',
    book: matchedBook,
    member_name: memberName,
    member_code: memberCode,
    member_type: memberType,
    phone,
    email,
    department: dept,
    address,
    notes,
    days,
    requested_at: reqDate,
    due_date: dueDateStr
  };
}

let currentSlipPollTimer = null;

function clearSlipPolling() {
  if (currentSlipPollTimer) {
    clearInterval(currentSlipPollTimer);
    currentSlipPollTimer = null;
  }
}

// STEP 3: Open Borrow Request Pending / Confirmation Form Slip Modal
window.openBorrowPendingConfirmationModal = (rawReq) => {
  clearSlipPolling();
  const req = parseRequestDetails(rawReq);
  const isApproved = req.status === 'approved';
  const isRejected = req.status === 'rejected';
  const isPending = !isApproved && !isRejected;

  // Real-time live status auto-polling: when open in Pending state, auto-detect Admin Confirm immediately!
  if (isPending && req.id) {
    currentSlipPollTimer = setInterval(async () => {
      try {
        const freshData = await fetchJSON('/portal/api/me');
        if (freshData && freshData.requests) {
          memberData = freshData;
          const updated = freshData.requests.find(r => r.id === req.id || r.reference_code === req.reference_code);
          if (updated && updated.status !== 'pending') {
            clearSlipPolling();
            // Automatically upgrade modal to Approved / Rejected Slip in real time!
            openBorrowPendingConfirmationModal(updated);
            if (updated.status === 'approved') {
              toast(currentLang === 'km' ? '🎉 សំណើខ្ចីសៀវភៅត្រូវបាន Admin អនុម័តជោគជ័យ!' : '🎉 Borrow request has been confirmed & approved by Admin!', 'success');
            }
            renderLoans();
            renderRequestsList();
            renderNotifications();
          }
        }
      } catch (err) {}
    }, 2000);
  }

  const modalSlot = $('#dialogContent');
  if (!modalSlot) return;

  const statusBadgeHTML = isApproved ? `
    <span class="status-approved-pill" style="background:#10b981; color:#ffffff; padding:6px 18px; font-weight:800; box-shadow:0 0 16px rgba(16,185,129,0.5);">
      <span>✓</span> <span>${currentLang === 'km' ? 'បានអនុម័តជោគជ័យ (Approved)' : 'Approved & Ready for Pick-up'}</span>
    </span>
  ` : isRejected ? `
    <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.5); color:#f87171; padding:5px 14px; border-radius:9999px; font-size:0.8rem; font-weight:700; text-transform:uppercase;">
      <span>✕</span> <span>${currentLang === 'km' ? 'មិនត្រូវបានអនុម័ត (Rejected)' : 'Rejected'}</span>
    </span>
  ` : `
    <span class="status-pulse-pill">
      <span>⏳</span> <span>${currentLang === 'km' ? 'កំពុងរង់ចាំការអនុម័តពី Admin (Pending Approval)' : 'Pending Admin Confirmation'}</span>
    </span>
  `;

  modalSlot.innerHTML = `
    <div id="printSlipModalContent" class="slip-card-box">
      
      <!-- Top Slip Banner with Status & Close icon -->
      <div class="slip-header-banner" style="${isApproved ? 'border-bottom: 2px solid rgba(16,185,129,0.4); background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(15,23,42,0.9));' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="flex:1; text-align:center; padding-left:24px;">
            <div style="margin-bottom:8px;">
              ${statusBadgeHTML}
            </div>
            <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em;">
              ${currentLang === 'km' ? 'លេខកូដសម្គាល់ប័ណ្ណសំណើខ្ចីសៀវភៅ (Request Tracking No.)' : 'Borrow Request Tracking Slip'}
            </div>
            <div class="slip-ref-code" style="${isApproved ? 'color:#34d399;' : ''}">${esc(req.reference_code)}</div>
            <div style="font-size:0.8rem; color:#cbd5e1;">
              BELTEI International University Library System
            </div>
          </div>
          <button type="button" onclick="clearSlipPolling(); bookDialog.close();" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.85rem; transition:all 0.2s;" title="Close">
            ✕
          </button>
        </div>
      </div>

      <!-- Slip Body Content -->
      <div class="slip-body-content">
        
        <!-- Book Overview Card in Slip -->
        <div style="display:flex; gap:16px; align-items:center; background:rgba(255,255,255,0.03); padding:14px; border-radius:10px; border:1px solid rgba(255,255,255,0.07);">
          <div class="loan-thumb-wrapper" style="width:85px; min-width:85px;">
            ${getCoverHTML(req.book)}
          </div>
          <div style="flex:1; min-width:180px;">
            <span style="font-size:0.7rem; font-weight:700; color:#60a5fa; text-transform:uppercase;">${esc(req.book.category || 'General')}</span>
            <h4 style="font-size:1.1rem; font-weight:800; color:#ffffff; margin:3px 0 4px;">${esc(req.book.title)}</h4>
            <p style="font-size:0.82rem; color:#94a3b8; margin:0;">${esc(req.book.author || 'Author')} | ISBN: ${esc(req.book.isbn || '—')}</p>
          </div>
        </div>

        <!-- 2-Column Info Grid -->
        <div class="slip-data-grid">
          <div class="slip-data-item">
            <span class="label">👤 ${currentLang === 'km' ? 'អ្នកស្នើសុំ (Borrower)' : 'Borrower Name'}</span>
            <span class="value">${esc(req.member_name)} (${esc(req.member_code)})</span>
          </div>

          <div class="slip-data-item">
            <span class="label">🎓 ${currentLang === 'km' ? 'តួនាទី (Role / Type)' : 'Role / Type'}</span>
            <span class="value" style="text-transform:capitalize;">${esc(req.member_type)}</span>
          </div>

          <div class="slip-data-item">
            <span class="label">📞 ${currentLang === 'km' ? 'លេខទូរស័ព្ទ (Phone)' : 'Phone Number'}</span>
            <span class="value">${esc(req.phone)}</span>
          </div>

          <div class="slip-data-item">
            <span class="label">✉️ ${currentLang === 'km' ? 'អ៊ីមែល / Gmail' : 'Email Address'}</span>
            <span class="value">${esc(req.email)}</span>
          </div>

          <div class="slip-data-item">
            <span class="label">🏛️ ${currentLang === 'km' ? 'ដេប៉ាតឺម៉ង់ (Department)' : 'Department'}</span>
            <span class="value">${esc(req.department)}</span>
          </div>

          <div class="slip-data-item">
            <span class="label">📍 ${currentLang === 'km' ? 'ទីតាំងរស់នៅ (Address)' : 'Address'}</span>
            <span class="value">${esc(req.address)}</span>
          </div>

          <div class="slip-data-item">
            <span class="label">📅 ${currentLang === 'km' ? 'ថ្ងៃស្នើសុំ (Request Date)' : 'Request Date'}</span>
            <span class="value">${esc(req.requested_at)}</span>
          </div>

          <div class="slip-data-item">
            <span class="label">⏱️ ${currentLang === 'km' ? 'រយៈពេល & ថ្ងៃសង (Duration & Due)' : 'Duration & Due Date'}</span>
            <span class="value" style="color:#34d399; font-weight:800;">${req.days} Days → ${esc(req.due_date)}</span>
          </div>
        </div>

        <!-- Official System Note / Callout -->
        <div class="slip-note-callout" style="${isApproved ? 'border-left: 4px solid #10b981; background: rgba(16,185,129,0.1);' : ''}">
          ${isApproved ? `
            <strong style="color:#34d399; display:block; margin-bottom:4px; font-size:0.95rem;">🎉 ${currentLang === 'km' ? 'សំណើត្រូវបាន Admin អនុម័តជោគជ័យ!' : 'Borrow Request Approved & Active!'}</strong>
            <span style="color:#e2e8f0;">${currentLang === 'km' ? 'សៀវភៅត្រូវបានកត់ត្រាចូលក្នុងគណនីខ្ចីសកម្មរបស់អ្នករួចរាល់ហើយ។ អ្នកអាចមកយកសៀវភៅនៅបញ្ជរបណ្ណាល័យប៊ែលធី ដោយបង្ហាញលេខកូដប័ណ្ណនេះ ឬបោះពុម្ពប័ណ្ណផ្លូវការ។' : 'Your borrow request has been successfully approved by Admin. The book is now logged into your Active Loans. Please present this slip at the circulation desk.'}</span>
          ` : isRejected ? `
            <strong style="color:#f87171; display:block; margin-bottom:4px;">⚠️ ${currentLang === 'km' ? 'សំណើមិនត្រូវបានអនុម័ត' : 'Request Rejected'}</strong>
            <span>${currentLang === 'km' ? 'សំណើមិនត្រូវបានអនុម័តដោយសារសៀវភៅមិនមានច្បាប់ទំនេរ ឬមិនឆ្លើយតបតាមលក្ខខណ្ឌ។' : 'This request could not be approved at this time.'}</span>
          ` : `
            <strong style="color:#fbbf24; display:block; margin-bottom:4px;">⏳ ${currentLang === 'km' ? 'ការជូនដំណឹងពីប្រព័ន្ធ (Live Checking...)' : 'System Note (Pending Confirmation)'}</strong>
            <span>${currentLang === 'km' ? 'សំណើរបស់អ្នកត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធជោគជ័យ! ប្រព័ន្ធកំពុងរង់ចាំ Admin Confirm។ ពេល Admin ចុច Approve ផ្ទាំងនេះនឹងផ្លាស់ប្តូរទៅជាប័ណ្ណជោគជ័យ (Approved) ដោយស្វ័យប្រវត្តិភ្លាម។' : 'Your request is submitted and pending librarian confirmation. This slip will automatically turn Green (Approved) as soon as Admin confirms.'}</span>
          `}
        </div>

        <!-- Interactive Action Buttons in Slip -->
        <div class="slip-actions-bar">
          <button type="button" onclick="printBorrowRequestSlip(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="flex:1; min-width:130px; background:rgba(255,255,255,0.08); color:white; border:1px solid rgba(255,255,255,0.15); padding:10px 12px; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span>🖨️</span> <span>${currentLang === 'km' ? 'បោះពុម្ពប័ណ្ណ (Print)' : 'Print Slip'}</span>
          </button>

          <button type="button" onclick="copyRequestReferenceCode('${esc(req.reference_code)}')" style="flex:1; min-width:130px; background:rgba(255,255,255,0.08); color:white; border:1px solid rgba(255,255,255,0.15); padding:10px 12px; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span>📋</span> <span>${currentLang === 'km' ? 'ចម្លងកូដ (Copy)' : 'Copy ID'}</span>
          </button>

          <button type="button" onclick="clearSlipPolling(); bookDialog.close(); navigateTo('requests');" style="flex:1; min-width:130px; background:#2563eb; color:white; border:0; padding:10px 12px; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 4px 12px rgba(37,99,235,0.4);">
            <span>📂</span> <span>${currentLang === 'km' ? 'មើលបញ្ជីសំណើ' : 'My Requests'}</span>
          </button>

          <button type="button" onclick="clearSlipPolling(); bookDialog.close();" style="background:#dc2626; color:white; border:0; padding:10px 18px; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <span>✕</span> <span>${currentLang === 'km' ? 'បិទផ្ទាំង (Close)' : 'Close'}</span>
          </button>
        </div>

      </div>
    </div>
  `;

  const dialog = $('#bookDialog');
  if (dialog) {
    if (!dialog.open) dialog.showModal();
    dialog.onclose = clearSlipPolling;
  }
};

// Copy Reference Code Helper
window.copyRequestReferenceCode = (code) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      toast(currentLang === 'km' ? `📋 បានចម្លងលេខកូដសំណើ៖ ${code}` : `📋 Copied Reference ID: ${code}`);
    }).catch(() => {
      toast(code);
    });
  } else {
    toast(code);
  }
};

// Open Slip by Request ID from table / list with live fresh fetch
window.openSlipByRequestId = async (reqId) => {
  try {
    const freshData = await fetchJSON('/portal/api/me');
    if (freshData) {
      memberData = freshData;
      renderLoans();
      renderRequestsList();
    }
  } catch (e) {}

  const req = memberData?.requests?.find(r => r.id === reqId) || { id: reqId };
  openBorrowPendingConfirmationModal(req);
};

// Official Printable Borrow Request Note
window.printBorrowRequestSlip = (req) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const isApproved = req.status === 'approved';
  const statusTitle = isApproved ? 'APPROVED & CONFIRMED' : 'PENDING LIBRARIAN CONFIRMATION';
  const statusColor = isApproved ? '#059669' : '#d97706';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Borrow Request Slip - ${req.reference_code}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; background: #fff; }
        .receipt-card { max-width: 680px; margin: 0 auto; border: 2px solid #0f172a; padding: 28px 32px; border-radius: 8px; }
        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
        .header h1 { font-size: 20px; text-transform: uppercase; margin: 0 0 4px; color: #0f172a; letter-spacing: 0.05em; }
        .header h2 { font-size: 15px; margin: 0 0 6px; color: #3b82f6; font-weight: 700; }
        .header p { font-size: 12px; color: #64748b; margin: 0; }
        .badge { display: inline-block; padding: 4px 14px; border-radius: 4px; font-weight: 800; font-size: 12px; color: #fff; background: ${statusColor}; margin-top: 10px; }
        .ref-box { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border: 1px dashed #cbd5e1; margin-bottom: 18px; border-radius: 6px; }
        .ref-box strong { font-family: monospace; font-size: 16px; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px; }
        table th, table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
        table th { background: #f1f5f9; color: #475569; font-weight: 700; width: 35%; }
        .notice-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; font-size: 12px; color: #1e3a8a; margin-bottom: 24px; border-radius: 0 4px 4px 0; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
        .sig-block { width: 200px; border-top: 1px solid #0f172a; padding-top: 8px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <h1>BELTEI INTERNATIONAL UNIVERSITY</h1>
          <h2>CENTRAL LIBRARY • BORROW APPLICATION SLIP</h2>
          <p>Phnom Penh, Kingdom of Cambodia • Tel: +855 23 221 222 • library@beltei.edu.kh</p>
          <div class="badge">${statusTitle}</div>
        </div>

        <div class="ref-box">
          <div>
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Tracking Code:</div>
            <strong>${req.reference_code}</strong>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Application Date:</div>
            <strong>${req.requested_at}</strong>
          </div>
        </div>

        <table>
          <tr><th>Borrower Full Name</th><td><strong>${req.member_name}</strong></td></tr>
          <tr><th>Member / Student ID</th><td>${req.member_code}</td></tr>
          <tr><th>Borrower Role / Type</th><td style="text-transform:capitalize;">${req.member_type}</td></tr>
          <tr><th>Contact Phone</th><td>${req.phone}</td></tr>
          <tr><th>Gmail / Email</th><td>${req.email}</td></tr>
          <tr><th>Faculty / Department</th><td>${req.department}</td></tr>
          <tr><th>Residence Address</th><td>${req.address}</td></tr>
          <tr><th>Book Title</th><td><strong>${req.book.title}</strong></td></tr>
          <tr><th>Author / Category</th><td>${req.book.author} (${req.book.category || 'General'})</td></tr>
          <tr><th>ISBN</th><td>${req.book.isbn || '—'}</td></tr>
          <tr><th>Loan Period</th><td><strong>${req.days} Days</strong> (Due: <strong>${req.due_date}</strong>)</td></tr>
        </table>

        <div class="notice-box">
          <strong>Library Policy Notice:</strong><br>
          This document confirms the borrow application has been logged into the BELTEI Library Management System. 
          Please present this slip or tracking ID at the Circulation Desk upon book collection. Late returns are subject to standard library fine policies.
        </div>

        <div class="signatures">
          <div class="sig-block">
            Borrower Signature<br><br><br>
            _______________________
          </div>
          <div class="sig-block">
            Librarian / Staff Signature<br><br><br>
            _______________________
          </div>
        </div>
      </div>
      <script>
        window.onload = () => { window.print(); };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// STEP 2 -> STEP 3: Handle borrow request submit with full applicant payload
window.submitBorrowRequest = async (e, bookId) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const days = parseInt(formData.get('days'), 10) || 14;
  const memberType = formData.get('member_type') || 'student';
  const fullName = formData.get('full_name') || '';
  const phone = formData.get('phone') || '';
  const email = formData.get('email') || '';
  const department = formData.get('department') || '';
  const address = formData.get('address') || '';
  const notes = formData.get('notes') || '';

  const matchedBook = allBooks.find(b => b.id === bookId) || DEFAULT_RECOMMENDED.find(b => b.id === bookId) || { id: bookId, title: 'Library Book' };

  try {
    const res = await fetchJSON('/portal/api/requests', {
      method: 'POST',
      body: JSON.stringify({
        book_id: bookId,
        days,
        member_type: memberType,
        full_name: fullName,
        phone,
        email,
        department,
        address,
        notes
      })
    });

    // Step 3: Transition to Pending Confirmation Slip Modal
    openBorrowPendingConfirmationModal(res);
    toast(currentLang === 'km' ? '✅ សំណើខ្ចីសៀវភៅត្រូវបានបញ្ជូនជោគជ័យ! បណ្ណារក្សនឹងត្រួតពិនិត្យជូន។' : '✅ Borrow request submitted successfully for librarian review!');
    loadPortalData();
  } catch (err) {
    // If backend returns existing or error, show pending modal with local fallback
    const fallbackReq = {
      id: Math.floor(Math.random() * 900) + 100,
      reference_code: `REQ-2026-${Math.floor(Math.random() * 900) + 100}`,
      status: 'pending',
      book_id: bookId,
      book_title: matchedBook.title,
      book_author: matchedBook.author,
      book_category: matchedBook.category,
      book_isbn: matchedBook.isbn,
      member_name: fullName || memberData?.member?.name || 'Chan Sophea',
      member_code: memberData?.member?.code || 'STU-001',
      member_type: memberType,
      phone: phone || memberData?.member?.phone,
      email: email || memberData?.member?.email,
      department: department || memberData?.member?.department,
      address: address || 'Phnom Penh, Cambodia',
      notes: notes || 'Study research',
      desired_days: days,
      requested_at: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    openBorrowPendingConfirmationModal(fallbackReq);
    toast(err.message || (currentLang === 'km' ? 'សំណើត្រូវបានកត់ត្រាទុក!' : 'Borrow request recorded!'));
    loadPortalData();
  }
};

// Render Requests List View (All Requests Tab)
function renderRequestsList() {
  const box = $('#requestsListContainer');
  if (!box) return;

  if (!window.isMemberLoggedIn) {
    box.innerHTML = `
      <div class="empty-state" style="padding:48px 20px; text-align:center;">
        <div style="font-size:2.4rem; margin-bottom:10px;">🔒</div>
        <h4 style="color:white; margin-bottom:6px;">${currentLang === 'km' ? 'សូមចូលគណនីដើម្បីពិនិត្យមើលបញ្ជីសំណើ' : 'Sign In Required'}</h4>
        <p style="color:var(--text-muted); font-size:0.85rem; max-width:380px; margin:0 auto 16px;">${currentLang === 'km' ? 'សូមចូលគណនីសមាជិកបណ្ណាល័យដើម្បីពិនិត្យមើលស្ថានភាពសំណើខ្ចីសៀវភៅរបស់អ្នក។' : 'Please sign in with your member account to view your borrow requests.'}</p>
        <a href="/portal/login" class="btn-card-action" style="display:inline-flex; align-items:center; gap:6px; background:#2563eb; color:white; text-decoration:none; padding:10px 20px; border-radius:8px;">
          <span>🔑</span> <span>${currentLang === 'km' ? 'ចូលគណនី (Sign In)' : 'Sign In Now'}</span>
        </a>
      </div>
    `;
    return;
  }

  const requests = memberData?.requests || [];

  if (!requests.length) {
    box.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        <h4 style="color:white; margin-bottom:4px;">${currentLang === 'km' ? 'មិនទាន់មានសំណើខ្ចីសៀវភៅនៅឡើយទេ' : 'No borrow requests yet'}</h4>
        <p style="color:var(--text-muted); font-size:0.85rem;">${currentLang === 'km' ? 'អ្នកអាចស្វែងរកសៀវភៅ និងស្នើសុំខ្ចីពីបណ្ណាល័យបាន។' : 'Explore catalog and submit a new borrow request.'}</p>
        <button class="btn-card-action" onclick="navigateTo('browse')" style="margin-top:12px;">Browse Books Now</button>
      </div>
    `;
    return;
  }

  box.innerHTML = requests.map(r => {
    const isApproved = r.status === 'approved';
    const isRejected = r.status === 'rejected';
    const isPending = !isApproved && !isRejected;

    const statusBadge = isApproved ? `
      <span style="background:rgba(16,185,129,0.18); color:#34d399; font-weight:700; font-size:0.75rem; padding:3px 10px; border-radius:6px;">
        ✓ ${currentLang === 'km' ? 'បានអនុម័តជោគជ័យ' : 'Approved'}
      </span>
    ` : isRejected ? `
      <span style="background:rgba(239,68,68,0.18); color:#f87171; font-weight:700; font-size:0.75rem; padding:3px 10px; border-radius:6px;">
        ✕ ${currentLang === 'km' ? 'មិនត្រូវបានអនុម័ត' : 'Rejected'}
      </span>
    ` : `
      <span style="background:rgba(245,158,11,0.18); color:#fbbf24; font-weight:700; font-size:0.75rem; padding:3px 10px; border-radius:6px;">
        ⏳ ${currentLang === 'km' ? 'កំពុងរង់ចាំ Admin Confirm' : 'Pending Admin Review'}
      </span>
    `;

    return `
      <div class="record-item" style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; padding:16px; border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="flex:1; min-width:240px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
            <strong style="color:white; font-size:1.02rem;">${esc(r.book_title || r.book || 'Book')}</strong>
            <span style="font-family:monospace; font-size:0.78rem; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px; color:#cbd5e1;">${esc(r.reference_code || `REQ-2026-${String(r.id).padStart(4, '0')}`)}</span>
            ${statusBadge}
          </div>
          <div style="font-size:0.83rem; color:var(--text-muted); display:flex; gap:14px; flex-wrap:wrap; margin-top:4px;">
            <span>📅 ${currentLang === 'km' ? 'ថ្ងៃស្នើសុំ៖' : 'Requested:'} <strong style="color:#e2e8f0;">${esc(r.requested_at || r.date || 'Today')}</strong></span>
            <span>⏱️ ${currentLang === 'km' ? 'រយៈពេល៖' : 'Duration:'} <strong style="color:#e2e8f0;">${r.days || r.desired_days || 14} ${currentLang === 'km' ? 'ថ្ងៃ' : 'Days'}</strong></span>
            <span>📆 ${currentLang === 'km' ? 'ថ្ងៃសង៖' : 'Due:'} <strong style="color:#34d399;">${esc(r.due_date || 'In 14 Days')}</strong></span>
          </div>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn-card-action" onclick="openSlipByRequestId(${r.id})" style="background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.15); color:white; padding:8px 14px; font-size:0.82rem;">
            👁️ ${currentLang === 'km' ? 'មើលប័ណ្ណសំណើ' : 'View Slip Note'}
          </button>
          ${isApproved ? `
            <button class="btn-card-action" onclick="navigateTo('loans')" style="background:#059669; border-color:#059669; color:white; padding:8px 14px; font-size:0.82rem;">
              🏛️ ${currentLang === 'km' ? 'មើលសៀវភៅកំពុងខ្ចី' : 'View in Loans'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Render Loans list (My Loans View)
function renderLoansList() {
  const box = $('#loansListContainer');
  if (!box) return;

  if (!window.isMemberLoggedIn) {
    box.innerHTML = `
      <div class="empty-state" style="padding:48px 20px; text-align:center;">
        <div style="font-size:2.4rem; margin-bottom:10px;">🔒</div>
        <h4 style="color:white; margin-bottom:6px;">${currentLang === 'km' ? 'សូមចូលគណនីដើម្បីពិនិត្យមើលសៀវភៅកំពុងខ្ចី' : 'Sign In Required'}</h4>
        <p style="color:var(--text-muted); font-size:0.85rem; max-width:380px; margin:0 auto 16px;">${currentLang === 'km' ? 'សូមចូលគណនីសមាជិកបណ្ណាល័យដើម្បីពិនិត្យមើលសៀវភៅកំពុងខ្ចី និងកាលបរិច្ឆេទសង។' : 'Please sign in with your member account to view your active borrowed books.'}</p>
        <a href="/portal/login" class="btn-card-action" style="display:inline-flex; align-items:center; gap:6px; background:#2563eb; color:white; text-decoration:none; padding:10px 20px; border-radius:8px;">
          <span>🔑</span> <span>${currentLang === 'km' ? 'ចូលគណនី (Sign In)' : 'Sign In Now'}</span>
        </a>
      </div>
    `;
    return;
  }

  const loans = memberData?.loans || [];
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!loans.length) {
    box.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"/></svg>
        <h4 style="color:white; margin-bottom:4px;">${t('no_loans')}</h4>
        <button class="btn-card-action" onclick="navigateTo('browse')" style="margin-top:12px;">Browse Books Now</button>
      </div>
    `;
    return;
  }

  box.innerHTML = loans.map(l => {
    const bookObj = { id: l.book_id, title: l.book_title, author: l.author, category: l.category };
    const statusText = l.is_overdue ? dict.status_overdue : dict.status_active;
    const badgeColor = l.is_overdue ? 'rgba(239,68,68,0.18)' : 'rgba(16,185,129,0.18)';
    const textColor = l.is_overdue ? '#f87171' : '#34d399';

    return `
      <div class="record-item" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap; justify-content:space-between;">
        <div style="display:flex; gap:20px; align-items:center; flex:1; min-width:280px;">
          <div class="loan-thumb-wrapper">
            ${getCoverHTML(bookObj)}
          </div>
          <div>
            <span style="font-size:0.7rem; font-weight:700; color:#60a5fa; text-transform:uppercase;">${esc(l.category || 'General')}</span>
            <h4 style="color:white; font-size:1.1rem; font-weight:700; margin:3px 0 5px;">${esc(l.book_title)}</h4>
            <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:8px;">${dict.author_prefix} <strong>${esc(l.author || 'Author')}</strong></p>
            <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:0.82rem; color:#cbd5e1;">
              <span>${dict.loan_borrowed_prefix} <strong>${esc(l.borrow_date || '—')}</strong></span>
              <span>${dict.loan_due_prefix} <strong style="color:${textColor};">${esc(l.due_date || '—')}</strong></span>
              ${l.copy_code ? `<span style="opacity:0.75;">Copy: ${esc(l.copy_code)}</span>` : ''}
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
          <span style="background:${badgeColor}; color:${textColor}; padding:5px 16px; border-radius:9999px; font-size:0.82rem; font-weight:700;">
            ● ${statusText} (${l.days_left} ${dict.days_remaining_suffix})
          </span>
          <button class="btn-card-action" onclick="openBookModal(${l.book_id || 101})" style="padding:6px 16px; font-size:0.82rem;">
            ${dict.btn_view_book}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Reservations list (Reservations View)
function renderReservationsList() {
  const box = $('#reservationsListContainer');
  if (!box) return;
  const res = memberData?.reservations || [];
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!res.length) {
    box.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>
        <h4 style="color:white; margin-bottom:4px;">${t('no_reservations')}</h4>
        <button class="btn-card-action" onclick="navigateTo('browse')" style="margin-top:12px;">Browse & Reserve Books</button>
      </div>
    `;
    return;
  }

  box.innerHTML = res.map(r => {
    const bookObj = { id: r.book_id, title: r.book_title, author: r.author, category: r.category };
    const isReady = r.status === 'ready' || r.status === 'fulfilled';
    const statusText = isReady ? dict.status_ready : dict.status_pending;
    const badgeColor = isReady ? 'rgba(16,185,129,0.18)' : 'rgba(139,92,246,0.18)';
    const textColor = isReady ? '#34d399' : '#a78bfa';

    return `
      <div class="record-item" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap; justify-content:space-between;">
        <div style="display:flex; gap:20px; align-items:center; flex:1; min-width:280px;">
          <div class="loan-thumb-wrapper">
            ${getCoverHTML(bookObj)}
          </div>
          <div>
            <span style="font-size:0.7rem; font-weight:700; color:#60a5fa; text-transform:uppercase;">${esc(r.category || 'General')}</span>
            <h4 style="color:white; font-size:1.1rem; font-weight:700; margin:3px 0 5px;">${esc(r.book_title)}</h4>
            <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:8px;">${dict.author_prefix} <strong>${esc(r.author || 'Author')}</strong></p>
            <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:0.82rem; color:#cbd5e1;">
              <span>Reserved on: <strong>${esc(r.reserved_at || 'Recently')}</strong></span>
              <span>Expires: <strong>${esc(r.expires_at || 'In 7 days')}</strong></span>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
          <span style="background:${badgeColor}; color:${textColor}; padding:5px 16px; border-radius:9999px; font-size:0.82rem; font-weight:700;">
            ● ${statusText}
          </span>
          <button class="btn-card-action" onclick="openBookModal(${r.book_id || 105})" style="padding:6px 16px; font-size:0.82rem;">
            ${dict.btn_view_book}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Borrowing History list (History View)
function renderHistoryList() {
  const box = $('#historyListContainer');
  if (!box) return;
  const history = memberData?.history || [];
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!history.length) {
    box.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <h4 style="color:white; margin-bottom:4px;">${t('no_history')}</h4>
      </div>
    `;
    return;
  }

  box.innerHTML = history.map(h => {
    const bookObj = { id: h.book_id, title: h.book_title, author: h.author, category: h.category };

    return `
      <div class="record-item" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap; justify-content:space-between;">
        <div style="display:flex; gap:20px; align-items:center; flex:1; min-width:280px;">
          <div class="loan-thumb-wrapper">
            ${getCoverHTML(bookObj)}
          </div>
          <div>
            <span style="font-size:0.7rem; font-weight:700; color:#60a5fa; text-transform:uppercase;">${esc(h.category || 'General')}</span>
            <h4 style="color:white; font-size:1.1rem; font-weight:700; margin:3px 0 5px;">${esc(h.book_title)}</h4>
            <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:8px;">${dict.author_prefix} <strong>${esc(h.author || 'Author')}</strong></p>
            <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:0.82rem; color:#cbd5e1;">
              <span>${dict.loan_borrowed_prefix} <strong>${esc(h.borrow_date || '—')}</strong></span>
              <span>${dict.returned_on} <strong style="color:#34d399;">${esc(h.return_date || 'Completed')}</strong></span>
            </div>
          </div>
        </div>

        <div>
          <span style="background:rgba(255,255,255,0.06); color:#cbd5e1; padding:5px 16px; border-radius:9999px; font-size:0.82rem; font-weight:600;">
            ✓ ${dict.status_returned}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// Render Fines & Payments View
function renderFinesView() {
  const unpaidBox = $('#unpaidFinesContainer');
  const paidBox = $('#paidFinesContainer');
  if (!unpaidBox || !paidBox) return;

  const fines = memberData?.fines || [];
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const unpaidFines = fines.filter(f => !f.is_paid);
  const paidFines = fines.filter(f => f.is_paid);

  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Update Summary KPI Cards
  $('#finesTotalUnpaid').textContent = `$${totalUnpaid.toFixed(2)}`;
  $('#finesTotalPaid').textContent = `$${totalPaid.toFixed(2)}`;

  const statusElem = $('#finesAccountStatus');
  const payAllBtn = $('#btnPayAllFines');

  if (totalUnpaid > 0) {
    statusElem.textContent = currentLang === 'km' ? 'ត្រូវទូទាត់ប្រាក់ពិន័យ' : 'Payment Required';
    statusElem.style.color = '#f87171';
    if (payAllBtn) payAllBtn.style.display = 'inline-block';
  } else {
    statusElem.textContent = currentLang === 'km' ? 'គណនីល្អប្រសើរ' : 'Good Standing';
    statusElem.style.color = '#34d399';
    if (payAllBtn) payAllBtn.style.display = 'none';
  }

  // Render Unpaid Section
  if (!unpaidFines.length) {
    unpaidBox.innerHTML = `
      <div style="text-align:center; padding:32px 20px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#34d399" stroke-width="1.8" style="width:40px; height:40px; margin-bottom:8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <h4 style="color:#ffffff; font-size:1.05rem; margin-bottom:4px;">${currentLang === 'km' ? 'មិនមានប្រាក់ពិន័យដែលត្រូវបង់ឡើយ' : 'No Outstanding Fines'}</h4>
        <p style="color:var(--text-muted); font-size:0.85rem;">${currentLang === 'km' ? 'គណនីបណ្ណាល័យរបស់អ្នកស្ថិតក្នុងស្ថានភាពល្អប្រសើរ និងមានសិទ្ធិខ្ចីពេញលេញ។' : 'Your library account is in good standing with full borrowing privileges.'}</p>
      </div>
    `;
  } else {
    unpaidBox.innerHTML = unpaidFines.map(f => `
      <div class="record-item" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; gap:16px; align-items:center;">
          <div style="width:44px; height:44px; border-radius:10px; background:rgba(239,68,68,0.15); display:flex; align-items:center; justify-content:center; color:#f87171; flex-shrink:0;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="background:rgba(239,68,68,0.2); color:#f87171; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:4px;">${esc(f.receipt_number)}</span>
              <strong style="color:white; font-size:1.02rem;">${esc(f.book_title || 'Library Fine')}</strong>
            </div>
            <p style="font-size:0.84rem; color:#94a3b8; margin:3px 0;">${esc(f.reason)}</p>
            <small style="color:var(--text-muted);">Issued on: ${esc(f.created_at || 'Recent')}</small>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:16px;">
          <span style="font-size:1.25rem; font-weight:800; color:#f87171;">$${f.amount.toFixed(2)}</span>
          <button class="btn-card-action" onclick="openPayFineModal(${f.id}, ${f.amount}, '${esc(f.reason)}')" style="background:var(--primary-blue); border-color:var(--primary-blue); display:flex; align-items:center; gap:6px;">
            <span>🇰🇭</span> <span>${dict.btn_pay_fine}</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render Paid Section
  if (!paidFines.length) {
    paidBox.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <h4 style="color:white; margin-bottom:4px;">No Payment History</h4>
        <p style="color:var(--text-muted); font-size:0.85rem;">Past settled receipts will appear here.</p>
      </div>
    `;
  } else {
    paidBox.innerHTML = paidFines.map(f => `
      <div class="record-item" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; gap:16px; align-items:center;">
          <div style="width:44px; height:44px; border-radius:10px; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; color:#34d399; flex-shrink:0;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="background:rgba(16,185,129,0.2); color:#34d399; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:4px;">${esc(f.receipt_number)}</span>
              <strong style="color:white; font-size:1.02rem;">${esc(f.book_title || 'Settled Fine')}</strong>
            </div>
            <p style="font-size:0.84rem; color:#94a3b8; margin:3px 0;">${esc(f.reason)}</p>
            <small style="color:var(--text-muted);">Paid on: ${esc(f.paid_at || f.created_at || 'Completed')}</small>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:16px;">
          <span style="font-size:1.15rem; font-weight:700; color:#34d399;">$${f.amount.toFixed(2)}</span>
          <button class="btn-card-action" onclick="viewReceiptModal('${esc(f.receipt_number)}', ${f.amount}, '${esc(f.reason)}', '${esc(f.paid_at || 'Recent')}')" style="background:rgba(255,255,255,0.06); border-color:var(--border-subtle);">
            📄 ${dict.btn_view_receipt}
          </button>
        </div>
      </div>
    `).join('');
  }
}

// Open Pay Fine Modal (KHQR / Bakong Simulation)
window.openPayFineModal = (fineId, amount, reason) => {
  const khrAmount = Math.round(amount * 4100).toLocaleString();
  const modalSlot = $('#paymentDialogContent');
  
  modalSlot.innerHTML = `
    <div>
      <div style="display:inline-flex; align-items:center; gap:6px; background:#e11d48; color:white; padding:4px 12px; border-radius:9999px; font-weight:800; font-size:0.75rem; margin-bottom:12px;">
        <span>🇰🇭</span> <span>BAKONG / KHQR PAYMENT</span>
      </div>
      
      <h3 style="color:white; font-size:1.25rem; font-weight:800; margin-bottom:4px;">BELTEI Library Payment</h3>
      <p style="color:var(--text-muted); font-size:0.82rem; margin-bottom:16px;">Scan with Bakong or any Cambodian Banking App</p>

      <!-- KHQR Box -->
      <div style="background:white; border-radius:16px; padding:16px; max-width:240px; margin:0 auto 16px; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="background:#e11d48; color:white; font-weight:800; font-size:0.85rem; padding:4px 8px; border-radius:6px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; gap:4px;">
          <span>KHQR</span>
        </div>
        
        <!-- Simulated QR Pattern SVG -->
        <svg viewBox="0 0 160 160" style="width:100%; height:auto; display:block;">
          <rect width="160" height="160" fill="white"/>
          <rect x="10" y="10" width="40" height="40" fill="black"/>
          <rect x="18" y="18" width="24" height="24" fill="white"/>
          <rect x="24" y="24" width="12" height="12" fill="black"/>
          <rect x="110" y="10" width="40" height="40" fill="black"/>
          <rect x="118" y="18" width="24" height="24" fill="white"/>
          <rect x="124" y="24" width="12" height="12" fill="black"/>
          <rect x="10" y="110" width="40" height="40" fill="black"/>
          <rect x="18" y="118" width="24" height="24" fill="white"/>
          <rect x="24" y="124" width="12" height="12" fill="black"/>
          <!-- Data blocks -->
          <rect x="60" y="20" width="10" height="20" fill="black"/>
          <rect x="80" y="10" width="20" height="10" fill="black"/>
          <rect x="60" y="60" width="40" height="40" fill="#e11d48" rx="6"/>
          <circle cx="80" cy="80" r="12" fill="white"/>
          <text x="80" y="84" font-size="10" font-weight="bold" fill="#e11d48" text-anchor="middle">BELTEI</text>
          <rect x="20" y="60" width="10" height="30" fill="black"/>
          <rect x="110" y="60" width="20" height="10" fill="black"/>
          <rect x="130" y="80" width="20" height="20" fill="black"/>
          <rect x="60" y="120" width="30" height="10" fill="black"/>
          <rect x="110" y="110" width="10" height="30" fill="black"/>
          <rect x="130" y="130" width="20" height="10" fill="black"/>
        </svg>

        <div style="margin-top:10px; border-top:1px dashed #cbd5e1; padding-top:8px;">
          <div style="font-size:1.15rem; font-weight:800; color:#0f172a;">$${amount.toFixed(2)} USD</div>
          <div style="font-size:0.78rem; color:#64748b;">≈ ${khrAmount} KHR</div>
        </div>
      </div>

      <!-- App Badges -->
      <div style="display:flex; justify-content:center; gap:6px; flex-wrap:wrap; margin-bottom:18px;">
        <span style="background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-size:0.72rem; color:#cbd5e1;">Bakong</span>
        <span style="background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-size:0.72rem; color:#cbd5e1;">ABA Mobile</span>
        <span style="background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-size:0.72rem; color:#cbd5e1;">Wing</span>
        <span style="background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-size:0.72rem; color:#cbd5e1;">ACLEDA</span>
        <span style="background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-size:0.72rem; color:#cbd5e1;">Canadia</span>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button onclick="confirmFinePayment(${fineId})" style="width:100%; background:#10b981; color:white; border:0; padding:10px 18px; border-radius:8px; font-weight:700; font-size:0.9rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
          <span>✓</span> <span>Confirm Payment (Simulate Settlement)</span>
        </button>
        <button onclick="paymentDialog.close()" style="width:100%; background:transparent; color:#94a3b8; border:1px solid rgba(255,255,255,0.1); padding:8px 18px; border-radius:8px; font-size:0.82rem; cursor:pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;

  $('#paymentDialog').showModal();
};

// Confirm Single Fine Payment
window.confirmFinePayment = async fineId => {
  try {
    const res = await fetchJSON(`/portal/api/pay-fine/${fineId}`, { method: 'POST' });
    $('#paymentDialog').close();
    toast(currentLang === 'km' ? `ការទូទាត់ $${res.amount?.toFixed(2)} បានជោគជ័យ! បង្កាន់ដៃ #${res.receipt_number}` : `Payment of $${res.amount?.toFixed(2)} settled! Receipt #${res.receipt_number}`);
    loadPortalData();
  } catch (err) {
    $('#paymentDialog').close();
    toast(err.message || 'Payment failed', 'error');
  }
};

// Pay All Outstanding Fines
window.payAllFines = async () => {
  if (!confirm(currentLang === 'km' ? 'តើអ្នកពិតជាចង់ទូទាត់ប្រាក់ពិន័យទាំងអស់មែនទេ?' : 'Do you want to settle all outstanding fines now?')) return;
  try {
    const res = await fetchJSON('/portal/api/pay-all-fines', { method: 'POST' });
    toast(currentLang === 'km' ? `បានទូទាត់ប្រាក់ពិន័យសរុប $${res.total_paid?.toFixed(2)} រួចរាល់!` : `All fines totalling $${res.total_paid?.toFixed(2)} successfully settled!`);
    loadPortalData();
  } catch (err) {
    toast(err.message || 'Payment failed', 'error');
  }
};

// View Digital Receipt Modal
window.viewReceiptModal = (receiptNo, amount, reason, date) => {
  const memberName = memberData?.member?.name || 'Demo Library Member';
  const memberCode = memberData?.member?.code || 'MEM-DEMO';
  const modalSlot = $('#paymentDialogContent');

  modalSlot.innerHTML = `
    <div style="text-align:left; background:rgba(15,23,42,0.6); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
      <div style="text-align:center; border-bottom:1px dashed rgba(255,255,255,0.15); padding-bottom:14px; margin-bottom:14px;">
        <div style="font-size:0.75rem; font-weight:800; color:#60a5fa; letter-spacing:0.05em; text-transform:uppercase;">BELTEI INTERNATIONAL UNIVERSITY</div>
        <h3 style="color:white; font-size:1.15rem; font-weight:800; margin:2px 0;">Official Library Receipt</h3>
        <span style="background:rgba(16,185,129,0.2); color:#34d399; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:4px;">PAID / PAID IN FULL</span>
      </div>

      <div style="font-size:0.82rem; color:#cbd5e1; display:flex; flex-direction:column; gap:6px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between;"><span>Receipt Number:</span> <strong style="color:white;">${esc(receiptNo)}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Member Name:</span> <strong style="color:white;">${esc(memberName)}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Student ID:</span> <strong style="color:white;">${esc(memberCode)}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Settled Date:</span> <strong style="color:white;">${esc(date)}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Payment Method:</span> <strong style="color:#38bdf8;">Bakong KHQR (Digital)</strong></div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:10px; margin-bottom:16px;">
        <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:4px;">Description:</div>
        <div style="color:white; font-size:0.85rem; font-weight:600; margin-bottom:8px;">${esc(reason)}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:8px 12px; border-radius:8px;">
          <span style="font-weight:700; color:white;">Total Amount Paid:</span>
          <span style="font-size:1.2rem; font-weight:800; color:#34d399;">$${Number(amount).toFixed(2)} USD</span>
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        <button onclick="window.print()" style="flex:1; background:var(--primary-blue); color:white; border:0; padding:8px 14px; border-radius:6px; font-weight:600; font-size:0.82rem; cursor:pointer;">
          🖨️ Print Receipt
        </button>
        <button onclick="paymentDialog.close()" style="flex:1; background:transparent; color:#cbd5e1; border:1px solid rgba(255,255,255,0.15); padding:8px 14px; border-radius:6px; font-size:0.82rem; cursor:pointer;">
          Close
        </button>
      </div>
    </div>
  `;

  $('#paymentDialog').showModal();
};

// Render Notifications list (Notifications View)
function renderNotificationsList() {
  const box = $('#notificationsListContainer');
  if (!box) return;
  const notifs = memberData?.notifications || [];
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!notifs.length) {
    box.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        <h4 style="color:white; margin-bottom:4px;">${currentLang === 'km' ? 'មិនមានការជូនដំណឹងឡើយ' : 'No Notifications'}</h4>
        <p style="color:var(--text-muted); font-size:0.85rem;">${currentLang === 'km' ? 'អ្នកបានទទួលដំណឹងថ្មីៗទាំងអស់រួចរាល់ហើយ។' : 'You are up to date with all library notices.'}</p>
      </div>
    `;
    return;
  }

  box.innerHTML = notifs.map(n => {
    if (n.type === 'due_warning') {
      const daysLeft = n.days_left ?? 2;
      return `
        <div class="record-item" style="background:linear-gradient(135deg, rgba(245,158,11,0.14), rgba(15,23,42,0.85)); border-color:rgba(245,158,11,0.35); box-shadow:0 4px 20px rgba(245,158,11,0.1);">
          <div style="display:flex; gap:14px; align-items:flex-start; flex-wrap:wrap; justify-content:space-between;">
            <div style="display:flex; gap:14px; align-items:flex-start; flex:1; min-width:280px;">
              <div style="width:40px; height:40px; border-radius:10px; background:rgba(245,158,11,0.25); display:flex; align-items:center; justify-content:center; color:#fbbf24; flex-shrink:0; font-size:1.2rem;">
                ⏳
              </div>
              <div>
                <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px; flex-wrap:wrap;">
                  <span style="background:#f59e0b; color:#0f172a; font-weight:800; font-size:0.72rem; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                    ${currentLang === 'km' ? `នៅសល់ ${daysLeft} ថ្ងៃទៀត` : `${daysLeft} Days Remaining`}
                  </span>
                  <strong style="color:white; font-size:1.02rem;">${esc(n.title)}</strong>
                </div>
                <p style="font-size:0.86rem; color:#e2e8f0; line-height:1.45; white-space:pre-line; margin-bottom:10px;">${esc(n.message)}</p>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                  <button class="btn-card-action" onclick="renewLoan(${n.book_id})" style="background:#f59e0b; border-color:#f59e0b; color:#0f172a; font-weight:700; padding:6px 14px; font-size:0.8rem;">
                    🔄 ${currentLang === 'km' ? 'ស្នើសុំពន្យារពេល (+៧ ថ្ងៃ)' : 'Renew (+7 Days)'}
                  </button>
                  <button class="btn-card-action" onclick="openBookModal(${n.book_id})" style="padding:6px 14px; font-size:0.8rem;">
                    📖 ${currentLang === 'km' ? 'មើលសៀវភៅ' : 'View Book'}
                  </button>
                </div>
              </div>
            </div>
            <small style="color:#fbbf24; font-weight:600;">${esc(n.date || 'Today')}</small>
          </div>
        </div>
      `;
    }

    if (n.type === 'overdue') {
      return `
        <div class="record-item" style="background:linear-gradient(135deg, rgba(239,68,68,0.14), rgba(15,23,42,0.85)); border-color:rgba(239,68,68,0.35); box-shadow:0 4px 20px rgba(239,68,68,0.1);">
          <div style="display:flex; gap:14px; align-items:flex-start; flex-wrap:wrap; justify-content:space-between;">
            <div style="display:flex; gap:14px; align-items:flex-start; flex:1; min-width:280px;">
              <div style="width:40px; height:40px; border-radius:10px; background:rgba(239,68,68,0.25); display:flex; align-items:center; justify-content:center; color:#f87171; flex-shrink:0; font-size:1.2rem;">
                🚨
              </div>
              <div>
                <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px; flex-wrap:wrap;">
                  <span style="background:#ef4444; color:white; font-weight:800; font-size:0.72rem; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                    ${currentLang === 'km' ? 'ហួសកំណត់សង' : 'Overdue Alert'}
                  </span>
                  <strong style="color:white; font-size:1.02rem;">${esc(n.title)}</strong>
                </div>
                <p style="font-size:0.86rem; color:#e2e8f0; line-height:1.45; white-space:pre-line; margin-bottom:10px;">${esc(n.message)}</p>
                <button class="btn-card-action" onclick="navigateTo('loans')" style="background:#ef4444; border-color:#ef4444; color:white; padding:6px 14px; font-size:0.8rem;">
                  🏛️ ${currentLang === 'km' ? 'ពិនិត្យមើលកាលបរិច្ឆេទសង' : 'View Loan Due Date'}
                </button>
              </div>
            </div>
            <small style="color:#f87171; font-weight:700;">${esc(n.date || 'Urgent')}</small>
          </div>
        </div>
      `;
    }

    return `
      <div class="record-item">
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:4px;">
          <span style="width:8px; height:8px; border-radius:50%; background:${n.is_read ? '#64748b' : '#3b82f6'};"></span>
          <strong style="color:white; font-size:0.95rem;">${esc(n.title)}</strong>
          <small style="color:var(--text-muted); margin-left:auto;">${esc(n.date || 'Recent')}</small>
        </div>
        <p style="font-size:0.85rem; color:var(--text-body); margin-left:18px;">${esc(n.message)}</p>
      </div>
    `;
  }).join('');
}

// Renew Loan Handler (+7 Days)
window.renewLoan = async bookId => {
  const loan = memberData?.loans?.find(l => l.book_id === bookId) || memberData?.loans?.[0];
  if (!loan) {
    toast('No active loan found to renew', 'error');
    return;
  }

  try {
    const res = await fetchJSON(`/portal/api/loans/${loan.id}/renew`, { method: 'POST' });
    toast(currentLang === 'km' ? `សៀវភៅត្រូវបានពន្យារពេល ៧ ថ្ងៃជោគជ័យ! ថ្ងៃសងថ្មីគឺ ${res.new_due_date}` : `Loan renewed +7 days successfully! New due date is ${res.new_due_date}`);
    loadPortalData();
  } catch (err) {
    toast(err.message || 'Renewal failed', 'error');
  }
};

// Mark All Notifications as Read
window.markAllNotificationsRead = async () => {
  try {
    await fetchJSON('/portal/api/notifications/mark-all-read', { method: 'POST' });
    toast(currentLang === 'km' ? 'បានកត់សម្គាល់ការជូនដំណឹងទាំងអស់ថាបានអាន!' : 'All notifications marked as read!');
    loadPortalData();
  } catch (err) {
    toast(err.message || 'Failed to update notifications', 'error');
  }
};

// Carousel scroll helper
window.scrollCarousel = direction => {
  const container = $('#recommendedBooksGrid');
  if (!container) return;
  container.scrollBy({ left: direction * 300, behavior: 'smooth' });
};

// Toggle collapsible sidebar nav group
window.toggleNavGroup = groupId => {
  const group = $('#' + groupId);
  if (group) group.classList.toggle('active');
};

// Language Dropdown Setup
const langDropdown = $('#langSwitchDropdown');
const langBtn = $('#langSwitchBtn');
if (langBtn && langDropdown) {
  langBtn.onclick = e => {
    e.stopPropagation();
    langDropdown.classList.toggle('open');
  };
  document.addEventListener('click', e => {
    if (!langDropdown.contains(e.target)) {
      langDropdown.classList.remove('open');
    }
  });
}

// User Menu Dropdown Setup
const userMenuBtn = $('#userMenuBtn');
const userDropdownCard = $('#userDropdownCard');
if (userMenuBtn && userDropdownCard) {
  userMenuBtn.onclick = e => {
    e.stopPropagation();
    userDropdownCard.classList.toggle('show');
  };
  document.addEventListener('click', e => {
    if (!userMenuBtn.contains(e.target)) {
      userDropdownCard.classList.remove('show');
    }
  });
}

// Toast helper
function toast(message, type = 'info') {
  const t = $('#toast');
  if (!t) return;
  const icon = type === 'error' ? '⚠️' : '✅';
  t.innerHTML = `<span>${icon}</span> <span>${esc(message)}</span>`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Fetch helper
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  const data = await res.json().catch(() => ({ detail: 'Request failed' }));
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

// Load Books and Member Data from Backend
async function loadPortalData() {
  try {
    const [booksData, meData] = await Promise.all([
      fetchJSON('/portal/api/books').catch(() => DEFAULT_RECOMMENDED),
      fetchJSON('/portal/api/me').catch(() => null)
    ]);

    allBooks = (booksData && booksData.length) ? booksData : DEFAULT_RECOMMENDED;
    displayedBooks = [...allBooks];
    memberData = meData;

    renderRecommendedBooks();
    renderBrowseBooks();

    // Update KPI Metrics dynamically
    $('#kpiTotalBooks').textContent = allBooks.length || '259';
    
    if (meData) {
      if (meData.loans) {
        $('#kpiBorrowed').textContent = meData.loans.length;
        const dueSoonCount = meData.loans.filter(l => l.days_left <= 3).length;
        $('#kpiDueSoon').textContent = dueSoonCount || '1';
      }
      if (meData.reservations) {
        $('#kpiReserved').textContent = meData.reservations.length;
      }
      if (meData.notifications) {
        const unread = meData.notifications.filter(n => !n.is_read).length;
        $('#notifBubble').textContent = unread || '2';
      }
    }

    // Render active tab views if already open
    renderLoansList();
    renderRequestsList();
    renderReservationsList();
    renderHistoryList();
    renderFinesView();
    renderNotificationsList();

    // Auto-open application form if redirected after login with ?borrow_book=id
    if (window.autoBorrowBookId && window.isMemberLoggedIn) {
      setTimeout(() => {
        openBorrowApplicationForm(Number(window.autoBorrowBookId));
      }, 350);
    }
  } catch (err) {
    console.error('Portal data load error:', err);
  }
}

// Global top search handling
$('#globalSearchForm').onsubmit = e => {
  e.preventDefault();
  const q = $('#portalSearchInput').value.trim();
  browseSearchQuery = q;
  const bInput = $('#browseSearchInput');
  if (bInput) bInput.value = q;
  navigateTo('browse');
};

// Bind category chips clicks on Dashboard
$$('.cat-card').forEach(card => {
  card.onclick = () => {
    filterCategory(card.dataset.cat);
  };
});

// Explicit Dropdown Toggle Handlers
window.toggleUserDropdown = (e) => {
  if (e) e.stopPropagation();
  const btn = $('#userMenuBtn');
  if (btn) btn.classList.toggle('open');
};

window.toggleLangDropdown = (e) => {
  if (e) e.stopPropagation();
  const drop = $('#langSwitchDropdown');
  if (drop) drop.classList.toggle('open');
};

// Global click outside to dismiss open dropdowns
window.addEventListener('click', (e) => {
  const userBtn = $('#userMenuBtn');
  if (userBtn && !userBtn.contains(e.target)) {
    userBtn.classList.remove('open');
  }
  const langDrop = $('#langSwitchDropdown');
  if (langDrop && !langDrop.contains(e.target)) {
    langDrop.classList.remove('open');
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  loadPortalData();

  if (window.location.hash) {
    const tab = window.location.hash.replace('#', '');
    if (tab) navigateTo(tab);
  }
});

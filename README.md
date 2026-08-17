# BELTEI Library — Library Admin Dashboard

A world-class library management admin dashboard built with **Python FastAPI**, featuring a premium glassmorphism UI inspired by Apple, Vercel, Linear, and Stripe.

## Features

| # | Feature | Khmer |
|---|---------|-------|
| 1 | Book catalog management | គ្រប់គ្រងព័ត៌មានសៀវភៅ |
| 2 | Member management (students, teachers, staff) | គ្រប់គ្រងសមាជិក |
| 3 | Book registration & editing | ចុះបញ្ជី/កែប្រែសៀវភៅ |
| 4 | Borrow & return tracking | ខ្ចី និងសងសៀវភៅ |
| 5 | Book status (available, borrowed, lost, damaged) | តាមដានស្ថានភាព |
| 6 | Search by title, author, category, ISBN | ស្វែងរកសៀវភៅ |
| 7 | Category management | ប្រភេទសៀវភៅ |
| 8 | Book copies & inventory | ច្បាប់ចម្លង |
| 9 | Automatic fine calculation | គណនាពិន័យ |
| 10 | Due date notifications | ជូនដំណឹង |
| 11 | Borrow/return history | ប្រវត្តិការខ្ចី |
| 12 | Most borrowed books report | របាយការណ៍ខ្ចីញឹកញាប់ |
| 13 | Damaged/lost/repair report | របាយការណ៍ខូច/បាត់ |
| 14 | Members with borrows/fines report | របាយការណ៍សមាជិក |
| 15 | Authors & publishers | អ្នកនិពន្ធ/អ្នកបោះពុម្ព |
| 16 | Book reservations | ការកក់សៀវភៅ |
| 17 | Role-based access control | RBAC |
| 18 | Digital records (no paper) | កាត់បន្ថយឯកសារក្រដាស |
| 19 | Analytics dashboard | Dashboard |
| 20 | Data-driven management | ទិន្នន័យវិភាគ |

## Data Dictionary

The following data dictionary documents the core tables used by the Library Management System.

### 1. roles

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| role_id | INT | 11 | PK | លេខសម្គាល់តួនាទី |
| role_name | VARCHAR | 50 |  | Admin / Librarian |

### 2. users

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| user_id | INT | 11 | PK | លេខសម្គាល់អ្នកប្រើប្រាស់ |
| role_id | INT | 11 | FK | ភ្ជាប់ទៅ Table roles |
| full_name | VARCHAR | 100 |  | ឈ្មោះពេញ |
| gender | VARCHAR | 10 |  | ភេទ |
| phone | VARCHAR | 20 |  | លេខទូរស័ព្ទ |
| email | VARCHAR | 100 | UNIQUE | អ៊ីមែល |
| username | VARCHAR | 50 | UNIQUE | ឈ្មោះ Login |
| password | VARCHAR | 255 |  | លេខសម្ងាត់ |
| status | VARCHAR | 20 |  | Active / Inactive |
| created_at | TIMESTAMP |  |  | ថ្ងៃបង្កើត |

### 3. categories

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| category_id | INT | 11 | PK | លេខសម្គាល់ប្រភេទសៀវភៅ |
| category_name | VARCHAR | 100 |  | ឈ្មោះប្រភេទសៀវភៅ |
| description | TEXT |  |  | ព័ត៌មានបន្ថែម |
| status | VARCHAR | 20 |  | Active / Inactive |

### 4. authors

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| author_id | INT | 11 | PK | លេខសម្គាល់អ្នកនិពន្ធ |
| author_name | VARCHAR | 100 |  | ឈ្មោះអ្នកនិពន្ធ |
| biography | TEXT |  |  | ប្រវត្តិអ្នកនិពន្ធ |

### 5. publishers

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| publisher_id | INT | 11 | PK | លេខសម្គាល់អ្នកបោះពុម្ព |
| publisher_name | VARCHAR | 100 |  | ឈ្មោះអ្នកបោះពុម្ព |
| phone | VARCHAR | 20 |  | លេខទូរស័ព្ទ |
| address | TEXT |  |  | អាសយដ្ឋាន |

### 6. books

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| book_id | INT | 11 | PK | លេខសម្គាល់សៀវភៅ |
| category_id | INT | 11 | FK | ភ្ជាប់ទៅ Table categories |
| author_id | INT | 11 | FK | ភ្ជាប់ទៅ Table authors |
| publisher_id | INT | 11 | FK | ភ្ជាប់ទៅ Table publishers |
| book_title | VARCHAR | 150 |  | ចំណងជើងសៀវភៅ |
| isbn | VARCHAR | 50 | UNIQUE | លេខ ISBN |
| edition | VARCHAR | 50 |  | លើកបោះពុម្ព |
| publish_year | INT | 4 |  | ឆ្នាំបោះពុម្ព |
| total_copies | INT | 11 |  | ចំនួនសៀវភៅសរុប |
| available_copies | INT | 11 |  | ចំនួនសៀវភៅនៅសល់ |
| shelf_location | VARCHAR | 50 |  | ទីតាំងដាក់សៀវភៅ |
| status | VARCHAR | 20 |  | Available / Unavailable |

### 7. members

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| member_id | INT | 11 | PK | លេខសម្គាល់សមាជិក |
| member_code | VARCHAR | 50 | UNIQUE | លេខកូដសមាជិក |
| full_name | VARCHAR | 100 |  | ឈ្មោះសមាជិក |
| gender | VARCHAR | 10 |  | ភេទ |
| phone | VARCHAR | 20 |  | លេខទូរស័ព្ទ |
| email | VARCHAR | 100 |  | អ៊ីមែល |
| address | TEXT |  |  | អាសយដ្ឋាន |
| member_type | VARCHAR | 50 |  | Student / Teacher / General |
| registered_date | DATE |  |  | ថ្ងៃចុះឈ្មោះ |
| status | VARCHAR | 20 |  | Active / Inactive |

### 8. borrow_records

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| borrow_id | INT | 11 | PK | លេខសម្គាល់ការខ្ចី |
| member_id | INT | 11 | FK | ភ្ជាប់ទៅ Table members |
| book_id | INT | 11 | FK | ភ្ជាប់ទៅ Table books |
| borrow_date | DATE |  |  | ថ្ងៃខ្ចីសៀវភៅ |
| due_date | DATE |  |  | ថ្ងៃកំណត់សង |
| return_date | DATE |  |  | ថ្ងៃបង្វិលសង |
| borrow_status | VARCHAR | 20 |  | Borrowed / Returned / Overdue |
| issued_by | INT | 11 | FK | Librarian ដែលចេញសៀវភៅ |
| received_by | INT | 11 | FK | Librarian ដែលទទួលសៀវភៅសង |

### 9. fines

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| fine_id | INT | 11 | PK | លេខសម្គាល់ពិន័យ |
| borrow_id | INT | 11 | FK | ភ្ជាប់ទៅ Table borrow_records |
| member_id | INT | 11 | FK | ភ្ជាប់ទៅ Table members |
| fine_amount | DECIMAL | 10,2 |  | ចំនួនប្រាក់ពិន័យ |
| fine_reason | VARCHAR | 100 |  | Late Return / Lost Book / Damaged Book |
| payment_status | VARCHAR | 20 |  | Unpaid / Paid |
| paid_date | DATE |  |  | ថ្ងៃបង់ពិន័យ |

### 10. notifications

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| notification_id | INT | 11 | PK | លេខសម្គាល់ Notification |
| member_id | INT | 11 | FK | សមាជិកដែលទទួលដំណឹង |
| title | VARCHAR | 150 |  | ចំណងជើងសារ |
| message | TEXT |  |  | ខ្លឹមសារ |
| notification_type | VARCHAR | 50 |  | Due Date / Overdue / Fine |
| is_read | BOOLEAN |  |  | បានអានឬនៅ |
| created_at | TIMESTAMP |  |  | ថ្ងៃបង្កើត |

### 11. reports

| Field Name | Data Type | Size | Key | Description |
| ---------- | --------- | ---- | --- | ----------- |
| report_id | INT | 11 | PK | លេខសម្គាល់របាយការណ៍ |
| report_type | VARCHAR | 50 |  | Book / Borrow / Return / Fine |
| report_date | DATE |  |  | កាលបរិច្ឆេទ Report |
| generated_by | INT | 11 | FK | User ដែលបង្កើត Report |
| file_path | VARCHAR | 255 |  | ទីតាំង File Report |
| created_at | TIMESTAMP |  |  | ថ្ងៃបង្កើត |

## Quick Start

```bash
cd library-admin-dashboard
pip install -r requirements.txt
python run.py
```

Open **http://localhost:8000** in your browser.

## Default Users

| Username | Role | Password |
|----------|------|----------|
| admin | Administrator | admin123 |
| librarian | Librarian | lib123 |

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite
- **Frontend:** HTML5, CSS3 (glassmorphism), Chart.js, vanilla JS
- **Design:** Inter typography, 16px radius, soft gradients, smooth animations

## API

REST API available at `/api/*` — books, members, borrowings, reports, fines, reservations, and more.

## Project Structure

```
library-admin-dashboard/
├── app/
│   ├── main.py          # FastAPI application
│   ├── models.py        # Database models
│   ├── routers/api.py   # REST endpoints
│   ├── services/        # Business logic
│   └── seed.py          # Sample data
├── static/              # CSS & JS
├── templates/           # HTML templates
└── run.py               # Dev server
```

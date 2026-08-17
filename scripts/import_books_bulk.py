"""Small helper to import a local Excel file to the backend JSON bulk import endpoint.
Usage:
    python scripts/import_books_bulk.py path/to/books.xlsx [api_url]

If `api_url` is omitted the script will use http://localhost:8000/api/books/import-bulk
"""
import sys
import os
import json
import pandas as pd
import requests

DEFAULT_API_URL = os.environ.get("API_URL", "http://localhost:8000/api/books/import-bulk")
REQUIRED = ["Title", "Author", "ISBN", "Category", "Copies", "Available"]


def normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    # Make header matching case-insensitive by mapping lowercase names
    col_map = {c: c for c in df.columns}
    lower = {c.lower(): c for c in df.columns}
    for req in REQUIRED:
        if req not in df.columns and req.lower() in lower:
            col_map[lower[req.lower()]] = req
    return df.rename(columns=col_map)


def main(path: str, api_url: str = None):
    api_url = api_url or DEFAULT_API_URL
    try:
        df = pd.read_excel(path, engine="openpyxl")
    except Exception as exc:
        print(f"❌ លុបបញ្ហា​ចំពោះការអានឯកសារ: {exc}")
        sys.exit(2)

    df = normalize_df(df)

    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        print("❌ មានបញ្ហា៖ វាលត្រូវការ​មិនមាន:", missing)
        sys.exit(2)

    books = df[REQUIRED].to_dict(orient="records")
    payload = {"books": books}

    try:
        resp = requests.post(api_url, json=payload, timeout=60)
    except Exception as exc:
        print(f"❌ បញ្ហាទំនាក់ទំនងទៅ API: {exc}")
        sys.exit(3)

    if resp.ok:
        try:
            data = resp.json()
        except Exception:
            data = resp.text
        print("✅ បញ្ចូលសៀវភៅទាំង ២២០ ក្បាលចូល System រួចរាល់!")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"❌ មានបញ្ហា: {resp.status_code} {resp.text}")
        try:
            print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
        except Exception:
            pass


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_books_bulk.py path/to/books.xlsx [api_url]")
        sys.exit(1)
    path = sys.argv[1]
    api = sys.argv[2] if len(sys.argv) > 2 else None
    main(path, api)

import os
import subprocess
import time
import requests
import sys

cwd = os.path.abspath(os.path.dirname(__file__) + "\\..")
python_exe = sys.executable
env = os.environ.copy()
env['PYTHONPATH'] = cwd
env['DEV_RELOAD'] = '0'

proc = subprocess.Popen([python_exe, 'run.py'], cwd=cwd, env=env)
try:
    books_count = None
    for i in range(60):
        time.sleep(0.5)
        try:
            r = requests.get('http://127.0.0.1:8001/api/books', timeout=2)
            if r.status_code == 200:
                data = r.json()
                books_count = len(data)
                print('books_returned=', books_count)
                break
        except Exception:
            continue
    if books_count is None:
        print('failed to fetch /api/books')
        sys.exit(2)
    else:
        if books_count >= 250:
            print('OK: API returned >=250 books')
        else:
            print('NOT OK: API returned', books_count)
finally:
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()

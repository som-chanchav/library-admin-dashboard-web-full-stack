import os
import uvicorn


def str2bool(v: str | None) -> bool:
    if v is None:
        return False
    return str(v).strip().lower() not in ("0", "false", "no", "off")


if __name__ == "__main__":
    # Allow disabling the reloader via DEV_RELOAD=0 in environments where
    # the WatchFiles reloader causes shutdown races (Windows watchers).
    reload_flag = str2bool(os.environ.get("DEV_RELOAD", "1"))
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))

    # Check port availability and try a small range if the requested port is in use.
    import socket

    def find_available_port(start, max_tries=10):
        for p in range(start, start + max_tries):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                try:
                    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                    sock.bind((host, p))
                    return p
                except OSError:
                    continue
        return None

    available_port = find_available_port(port, max_tries=20)
    if available_port is None:
        print(f"No available port found starting at {port}")
    else:
        if available_port != port:
            print(f"Port {port} unavailable, using {available_port} instead.")
        try:
            uvicorn.run("app.main:app", host=host, port=available_port, reload=reload_flag)
        except KeyboardInterrupt:
            # graceful exit
            pass

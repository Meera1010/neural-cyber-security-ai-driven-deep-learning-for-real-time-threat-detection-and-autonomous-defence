import http.server
import socketserver
import webbrowser
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://127.0.0.1:{PORT}/demo_phishing.html"
        print(f"\n=======================================================")
        print(f" Neural Cyber Security - Live Local Test Server")
        print(f"=======================================================")
        print(f" Server running at: http://127.0.0.1:{PORT}")
        print(f" 1. Simulated Phishing Page : http://127.0.0.1:{PORT}/demo_phishing.html")
        print(f" 2. Model Accuracy Benchmark: http://127.0.0.1:{PORT}/test.html")
        print(f"=======================================================\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

import http.server
import socketserver
import json
import csv
from urllib.parse import urlparse, parse_qs
import os

# --- 設定 ---
PORT = 8000
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.csv')

# --- CSVをパースして辞書のリストに変換する関数 ---
def parse_csv_to_users(file_path):
    users = []
    # Pythonのcp932デコーダーは0x5Cを'\'(U+005C)に変換するため、
    # 読み込んだ後に'\'をHTMLエンティティ'&yen;'に置換する。
    with open(file_path, 'r', encoding='cp932') as f:
        reader = csv.DictReader(f)
        for row in reader:
            processed_row = {}
            for key, value in row.items():
                processed_row[key] = value.replace('\\', '&yen;')
            users.append(processed_row)
    return users


# --- HTTPリクエストを処理するハンドラ ---
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # 親クラスのコンストラクタを呼ぶ際に、公開ディレクトリを指定
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        # URLをパース
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query = parse_qs(parsed_path.query)

        # APIリクエストの処理
        if path == '/api':
            try:
                users = parse_csv_to_users(DATA_FILE)
                api_type = query.get('api', ['users-utf8'])[0]

                if api_type == 'users-sjis':
                    # Shift-JISでレスポンス（適切なヘッダー付き）
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json; charset=Shift_JIS')
                    self.send_header('Access-Control-Allow-Origin', '*') # CORS
                    self.end_headers()
                    
                    json_utf8 = json.dumps(users, ensure_ascii=False)
                    json_sjis = json_utf8.encode('cp932')
                    self.wfile.write(json_sjis)
                elif api_type == 'users-sjis-no-header':
                    # Shift-JISでレスポンス（不適切なヘッダー - overrideMimeTypeテスト用）
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')  # charsetなし
                    self.send_header('Access-Control-Allow-Origin', '*') # CORS
                    self.end_headers()
                    
                    json_utf8 = json.dumps(users, ensure_ascii=False)
                    json_sjis = json_utf8.encode('cp932')
                    self.wfile.write(json_sjis)
                else:
                    # UTF-8でレスポンス
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json; charset=UTF-8')
                    self.send_header('Access-Control-Allow-Origin', '*') # CORS
                    self.end_headers()

                    json_utf8 = json.dumps(users, ensure_ascii=False)
                    self.wfile.write(json_utf8.encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json; charset=UTF-8')
                self.end_headers()
                error_json = json.dumps({'error': str(e)})
                self.wfile.write(error_json.encode('utf-8'))
            return

        # APIリクエスト以外は、通常の静的ファイル配信に任せる
        super().do_GET()

# --- サーバーの起動 ---
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    print(f"Document root: {PUBLIC_DIR}")
    print("Press Ctrl+C to stop.")
    httpd.serve_forever()

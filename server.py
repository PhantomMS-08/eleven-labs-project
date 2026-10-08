import http.server
import urllib.request
import urllib.error
import json
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def load_dotenv():
    env_file = os.path.join(DIRECTORY, ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip('"').strip("'")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

load_dotenv()
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")

class NarutoTTSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, xi-api-key")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/tts":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            
            try:
                data = json.loads(body_bytes.decode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON body", "detail": str(e)}).encode("utf-8"))
                return

            voice_id = data.get("voice_id", "pNInz6obpgDQGcFmaJgB")
            text = data.get("text", "").strip()
            model_id = data.get("model_id", "eleven_multilingual_v2")
            voice_settings = data.get("voice_settings", {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.35,
                "use_speaker_boost": True
            })
            api_key = data.get("api_key") or self.headers.get("xi-api-key") or ELEVENLABS_API_KEY

            if not api_key:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing ElevenLabs API key. Please configure it in .env or the UI."}).encode("utf-8"))
                return

            if not text:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Text is required"}).encode("utf-8"))
                return

            eleven_url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            payload = json.dumps({
                "text": text,
                "model_id": model_id,
                "voice_settings": voice_settings
            }).encode("utf-8")

            req = urllib.request.Request(
                eleven_url,
                data=payload,
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg"
                },
                method="POST"
            )

            try:
                with urllib.request.urlopen(req, timeout=45) as resp:
                    audio_content = resp.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "audio/mpeg")
                    self.send_header("Content-Length", str(len(audio_content)))
                    self.send_header("Cache-Control", "no-cache")
                    self.end_headers()
                    self.wfile.write(audio_content)
            except urllib.error.HTTPError as http_err:
                err_body = http_err.read().decode("utf-8", errors="replace")
                print(f"[ElevenLabs HTTP Error {http_err.code}]: {err_body}")
                self.send_response(http_err.code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(err_body.encode("utf-8"))
            except Exception as ex:
                print(f"[Server Error]: {str(ex)}")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(ex)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "online",
                "characters": ["Madara Uchiha", "Sasuke Uchiha", "Naruto Uzumaki", "Tobi / Obito", "Kakashi Hatake"],
                "languages": ["English", "Hindi"],
                "model": "eleven_multilingual_v2"
            }).encode("utf-8"))
            return
        
        return super().do_GET()

def run_server():
    server_class = http.server.ThreadingHTTPServer
    server_class.allow_reuse_address = True
    port = PORT
    for p in range(PORT, PORT + 20):
        try:
            httpd = server_class(("", p), NarutoTTSHandler)
            print(f"\n=======================================================")
            print(f"  NARUTO SHIPPUDEN TTS JUTSU SERVER ACTIVE")
            print(f"  Url: http://localhost:{p}")
            print(f"=======================================================\n")
            sys.stdout.flush()
            httpd.serve_forever()
            break
        except OSError as e:
            if "address already in use" in str(e).lower() or e.errno == 10048:
                continue
            else:
                raise e

if __name__ == "__main__":
    run_server()

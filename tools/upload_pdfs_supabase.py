import argparse
import json
import mimetypes
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = ROOT / "output" / "pdf"
STATE_PATH = ROOT / "output" / "supabase_pdf_upload_manifest.json"
CHUNK_THRESHOLD = 45 * 1024 * 1024
CHUNK_SIZE = 20 * 1024 * 1024
DEFAULT_BUDGET = 940 * 1024 * 1024


def log(message):
    print(message, flush=True)


def normalize_text(value):
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode("ascii")
    return " ".join(value.strip().lower().split())


def slugify(value):
    return normalize_text(value).replace(" ", "-") or "archivo"


def load_config():
    text = (ROOT / "js" / "config.js").read_text(encoding="utf-8")
    url_match = re.search(r"https://[a-z0-9]+\.supabase\.co", text)
    key_match = re.search(r"sb_publishable_[A-Za-z0-9_-]+", text)
    if not url_match or not key_match:
        raise RuntimeError("No se encontró la configuración de Supabase.")
    return url_match.group(0), key_match.group(0)


class Api:
    def __init__(self, url, anon_key, email, password):
        self.url = url.rstrip("/")
        self.anon_key = anon_key
        self.access_token = self._login(email, password)

    def _login(self, email, password):
        body = {"email": email, "password": password}
        result = self.request(
            "POST",
            "/auth/v1/token?grant_type=password",
            body=body,
            authenticated=False,
        )
        token = result.get("access_token")
        if not token:
            raise RuntimeError("Supabase no devolvió una sesión válida.")
        return token

    def request(self, method, path, body=None, headers=None, authenticated=True, raw=False, timeout=180):
        request_headers = {"apikey": self.anon_key}
        if authenticated:
            request_headers["Authorization"] = f"Bearer {self.access_token}"
        if headers:
            request_headers.update(headers)
        data = body
        if body is not None and not isinstance(body, (bytes, bytearray)):
            data = json.dumps(body, ensure_ascii=False).encode("utf-8")
            request_headers.setdefault("Content-Type", "application/json")
        request = urllib.request.Request(
            self.url + path,
            data=data,
            headers=request_headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                payload = response.read()
                if raw:
                    return payload
                if not payload:
                    return None
                return json.loads(payload.decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"HTTP {error.code} {method} {path}: {detail[:600]}") from error

    def rest(self, method, table, query="", body=None, prefer=None):
        headers = {}
        if prefer:
            headers["Prefer"] = prefer
        return self.request(method, f"/rest/v1/{table}{query}", body=body, headers=headers)

    def upload(self, bucket, object_path, data, content_type):
        encoded = urllib.parse.quote(object_path, safe="/")
        return self.request(
            "POST",
            f"/storage/v1/object/{bucket}/{encoded}",
            body=data,
            headers={"Content-Type": content_type, "x-upsert": "true"},
            timeout=300,
        )

    def list_folder(self, bucket, prefix=""):
        encoded_bucket = urllib.parse.quote(bucket, safe="")
        return self.request(
            "POST",
            f"/storage/v1/object/list/{encoded_bucket}",
            body={"prefix": prefix, "limit": 1000, "offset": 0, "sortBy": {"column": "name", "order": "asc"}},
        ) or []

    def storage_usage(self, bucket):
        total = 0
        files = 0
        stack = [""]
        visited = set()
        while stack:
            prefix = stack.pop()
            if prefix in visited:
                continue
            visited.add(prefix)
            for item in self.list_folder(bucket, prefix):
                name = item.get("name", "")
                full_path = f"{prefix}/{name}".strip("/")
                metadata = item.get("metadata")
                if item.get("id") is None and metadata is None:
                    stack.append(full_path)
                    continue
                size = int((metadata or {}).get("size") or 0)
                total += size
                files += 1
        return total, files


@dataclass
class UploadTask:
    series: str
    manga_title: str
    manga_normalized: str
    manga_author: str
    manga_synopsis: str
    manga_direction: str
    file_path: Path
    title: str
    normalized_title: str
    chapters_label: str
    normalized_pdf_name: str
    chapter: int | None = None

    @property
    def size(self):
        return self.file_path.stat().st_size


CLASSROOM_PARTS = [
    (1, 4, 142, "classroom-of-the-elite-capitulos-01-04.pdf"),
    (5, 9, 140, "classroom-of-the-elite-capitulos-05-09.pdf"),
    (10, 14, 181, "classroom-of-the-elite-capitulos-10-14.pdf"),
    (15, 18, 153, "classroom-of-the-elite-capitulos-15-18.pdf"),
    (19, 22, 144, "classroom-of-the-elite-capitulos-19-22.pdf"),
    (23, 27, 140, "classroom-of-the-elite-capitulos-23-27.pdf"),
    (28, 32, 154, "classroom-of-the-elite-capitulos-28-32.pdf"),
    (33, 38, 173, "classroom-of-the-elite-capitulos-33-38.pdf"),
    (39, 45, 172, "classroom-of-the-elite-capitulos-39-45.pdf"),
    (46, 52, 161, "classroom-of-the-elite-capitulos-46-52.pdf"),
    (53, 60, 152, "classroom-of-the-elite-capitulos-53-60.pdf"),
    (61, 70, 160, "classroom-of-the-elite-capitulos-61-70.pdf"),
    (71, 72, 24, "classroom-of-the-elite-capitulos-71-72.pdf"),
    (73, 73, 12, "classroom-of-the-elite-capitulo-73.pdf"),
]


def make_tasks():
    tasks = []
    ln_dir = PDF_ROOT / "classroom-of-the-elite-light-novel"
    for file_path in sorted(ln_dir.rglob("*.pdf")):
        match = re.search(r"year-(\d+)-volume-(\d+(?:-\d+)?)\.pdf$", file_path.name)
        if not match:
            continue
        year = int(match.group(1))
        raw_number = match.group(2)
        pieces = raw_number.split("-")
        whole = str(int(pieces[0]))
        number = whole if len(pieces) == 1 else f"{whole}.{pieces[1]}"
        title = f"Volumen {number}"
        language = "Inglés" if year == 1 and number in {"0", "1", "2"} else "Español"
        tasks.append(UploadTask(
            series="classroom-light-novel",
            manga_title="Classroom of the Elite - Novela ligera",
            manga_normalized="classroom of the elite novela ligera",
            manga_author="Shogo Kinugasa / Shunsaku Tomose",
            manga_synopsis="Novela ligera de Classroom of the Elite organizada en Año 1, Año 2 y Año 3.",
            manga_direction="ltr",
            file_path=file_path,
            title=title,
            normalized_title=normalize_text(f"Año {year} {title}"),
            chapters_label=f"Año {year} · {language}",
            normalized_pdf_name=normalize_text(file_path.name),
        ))

    manga_dir = PDF_ROOT / "classroom-of-the-elite"
    for first, last, pages, filename in CLASSROOM_PARTS:
        title = f"Capítulo {first}" if first == last else f"Capítulos {first} al {last}"
        tasks.append(UploadTask(
            series="classroom-manga",
            manga_title="Classroom of the Elite",
            manga_normalized="classroom of the elite",
            manga_author="Shogo Kinugasa / Yuyu Ichino",
            manga_synopsis="Colección de manga con los capítulos 1 al 73.",
            manga_direction="rtl",
            file_path=manga_dir / filename,
            title=title,
            normalized_title=normalize_text(title),
            chapters_label=f"{title} · {pages} páginas",
            normalized_pdf_name=normalize_text(filename),
            chapter=first,
        ))

    my_hero_dir = PDF_ROOT / "my-hero-academia"
    for file_path in my_hero_dir.glob("*.pdf"):
        match = re.search(r"volume-(\d+)\.pdf$", file_path.name)
        if not match:
            continue
        number = int(match.group(1))
        tasks.append(UploadTask(
            series="my-hero-academia",
            manga_title="My Hero Academia",
            manga_normalized="my hero academia",
            manga_author="Kohei Horikoshi",
            manga_synopsis="Colección completa de My Hero Academia, tomos 1 al 42.",
            manga_direction="rtl",
            file_path=file_path,
            title=f"Tomo {number}",
            normalized_title=normalize_text(f"Tomo {number}"),
            chapters_label="",
            normalized_pdf_name=normalize_text(file_path.name),
        ))
    return tasks


def ensure_manga(api, task):
    query = "?select=*&normalized_title=eq." + urllib.parse.quote(task.manga_normalized, safe="")
    existing = api.rest("GET", "mangas", query) or []
    if existing:
        return existing[0]
    payload = {
        "title": task.manga_title,
        "normalized_title": task.manga_normalized,
        "author": task.manga_author,
        "synopsis": task.manga_synopsis,
        "direction": task.manga_direction,
        "cover_path": None,
    }
    created = api.rest("POST", "mangas", body=payload, prefer="return=representation")
    if not created:
        raise RuntimeError(f"No se pudo crear el manga {task.manga_title}.")
    return created[0]


def upload_cover_if_needed(api, manga, task):
    if manga.get("cover_path") or task.series != "classroom-light-novel":
        return manga
    cover = ROOT / "output" / "covers" / "classroom-of-the-elite-light-novel" / "v0.jpg"
    if not cover.exists():
        return manga
    object_path = "catalog/classroom-of-the-elite-light-novel.jpg"
    api.upload("covers", object_path, cover.read_bytes(), "image/jpeg")
    updated = api.rest(
        "PATCH",
        "mangas",
        "?id=eq." + urllib.parse.quote(manga["id"], safe=""),
        body={"cover_path": object_path},
        prefer="return=representation",
    )
    return updated[0] if updated else {**manga, "cover_path": object_path}


def get_volumes(api, manga_id):
    query = "?select=*&manga_id=eq." + urllib.parse.quote(manga_id, safe="")
    return api.rest("GET", "volumes", query) or []


def upload_pdf(api, task, manga_id):
    folder = f"manga-{manga_id}/volume-{slugify(task.normalized_title)}"
    file_size = task.size
    if file_size <= CHUNK_THRESHOLD:
        object_path = f"{folder}/{slugify(task.file_path.stem)}.pdf"
        api.upload("pdfs", object_path, task.file_path.read_bytes(), "application/pdf")
        return {"pdf_path": object_path, "pdf_storage_mode": "single", "pdf_parts": None}

    parts = []
    total_parts = (file_size + CHUNK_SIZE - 1) // CHUNK_SIZE
    with task.file_path.open("rb") as source:
        for index in range(total_parts):
            data = source.read(CHUNK_SIZE)
            object_path = f"{folder}/parts/part-{index + 1:05d}.bin"
            api.upload("pdfs", object_path, data, "application/octet-stream")
            parts.append({"path": object_path, "index": index, "size": len(data)})
            log(f"    parte {index + 1}/{total_parts}")
    return {"pdf_path": folder, "pdf_storage_mode": "chunks", "pdf_parts": parts}


def save_volume(api, task, manga_id, uploaded, existing):
    payload = {
        "manga_id": manga_id,
        "title": task.title,
        "normalized_title": task.normalized_title,
        "chapters_label": task.chapters_label or (existing or {}).get("chapters_label", ""),
        **uploaded,
        "pdf_name": task.file_path.name,
        "normalized_pdf_name": task.normalized_pdf_name,
    }
    if existing:
        result = api.rest(
            "PATCH",
            "volumes",
            "?id=eq." + urllib.parse.quote(existing["id"], safe=""),
            body=payload,
            prefer="return=representation",
        )
    else:
        result = api.rest("POST", "volumes", body=payload, prefer="return=representation")
    if not result:
        raise RuntimeError(f"No se pudo guardar el volumen {task.title}.")
    return result[0]


def save_chapter_mark(api, volume_id, chapter):
    if not chapter:
        return
    body = {"volume_id": volume_id, "chapter": chapter, "page": 1}
    api.rest(
        "POST",
        "chapter_marks",
        "?on_conflict=volume_id,chapter",
        body=body,
        prefer="resolution=merge-duplicates,return=minimal",
    )


def load_state():
    if not STATE_PATH.exists():
        return {"completed": [], "errors": []}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"completed": [], "errors": []}


def save_state(state):
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--preflight", action="store_true")
    parser.add_argument("--budget-mib", type=int, default=int(os.environ.get("LECTORPOLAR_PDF_BUDGET_MIB", "940")))
    args = parser.parse_args()

    email = os.environ.get("LECTORPOLAR_ADMIN_EMAIL", "admin@gmail.com")
    password = os.environ.get("LECTORPOLAR_ADMIN_PASSWORD")
    if not password:
        raise RuntimeError("Falta LECTORPOLAR_ADMIN_PASSWORD.")
    url, anon_key = load_config()
    api = Api(url, anon_key, email, password)
    budget = args.budget_mib * 1024 * 1024
    used_bytes, remote_file_count = api.storage_usage("pdfs")
    log(f"Supabase conectado. PDFs remotos: {remote_file_count}; uso detectado: {used_bytes / 1024 / 1024:.1f} MiB; presupuesto: {args.budget_mib} MiB.")

    tasks = make_tasks()
    missing = [task for task in tasks if task.file_path.exists()]
    log(f"Candidatos locales reales: {len(missing)} archivos, {sum(t.size for t in missing) / 1024 / 1024:.1f} MiB.")

    manga_cache = {}
    volume_cache = {}
    for task in missing:
        if task.manga_normalized in manga_cache:
            continue
        manga = ensure_manga(api, task)
        manga = upload_cover_if_needed(api, manga, task)
        manga_cache[task.manga_normalized] = manga
        volume_cache[task.manga_normalized] = {
            volume["normalized_title"]: volume for volume in get_volumes(api, manga["id"])
        }

    already_remote = []
    candidates = []
    for task in missing:
        existing = volume_cache[task.manga_normalized].get(task.normalized_title)
        if existing and existing.get("pdf_path"):
            already_remote.append(task)
        else:
            candidates.append(task)

    priority = {"classroom-light-novel": 0, "classroom-manga": 1, "my-hero-academia": 2}
    candidates.sort(key=lambda task: (priority[task.series], task.size if task.series == "my-hero-academia" else task.file_path.name))
    selected = []
    planned = used_bytes
    for task in candidates:
        if planned + task.size <= budget:
            selected.append(task)
            planned += task.size

    by_series = {}
    for task in selected:
        by_series.setdefault(task.series, [0, 0])
        by_series[task.series][0] += 1
        by_series[task.series][1] += task.size
    log("Selección:")
    for series, (count, size) in by_series.items():
        log(f"  {series}: {count} PDFs, {size / 1024 / 1024:.1f} MiB")
    log(f"Ya vinculados: {len(already_remote)}. Seleccionados ahora: {len(selected)}. Uso previsto: {planned / 1024 / 1024:.1f} MiB.")
    if args.preflight:
        return

    state = load_state()
    completed_keys = set(state.get("completed", []))
    for index, task in enumerate(selected, 1):
        key = f"{task.manga_normalized}/{task.normalized_title}"
        existing = volume_cache[task.manga_normalized].get(task.normalized_title)
        if key in completed_keys and existing and existing.get("pdf_path"):
            log(f"[{index}/{len(selected)}] omitido por manifiesto: {task.manga_title} - {task.title}")
            continue
        log(f"[{index}/{len(selected)}] subiendo {task.manga_title} - {task.title} ({task.size / 1024 / 1024:.1f} MiB)")
        try:
            manga = manga_cache[task.manga_normalized]
            uploaded = upload_pdf(api, task, manga["id"])
            volume = save_volume(api, task, manga["id"], uploaded, existing)
            save_chapter_mark(api, volume["id"], task.chapter)
            volume_cache[task.manga_normalized][task.normalized_title] = volume
            completed_keys.add(key)
            state["completed"] = sorted(completed_keys)
            state["last_success"] = {"series": task.manga_title, "title": task.title, "file": task.file_path.name}
            save_state(state)
            log("    listo")
        except Exception as error:
            message = str(error)
            state.setdefault("errors", []).append({"key": key, "error": message, "time": time.time()})
            save_state(state)
            log(f"ERROR: {message}")
            raise

    final_used, final_count = api.storage_usage("pdfs")
    state["remote_usage_bytes"] = final_used
    state["remote_object_count"] = final_count
    save_state(state)
    log(f"FINALIZADO: {len(completed_keys)} PDFs vinculados por este proceso; {final_count} objetos; {final_used / 1024 / 1024:.1f} MiB en pdfs.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        log(f"FALLO: {error}")
        sys.exit(1)

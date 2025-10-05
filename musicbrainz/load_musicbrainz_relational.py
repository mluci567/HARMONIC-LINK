import os, tarfile, json, psycopg2

# --- CONFIG ---
DB_NAME = "musicbrainz_json"
DB_USER = "marusialuciuk"    
DB_PASS = ""             
DB_HOST = "localhost"
DB_PORT = "5432"

# --- CONNECT ---
conn = psycopg2.connect(
    dbname=DB_NAME, user=DB_USER, password=DB_PASS,
    host=DB_HOST, port=DB_PORT
)
cur = conn.cursor()

# --- SCHEMA DEFINITIONS ---
SCHEMAS = {
    "artist": """
        CREATE TABLE IF NOT EXISTS artist (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            name TEXT NOT NULL,
            sort_name TEXT,
            type TEXT,
            disambiguation TEXT,
            area JSONB,
            begin_date DATE,
            end_date DATE
        );
    """,
    "release-group": """
        CREATE TABLE IF NOT EXISTS release_group (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            first_release_date DATE,
            artist_credit JSONB
        );
    """,
    "release": """
        CREATE TABLE IF NOT EXISTS release (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            title TEXT NOT NULL,
            status TEXT,
            packaging TEXT,
            date DATE,
            country TEXT,
            release_group BIGINT,
            label_info JSONB
        );
    """,
    "recording": """
        CREATE TABLE IF NOT EXISTS recording (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            title TEXT NOT NULL,
            length INT,
            video BOOLEAN,
            artist_credit JSONB,
            release_list JSONB
        );
    """,
    "label": """
        CREATE TABLE IF NOT EXISTS label (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            disambiguation TEXT,
            area JSONB,
            begin_date DATE,
            end_date DATE
        );
    """,
    "work": """
        CREATE TABLE IF NOT EXISTS work (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            title TEXT NOT NULL,
            type TEXT,
            language TEXT,
            iswc TEXT,
            attributes JSONB
        );
    """,
    "place": """
        CREATE TABLE IF NOT EXISTS place (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            address TEXT,
            area JSONB,
            coordinates JSONB
        );
    """,
    "series": """
        CREATE TABLE IF NOT EXISTS series (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            ordering_attribute TEXT,
            disambiguation TEXT
        );
    """,
    "event": """
        CREATE TABLE IF NOT EXISTS event (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            time TEXT,
            cancelled BOOLEAN,
            setlist TEXT,
            begin_date DATE,
            end_date DATE,
            place JSONB
        );
    """,
    "instrument": """
        CREATE TABLE IF NOT EXISTS instrument (
            id BIGINT PRIMARY KEY,
            gid UUID NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            description TEXT
        );
    """
}

# --- CREATE TABLES ---
for schema in SCHEMAS.values():
    cur.execute(schema)
conn.commit()

# --- PARSERS ---
def parse_artist(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("name"),
        doc.get("sort-name"),
        doc.get("type"),
        doc.get("disambiguation"),
        json.dumps(doc.get("area")),
        doc.get("life-span", {}).get("begin"),
        doc.get("life-span", {}).get("end"),
    ]

def parse_release_group(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("title") or doc.get("name"),
        doc.get("type"),
        doc.get("first-release-date"),
        json.dumps(doc.get("artist-credit")),
    ]

def parse_release(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("title"),
        doc.get("status"),
        doc.get("packaging"),
        doc.get("date"),
        doc.get("country"),
        doc.get("release-group"),
        json.dumps(doc.get("label-info")),
    ]

def parse_recording(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("title"),
        doc.get("length"),
        doc.get("video"),
        json.dumps(doc.get("artist-credit")),
        json.dumps(doc.get("releases")),
    ]

def parse_label(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("name"),
        doc.get("type"),
        doc.get("disambiguation"),
        json.dumps(doc.get("area")),
        doc.get("life-span", {}).get("begin"),
        doc.get("life-span", {}).get("end"),
    ]

def parse_work(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("title"),
        doc.get("type"),
        doc.get("language"),
        doc.get("iswc"),
        json.dumps(doc.get("attributes")),
    ]

def parse_place(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("name"),
        doc.get("type"),
        doc.get("address"),
        json.dumps(doc.get("area")),
        json.dumps(doc.get("coordinates")),
    ]

def parse_series(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("name"),
        doc.get("type"),
        doc.get("ordering-attribute"),
        doc.get("disambiguation"),
    ]

def parse_event(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("name"),
        doc.get("type"),
        doc.get("time"),
        doc.get("cancelled"),
        doc.get("setlist"),
        doc.get("life-span", {}).get("begin"),
        doc.get("life-span", {}).get("end"),
        json.dumps(doc.get("place")),
    ]

def parse_instrument(doc):
    return [
        doc.get("id"),
        doc.get("gid"),
        doc.get("name"),
        doc.get("type"),
        doc.get("description"),
    ]

PARSERS = {
    "artist": (parse_artist, "INSERT INTO artist VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"),
    "release-group": (parse_release_group, "INSERT INTO release_group VALUES (%s,%s,%s,%s,%s,%s)"),
    "release": (parse_release, "INSERT INTO release VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"),
    "recording": (parse_recording, "INSERT INTO recording VALUES (%s,%s,%s,%s,%s,%s,%s)"),
    "label": (parse_label, "INSERT INTO label VALUES (%s,%s,%s,%s,%s,%s,%s,%s)"),
    "work": (parse_work, "INSERT INTO work VALUES (%s,%s,%s,%s,%s,%s,%s)"),
    "place": (parse_place, "INSERT INTO place VALUES (%s,%s,%s,%s,%s,%s,%s)"),
    "series": (parse_series, "INSERT INTO series VALUES (%s,%s,%s,%s,%s,%s)"),
    "event": (parse_event, "INSERT INTO event VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"),
    "instrument": (parse_instrument, "INSERT INTO instrument VALUES (%s,%s,%s,%s,%s)"),
}

# --- LOAD FUNCTION ---
def extract_and_load(archive, entity):
    folder = entity
    if not os.path.exists(folder):
        print(f"Extracting {archive}...")
        with tarfile.open(archive, "r:xz") as tar:
            tar.extractall(path=folder)

    parser, insert_sql = PARSERS[entity]
    files = [os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".json")]

    print(f"Loading {entity} into DB ({len(files)} files)...")

    count = 0
    for idx, file in enumerate(files, start=1):
        try:
            with open(file) as f:
                doc = json.load(f)
            row = parser(doc)
            cur.execute(insert_sql, row)
            count += 1
        except Exception as e:
            print(f"⚠️ Skipping {file}: {e}")

        if idx % 1000 == 0:
            conn.commit()
            print(f"   {idx} processed...")

    conn.commit()
    print(f"✅ {entity} loaded: {count} rows")

# --- MAIN ---
for entity in PARSERS.keys():
    archive = f"{entity}.tar.xz"
    if os.path.exists(archive):
        extract_and_load(archive, entity)

cur.close()
conn.close()
print("All done!")

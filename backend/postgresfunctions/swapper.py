import psycopg2
import json
import requests

with open("secrets.json") as f:
    secrets = json.load(f)

LAMBDA_API_URL = secrets["LAMBDA_API_URL"]
DYNAMO_TABLE   = "GalleryTable2"
NON_KEYWORD_FIELDS = {"id", "description"}


def parse_dynamo_value(val: dict):
    """Unwrap a single DynamoDB typed value, e.g. {"S": "foo"} → "foo"."""
    if "S"    in val: return val["S"]
    if "BOOL" in val: return val["BOOL"]
    if "N"    in val: return val["N"]
    if "NULL" in val: return None
    return None


def call_lambda(keyword: str) -> list:
    """POST to the Lambda via API Gateway and return the list of DynamoDB items."""
    payload = {"tablename": DYNAMO_TABLE, "keyword": keyword}
    resp = requests.post(LAMBDA_API_URL, json=payload)
    resp.raise_for_status()

    # API Gateway unwraps the Lambda body, so resp.json() is already the items list.
    data = resp.json()
    if isinstance(data, str):          # safety: if it comes back double-encoded
        data = json.loads(data)
    return data or []


def insert_items(items: list):
    """Insert images and their keywords into Postgres."""
    conn = None
    try:
        conn = psycopg2.connect(
            host=secrets["DB_HOST"],
            port=5432,
            database=secrets["DB_NAME"],
            user=secrets["DB_USER"],
            password=secrets["DB_PASSWORD"],
            sslmode="require"
        )
        cur = conn.cursor()

        inserted = 0
        skipped  = 0

        for item in items:
            # ── Core fields ────────────────────────────────────────────────
            pic_id     = parse_dynamo_value(item["id"])
            description = parse_dynamo_value(item.get("description", {"S": ""}))
            s3_key      = f"pics/{pic_id}.jpg"
            title       = f"Picture {pic_id}"

            # ── Collect all keyword attributes for this item ───────────────
            item_keywords = [
                k for k, _ in item.items()
                if k not in NON_KEYWORD_FIELDS
            ]


            # ── Insert into images (skip if s3_key already exists) ─────────
            cur.execute(
                "SELECT image_id FROM images WHERE s3_key = %s", (s3_key,)
            )
            row = cur.fetchone()

            if row is not None:
                skipped += 1
            else:
                cur.execute(
                    """
                    INSERT INTO images (title, description, s3_key)
                    VALUES (%s, %s, %s)
                    RETURNING image_id
                    """,
                    (title, description, s3_key)
                )
                row = cur.fetchone()
                inserted += 1

            image_id = row[0]

            # ── Upsert each keyword and link to image ──────────────────────
            for kw in item_keywords:
                # Insert keyword (or retrieve existing)
                cur.execute(
                    """
                    INSERT INTO keywords (keyword)
                    VALUES (%s)
                    ON CONFLICT (keyword) DO NOTHING
                    RETURNING keyword_id
                    """,
                    (kw,)
                )
                kw_row = cur.fetchone()
                if kw_row is None:
                    cur.execute(
                        "SELECT keyword_id FROM keywords WHERE keyword = %s",
                        (kw,)
                    )
                    kw_row = cur.fetchone()
                keyword_id = kw_row[0]

                # Link image ↔ keyword
                cur.execute(
                    """
                    INSERT INTO image_keywords (image_id, keyword_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                    """,
                    (image_id, keyword_id)
                )

        conn.commit()
        cur.close()
        print(f"Done — {inserted} new image(s) inserted, {skipped} already existed.")

    except Exception as e:
        print(f"Database error: {e}")
        raise

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    keyword = input("Enter keyword to scan: ").strip()

    if not keyword:
        print("No keyword entered. Exiting.")
        exit(1)

    print(f"Scanning '{DYNAMO_TABLE}' for keyword: '{keyword}' ...")
    items = call_lambda(keyword)

    if not items:
        print("No items found for that keyword.")
    else:
        print(f"Found {len(items)} item(s). Inserting into database ...")
        insert_items(items)
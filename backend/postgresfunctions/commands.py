import psycopg2
import json

with open("secrets.json") as f:
    secrets = json.load(f)

def connect(command):
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
        cur.execute(command)

        # Check if query returns rows (SELECT)
        if cur.description is not None:
            rows = cur.fetchall()
            colnames = [desc[0] for desc in cur.description]

            print("Columns:", colnames)
            print("Results:")

            for row in rows:
                print(row)
        else:
            # For INSERT/UPDATE/DDL
            conn.commit()
            print("Command executed successfully.")

        cur.close()

    except Exception as e:
        print(f"Database error: {e}")
        raise

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    command = """
    SELECT * FROM images
    """
    connect(command)
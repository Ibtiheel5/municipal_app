# test_db.py
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "municipal_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "")
    )
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM proprietaires")
    count = cur.fetchone()[0]
    print(f"✅ Nombre de propriétaires : {count}")
    conn.close()
except Exception as e:
    print(f"❌ Erreur de connexion : {e}")
import sqlite3

def query_database():
    # Connect to the SQLite database
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()

    # Example query: Fetch all tables in the database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print("Tables in the database:")
    for table in tables:
        print(table[0])

    # Example query: Fetch data from a specific table (replace 'your_table_name' with an actual table name)
    # cursor.execute("SELECT * FROM your_table_name;")
    # rows = cursor.fetchall()
    # for row in rows:
    #     print(row)

    # Close the connection
    conn.close()

if __name__ == "__main__":
    query_database()

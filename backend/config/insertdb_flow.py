# MongoDB Insert Script
# Simple connection to insert data

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from datetime import datetime


def parse_date(s: str):
    """Try parsing a date string into a datetime object using common formats.

    Returns a datetime on success or None on failure.
    """
    if not s or not s.strip():
        return None
    s = s.strip()
    # Common formats to accept
    formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%b %d %Y",
        "%B %d %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    # Try ISO format
    try:
        return datetime.fromisoformat(s)
    except Exception:
        return None

# MongoDB connection
uri = "mongodb+srv://advisory:InnovateHer@cluster0.pcin0xa.mongodb.net/"

try:
    print("Connecting to MongoDB...")
    client = MongoClient(
        uri, 
        serverSelectionTimeoutMS=10000, 
        connectTimeoutMS=10000,
        tlsInsecure=True
    )
    
    # Ping to verify connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB Atlas")
    
    # Access database
    db = client["samplebudgeting"]
    print(f"Using database: samplebudgeting")
    
    collection_name = "daily_flow"
    
    collection = db[collection_name]
    users = db["users"]
    # Prompt for username until a matching user is found
    userid = None
    while userid is None:
        username_input = input("Enter username to link data to (or type 'exit' to quit): ").strip()
        if username_input.lower() == 'exit':
            print("Exiting.")
            raise SystemExit(0)
        userid = users.find_one({"username": username_input}, {"_id": 1})
        if userid is None:
            print(f"✗ Username '{username_input}' not found. Please try again.")
    print(f"✓ Using collection: {collection_name}")
    
    # Define required fields
    required_fields = ["date", "income", "expense"]
    
    # Manual input mode only
    data = []
    print(f"\nYou will be prompted to enter data for each field: {', '.join(required_fields)}")

    while True:
        print("\n" + "="*50)
        user_data = {}
        user_data["user_id"] = userid["_id"]  # Link to the user_id established from creation of username
        user_data["username"] = username_input  # Store username for easier reference

        abort = False
        for field in required_fields:
            if field == "date":
                # Prompt for date with examples and parse into datetime
                while True:
                    date_str = input("Enter date (e.g. 2026-02-07 or 02/07/2026 or Feb 7 2026): ").strip()
                    if not date_str:
                        print("Date cannot be empty")
                        abort = True
                        break
                    parsed = parse_date(date_str)
                    if parsed is None:
                        print("Invalid date format. Try YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, or 'Feb 7 2026'.")
                        continue
                    user_data[field] = parsed
                    break
                if abort:
                    break
            else:
                value = input(f"Enter {field}: ").strip()
                if not value:
                    print(f"✗ {field} cannot be empty")
                    abort = True
                    break
                # Convert numeric fields to floats for readability/storage
                if field in ("income", "expense"):
                    try:
                        user_data[field] = float(value)
                    except ValueError:
                        print(f"✗ {field} must be a number (e.g. 1234.56)")
                        abort = True
                        break
                else:
                    user_data[field] = value

        if abort:
            # Restart the entry
            continue

        # All fields filled successfully
        data.append(user_data)
        print(f"Entry added (linked to user_id: {user_data['user_id']})")

        add_more = input("\nAdd another entry? (y/n): ").strip().lower()
        if add_more != 'y':
            break
    
    # Validate all documents have required fields
    if data:
        print(f"\nValidating {len(data)} document(s)...")
        for i, doc in enumerate(data):
            missing_fields = [f for f in required_fields if f not in doc]
            if missing_fields:
                print(f"Document {i+1} missing fields: {', '.join(missing_fields)}")
                exit()
        print("All documents valid")
    
    # Insert data
    if data and len(data) > 0:
        result = collection.insert_many(data)
        print(f"\nSuccessfully inserted {len(result.inserted_ids)} document(s)")
        print(f"Inserted IDs: {result.inserted_ids}")
    else:
        print("No valid data to insert")
        print("Data must be JSON objects")
        
except ServerSelectionTimeoutError:
    print("TIMEOUT: Could not connect to MongoDB")
    print("  - Check your internet connection")
    print("  - Check your IP whitelist in MongoDB Atlas")
except ConnectionFailure as e:
    print(f"CONNECTION FAILED: {e}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

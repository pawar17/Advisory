from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure

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
    print(f"Using database: samplebudgeting") #mongodb database name
    
    collection_name = "users" # mongodb collection name set to users to avoid user error
    
    collection = db[collection_name]
    print(f"Using collection: {collection_name}")
    
    # Define required fields
    required_fields = ["username", "email", "password", "country", "state_region"]
    
    # Manual input only
    data = []
    print(f"\nYou will be prompted to enter data for each field: {', '.join(required_fields)}")

    while True:
        print("\n" + "="*50)
        user_data = {}

        # Prompt for username first and ensure it's unique in the collection
        while True:
            username_val = input("Enter username: ").strip()
            if not username_val:
                print("Username cannot be empty")
                continue
            if collection.find_one({"username": username_val}):
                print(f"Username '{username_val}' already exists. Please choose another.")
                continue
            user_data['username'] = username_val
            break

        # Prompt for the remaining required fields
        abort = False
        for field in required_fields:
            if field == 'username':
                continue
            value = input(f"Enter {field}: ").strip()
            if not value:
                print(f"{field} cannot be empty")
                abort = True
                break
            user_data[field] = value

        if abort:
            # Start over the entry if a required field was missing
            continue

        # All fields filled successfully
        data.append(user_data)
        print(f"User added: {user_data['username']}")

        add_more = input("\nAdd another user? (y/n): ").strip().lower()
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

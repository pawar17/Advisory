import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

try:
    import certifi
    CA_BUNDLE = certifi.where()
except ImportError:
    CA_BUNDLE = None


class Database:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB"""
        try:
            mongodb_uri = os.getenv('MONGODB_URI')
            if not mongodb_uri:
                raise ValueError("MONGODB_URI not found in environment variables")

            # Use certifi CA bundle for TLS (fixes SSL handshake errors on Render/cloud with MongoDB Atlas)
            kwargs = {}
            if CA_BUNDLE:
                kwargs["tlsCAFile"] = CA_BUNDLE
            self.client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=20000, **kwargs)
            db_name = os.getenv('MONGODB_DATABASE', 'samplebudgeting')
            self.db = self.client[db_name]

            self.client.admin.command('ping')
            print("Successfully connected to MongoDB!")

            return self.db
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            raise

    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            print("Database connection closed")

db_instance = Database()

"""Bank statements and parsed transactions for spending analysis."""
from datetime import datetime
from bson import ObjectId


class BankStatement:
    def __init__(self, db):
        self.collection = db.bank_statements
        self.transactions = db.transactions
        self._create_indexes()

    def _create_indexes(self):
        self.collection.create_index("user_id")
        self.transactions.create_index([("user_id", 1), ("date", -1)])
        self.transactions.create_index([("user_id", 1), ("category", 1)])

    def create(self, user_id, filename, file_size_bytes, parsed_at=None):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        doc = {
            "user_id": user_id,
            "filename": filename,
            "file_size_bytes": file_size_bytes,
            "parsed_at": parsed_at or datetime.utcnow(),
            "transaction_count": 0,
            "created_at": datetime.utcnow(),
        }
        result = self.collection.insert_one(doc)
        return result.inserted_id

    def get_by_id(self, statement_id):
        if isinstance(statement_id, str):
            statement_id = ObjectId(statement_id)
        return self.collection.find_one({"_id": statement_id})

    def get_user_statements(self, user_id, limit=20):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return list(self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit))

    def update_transaction_count(self, statement_id, count):
        if isinstance(statement_id, str):
            statement_id = ObjectId(statement_id)
        return self.collection.update_one(
            {"_id": statement_id},
            {"$set": {"transaction_count": count, "updated_at": datetime.utcnow()}}
        )

    def insert_transactions(self, user_id, statement_id, transactions_list):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(statement_id, str):
            statement_id = ObjectId(statement_id)
        docs = []
        for t in transactions_list:
            docs.append({
                "user_id": user_id,
                "statement_id": statement_id,
                "date": t.get("date"),
                "description": t.get("description", ""),
                "amount": float(t.get("amount", 0)),
                "category": t.get("category", "other"),
                "created_at": datetime.utcnow(),
            })
        if docs:
            self.transactions.insert_many(docs)
        self.update_transaction_count(statement_id, len(docs))
        return len(docs)

    def get_user_transactions(self, user_id, limit=500):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return list(self.transactions.find({"user_id": user_id}).sort("date", -1).limit(limit))

    def get_spending_by_category(self, user_id, days=None):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        from datetime import timedelta
        match = {"user_id": user_id, "amount": {"$lt": 0}}
        if days:
            since = datetime.utcnow() - timedelta(days=days)
            match["date"] = {"$gte": since}
        pipeline = [
            {"$match": match},
            {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
            {"$sort": {"total": 1}},
        ]
        return list(self.transactions.aggregate(pipeline))

    def delete_statement(self, statement_id, user_id):
        """Delete a statement and all its transactions. Returns deleted count."""
        if isinstance(statement_id, str):
            statement_id = ObjectId(statement_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        doc = self.collection.find_one({"_id": statement_id, "user_id": user_id})
        if not doc:
            return 0
        result = self.transactions.delete_many({"statement_id": statement_id, "user_id": user_id})
        self.collection.delete_one({"_id": statement_id})
        return result.deleted_count

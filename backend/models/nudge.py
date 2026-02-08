"""Nudge: user A sends a nudge to user B to encourage their goals."""
from datetime import datetime
from bson import ObjectId


class Nudge:
    def __init__(self, db):
        self.collection = db.nudges
        self._create_indexes()

    def _create_indexes(self):
        self.collection.create_index("to_user_id")
        self.collection.create_index([("to_user_id", 1), ("read_at", 1)])
        self.collection.create_index([("from_user_id", 1), ("to_user_id", 1)])

    def has_nudged(self, from_user_id, to_user_id):
        """True if from_user has already sent a nudge to to_user (one nudge per friend only)."""
        if isinstance(from_user_id, str):
            from_user_id = ObjectId(from_user_id)
        if isinstance(to_user_id, str):
            to_user_id = ObjectId(to_user_id)
        return self.collection.count_documents({"from_user_id": from_user_id, "to_user_id": to_user_id}) > 0

    def get_sent_to_user_ids(self, from_user_id, limit=500):
        """List of user ids this user has already nudged."""
        if isinstance(from_user_id, str):
            from_user_id = ObjectId(from_user_id)
        docs = self.collection.find({"from_user_id": from_user_id}, {"to_user_id": 1}).limit(limit)
        return [str(d["to_user_id"]) for d in docs]

    def create(self, from_user_id, to_user_id, goal_id=None, goal_name=None):
        if isinstance(from_user_id, str):
            from_user_id = ObjectId(from_user_id)
        if isinstance(to_user_id, str):
            to_user_id = ObjectId(to_user_id)
        if goal_id and isinstance(goal_id, str):
            goal_id = ObjectId(goal_id)
        doc = {
            "from_user_id": from_user_id,
            "to_user_id": to_user_id,
            "goal_id": goal_id,
            "goal_name": goal_name or "your goal",
            "read_at": None,
            "created_at": datetime.utcnow(),
        }
        result = self.collection.insert_one(doc)
        return result.inserted_id

    def get_for_user(self, user_id, unread_only=False, limit=50):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        query = {"to_user_id": user_id}
        if unread_only:
            query["read_at"] = None
        return list(self.collection.find(query).sort("created_at", -1).limit(limit))

    def mark_read(self, nudge_id, user_id):
        if isinstance(nudge_id, str):
            nudge_id = ObjectId(nudge_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return self.collection.update_one(
            {"_id": nudge_id, "to_user_id": user_id},
            {"$set": {"read_at": datetime.utcnow()}}
        )

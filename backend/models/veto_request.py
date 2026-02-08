"""
Veto request model – user asks friends to vote (Go for it / Veto) on a purchase.
"""

from datetime import datetime
from bson import ObjectId


class VetoRequest:
    def __init__(self, db):
        self.collection = db.veto_requests
        self._create_indexes()

    def _create_indexes(self):
        self.collection.create_index("created_at")

    def create(self, user_id, username, name, item, amount, reason):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        doc = {
            "user_id": user_id,
            "username": username,
            "name": name or username,
            "item": item,
            "amount": float(amount),
            "reason": reason,
            "votes": [],
            "status": "pending",
            "created_at": datetime.utcnow(),
        }
        result = self.collection.insert_one(doc)
        return result.inserted_id

    def get_all_pending(self, limit=50):
        cursor = self.collection.find({"status": "pending"}).sort("created_at", -1).limit(limit)
        return list(cursor)

    def get_visible_for_user(self, user_id, limit=50):
        """Pending requests (anyone can vote) + current user's own approved/rejected (so they see outcome)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        pending = list(self.collection.find({"status": "pending"}).sort("created_at", -1).limit(limit))
        mine_resolved = list(
            self.collection.find(
                {"user_id": user_id, "status": {"$in": ["approved", "rejected"]}}
            ).sort("created_at", -1).limit(20)
        )
        seen = {str(d["_id"]) for d in pending}
        for d in mine_resolved:
            if str(d["_id"]) not in seen:
                pending.append(d)
        pending.sort(key=lambda d: d["created_at"], reverse=True)
        return pending[:limit]

    def count_by_user(self, user_id):
        """Number of veto requests created by this user (used = spent veto tokens)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return self.collection.count_documents({"user_id": user_id})

    def count_approvals_by_user(self, user_id):
        """Number of 'Go for it' (approve) votes this user has cast. One row (5 items) = 1 approve."""
        uid = str(user_id) if isinstance(user_id, ObjectId) else str(user_id)
        return self.collection.count_documents({
            "votes": {"$elemMatch": {"userId": uid, "vote": "approve"}}
        })

    def get_by_id(self, request_id):
        if isinstance(request_id, str):
            request_id = ObjectId(request_id)
        return self.collection.find_one({"_id": request_id})

    def add_vote(self, request_id, user_id, vote):
        if isinstance(request_id, str):
            request_id = ObjectId(request_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        req = self.collection.find_one({"_id": request_id})
        if not req:
            return None
        votes = req.get("votes") or []
        if any(v.get("userId") == str(user_id) or v.get("user_id") == user_id for v in votes):
            return req  # already voted
        votes.append({"userId": str(user_id), "vote": vote})
        # One veto = rejected; one approve = approved (so requester sees outcome)
        new_status = "rejected" if vote == "veto" else "approved"
        self.collection.update_one(
            {"_id": request_id},
            {"$set": {"votes": votes, "status": new_status}}
        )
        return self.collection.find_one({"_id": request_id})

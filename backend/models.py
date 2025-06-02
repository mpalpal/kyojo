from datetime import datetime

from database import Base
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    details = Column(String)
    kind = Column(String)
    date_from = Column(DateTime)
    date_to = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    image_urls = Column(String)  # カンマ区切りで保存
    created_at = Column(DateTime, default=datetime.utcnow)


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    details = Column(String)
    kind = Column(String)
    date_found = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    image_urls = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class MatchScore(Base):
    __tablename__ = "match_scores"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"))
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
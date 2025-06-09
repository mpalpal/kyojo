from datetime import datetime

from database import Base
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    details = Column(String)
    kind = Column(String)
    date_from = Column(DateTime)
    date_to = Column(DateTime)
    location_notes = Column(String)  # 場所の詳細説明
    image_urls = Column(String)  # カンマ区切りで保存
    security_info = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    locations = relationship("LostItemLocation", back_populates="item", cascade="all, delete")
    # quiz_answers = relationship("LostItemQuizAnswer", back_populates="item", cascade="all, delete")

class LostItemLocation(Base):
    __tablename__ = "lost_item_locations"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("lost_items.id"))
    latitude = Column(Float)
    longitude = Column(Float)

    item = relationship("LostItem", back_populates="locations")

# class LostItemQuizAnswer(Base):
#     __tablename__ = "lost_item_quiz_answers"

#     id = Column(Integer, primary_key=True, index=True)
#     item_id = Column(Integer, ForeignKey("lost_items.id"))
#     answer = Column(String)

#     item = relationship("LostItem", back_populates="quiz_answers")

class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String)
    date_found = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    location_notes = Column(String)
    image_urls = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class MatchScore(Base):
    __tablename__ = "match_scores"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"))
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
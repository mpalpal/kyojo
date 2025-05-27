from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime

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

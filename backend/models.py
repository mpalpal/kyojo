from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # 関連付け（落とし物）
    lost_items = relationship("LostItem", back_populates="user")

class LostItem(Base):
    __tablename__ = "lost_items"

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="lost_items")

    id = Column(Integer, primary_key=True, index=True)
    details = Column(String)
    kind = Column(String)
    date_from = Column(DateTime)
    date_to = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    image_urls = Column(String)  # カンマ区切りで保存
    created_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):  # ← Baseを継承していること！
    __tablename__ = "messages"  # ← これがないとエラーになる！

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 任意：リレーション（あとで使う）
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

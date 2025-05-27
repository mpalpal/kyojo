from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import LostItem
import shutil
import os
from datetime import datetime
import random

app = FastAPI()

# CORS設定（適宜調整）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # セキュリティ的にはフロントのドメインに絞る
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# DB初期化
Base.metadata.create_all(bind=engine)

# DBセッション依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/lost-items")
async def register_lost_item(
    images: List[UploadFile] = File(...),
    details: str = Form(...),
    kind: str = Form(...),
    date_from: str = Form(...),
    date_to: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db)
):
    # 画像保存
    os.makedirs("uploads", exist_ok=True)
    saved_paths = []
    for img in images:
        file_path = f"uploads/{img.filename}"
        with open(file_path, "wb") as f:
            shutil.copyfileobj(img.file, f)
        saved_paths.append(file_path)

    # データベース登録
    lost_item = LostItem(
        details=details,
        kind=kind,
        date_from=datetime.fromisoformat(date_from),
        date_to=datetime.fromisoformat(date_to),
        latitude=latitude,
        longitude=longitude,
        image_urls=",".join(saved_paths)
    )
    db.add(lost_item)
    db.commit()
    db.refresh(lost_item)

    return {"message": "登録完了", "item_id": lost_item.id}


@app.get("/api/lost-items")
def get_lost_items(db: Session = Depends(get_db)):
    items = db.query(LostItem).all()
    random_items = random.sample(items, min(3, len(items)))
    return [
        {
            "id": item.id,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "details": item.details,
            "image_url": item.image_urls.split(',')[0] if item.image_urls else None,
        }
        for item in random_items
    ]
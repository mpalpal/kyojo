from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base, get_db
from models import LostItem , User
from schemas import UserCreate, UserOut
from auth import router as auth_router
from auth import get_current_user  # 重要！
# from database import get_db
from security import hash_password
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
app.include_router(auth_router)
# DB初期化
Base.metadata.create_all(bind=engine)
        
        

# @app.post("/auth/register", response_model=UserOut)
# def register(user_data: UserCreate, db: Session = Depends(get_db)):
#     existing = db.query(User).filter(User.email == user_data.email).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email is already registered")

#     user = User(
#         email=user_data.email,
#         hashed_password=hash_password(user_data.password)
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user

@app.post("/api/lost-items")
async def register_lost_item(
    images: List[UploadFile] = File(...),
    details: str = Form(...),
    kind: str = Form(...),
    date_from: str = Form(...),
    date_to: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🔥 トークンからユーザー取得

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
    print(f"User ID: {current_user.id}")  # ← ユーザーIDを確認
    lost_item = LostItem(
        user_id=current_user.id,  # ← ここでユーザーIDを紐づける
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
    
    
# @app.get("/api/lost-items")
# def get_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     return db.query(LostItem).filter(LostItem.user_id != current_user.id).all()

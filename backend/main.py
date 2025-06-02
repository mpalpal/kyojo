# import logging
import os
import random
import shutil
import sys
from datetime import datetime
from typing import List, Optional

from database import Base, SessionLocal, engine
from fastapi import (BackgroundTasks, Depends, FastAPI, File, Form, Request,
                     UploadFile)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from match import get_match_score
from models import (FoundItem, LostItem, LostItemLocation, LostItemQuizAnswer,
                    MatchScore)
from scripts.reset_db import reset_database
from sqlalchemy.orm import Session

# logger = logging.getLogger(__name__)
# logger.info("logging started!")

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
# reset_database() # delete all existing tables and create new ones
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
    request: Request,
    images: Optional[List[UploadFile]] = File(default=[]),
    details: str = Form(...),
    kind: str = Form(...),
    date_from: str = Form(...),
    date_to: str = Form(...),
    location_notes: str = Form(""),
    db: Session = Depends(get_db)
):
    
    print("Lost item posted")

    form_data = await request.form()
    # print("Received fields:", form_data.keys())

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
        location_notes=location_notes,
        image_urls=",".join(saved_paths)
    )
    db.add(lost_item)
    db.commit()
    db.refresh(lost_item)

    # Save locations
    index = 0
    while True:
        lat_key = f"locations[{index}][latitude]"
        lon_key = f"locations[{index}][longitude]"
        if lat_key in form_data and lon_key in form_data:
            lat = float(form_data[lat_key])
            lon = float(form_data[lon_key])
            location = LostItemLocation(
                item_id=lost_item.id,
                latitude=lat,
                longitude=lon,
            )
            db.add(location)
            index += 1
        else:
            break

    # Save quiz answers
    i = 0
    while True:
        key = f"quiz_answers[{i}]"
        if key in form_data:
            answer = form_data[key]
            quiz = LostItemQuizAnswer(
                item_id=lost_item.id,
                answer=answer,
            )
            db.add(quiz)
            i += 1
        else:
            break

    db.commit()

    match_lost_item(lost_item, db) # run matching algorithm

    return {"message": "登録完了", "item_id": lost_item.id}


@app.get("/api/lost-items")
def get_lost_items(db: Session = Depends(get_db)):
    items = db.query(LostItem).all()
    random_items = random.sample(items, min(3, len(items)))
    return [
        {
            "id": item.id,
            "latitude": item.locations[0].latitude if item.locations else None,
            "longitude": item.locations[0].longitude if item.locations else None,
            "details": item.details,
            "image_url": item.image_urls.split(',')[0] if item.image_urls else None,
        }
        for item in random_items
    ]

@app.post("/api/found-items")
async def register_found_item(
    background_tasks: BackgroundTasks,
    images: List[UploadFile] = File(...),
    kind: str = Form(...),
    date_found: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_notes: str = Form(...),
    db: Session = Depends(get_db)
):
    
    print("Found item posted")
    # 画像保存
    os.makedirs("uploads", exist_ok=True)
    saved_paths = []
    for img in images:
        file_path = f"uploads/{img.filename}"
        with open(file_path, "wb") as f:
            shutil.copyfileobj(img.file, f)
        saved_paths.append(file_path)

    # データベース登録
    found_item = FoundItem(
        kind=kind,
        date_found=datetime.fromisoformat(date_found),
        latitude=latitude,
        longitude=longitude,
        location_notes=location_notes,
        image_urls=",".join(saved_paths)
    )
    db.add(found_item)
    db.commit()
    db.refresh(found_item)

    background_tasks.add_task(match_found_item_safe, found_item.id) # run matching algorithm slowly

    return {"message": "登録完了", "item_id": found_item.id}

@app.get("/api/found-items")
def get_found_items(db: Session = Depends(get_db)):
    items = db.query(FoundItem).all()
    random_items = random.sample(items, min(3, len(items)))
    return [
        {
            "id": item.id,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "location_notes": item.location_notes,
            "image_url": item.image_urls.split(',')[0] if item.image_urls else None,
        }
        for item in random_items
    ]

# when a new lost item is registered, calculate match scores against all found items
def match_lost_item(lost_item: LostItem, db: Session):
    print("Matching lost item with found items...")
    found_items = db.query(FoundItem).all()
    lost_image_paths = lost_item.image_urls.split(',') if lost_item.image_urls else []

    for found in found_items:
        found_image_paths = found.image_urls.split(',') if found.image_urls else []

        score = get_match_score(
            lost_description=lost_item.details,
            lost_image_path=lost_image_paths[0] if lost_image_paths else None,
            found_image_paths=found_image_paths
        )

        if isinstance(score, int):  # Adjust threshold if needed
            match = MatchScore(
                lost_item_id=lost_item.id,
                found_item_id=found.id,
                score=float(score)
            )
            db.add(match)
    db.commit()

# when a new found item is registered, calculate match scores against all lost items
def match_found_item(found_item: FoundItem, db: Session):
    print("Matching found item with lost items...")
    # sys.stdout.flush()
    lost_items = db.query(LostItem).all()
    found_image_paths = found_item.image_urls.split(',') if found_item.image_urls else []

    for lost in lost_items:
        lost_image_paths = lost.image_urls.split(',') if lost.image_urls else []

        score = get_match_score(
            lost_description=lost.details,
            lost_image_path=lost_image_paths[0] if lost_image_paths else None,
            found_image_paths=found_image_paths
        )

        if isinstance(score, int):  # Acceptable match threshold
            match = MatchScore(
                lost_item_id=lost.id,
                found_item_id=found_item.id,
                score=float(score)
            )
            db.add(match)

    db.commit()

def match_found_item_safe(found_item_id: int):
    db = SessionLocal()
    try:
        found_item = db.query(FoundItem).get(found_item_id)
        match_found_item(found_item, db)
    finally:
        db.close()

@app.get("/api/matched-found-items")
def get_matched_found_items(lost_item_id: int, db: Session = Depends(get_db)):
    matches = (
        db.query(MatchScore)
        .filter(MatchScore.lost_item_id == lost_item_id, MatchScore.score > 3)
        .all()
    )

    found_item_ids = [m.found_item_id for m in matches]

    if not found_item_ids:
        return []
    
    print(f"Found items for lost item {lost_item_id}: {found_item_ids}")
    sys.stdout.flush()


    found_items = (
        db.query(FoundItem)
        .filter(FoundItem.id.in_(found_item_ids))
        .all()
    )

    return [
        {
            "id": item.id,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "location_notes": item.location_notes,
            "image_url": item.image_urls.split(',')[0] if item.image_urls else None,
        }
        for item in found_items
    ]

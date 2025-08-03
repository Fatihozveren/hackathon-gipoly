#!/usr/bin/env python3
"""
Script to fetch Google Trends data for popular categories and store in database.
"""

import os
import json
import time
import random
from datetime import datetime
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv

# Import models
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.trend_agent.models import TrendCategory

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
engine = create_engine(DATABASE_URL)

CATEGORIES = [
    "teknoloji",
    "moda", 
    "ev",
    "sağlık",
    "spor",
    "otomobil",
    "kozmetik",
    "kitap",
    "oyuncak",
    "yemek",
    "sağlık",
    "otomobil",
]

def get_trends_data(keyword):
    """Sadece gerçek Google Trends verisi çek"""
    try:
        from pytrends.request import TrendReq
        print(f"🔍 {keyword} için veri çekiliyor...")
        
        pytrends = TrendReq(hl='tr-TR', tz=180, retries=3)
        pytrends.build_payload([keyword], timeframe='today 3-m', geo='TR')
        
        data = pytrends.interest_over_time()
        
        if data.empty:
            print(f"{keyword} için veri bulunamadı")
            return None
            
        if 'isPartial' in data.columns:
            data.drop('isPartial', axis=1, inplace=True)
        
        result = {}
        for date, value in data[keyword].items():
            result[date.strftime('%Y-%m-%d')] = int(value)
        
        print(f"{keyword}: {len(result)} gerçek veri alındı")
        return result
        
    except Exception as e:
        print(f"{keyword} hatası: {e}")
        return None

def save_to_db(category_name, trend_data):
    try:
        with Session(engine) as session:
            # Import models to avoid relationship issues
            from models.user import User
            from models.workspace import Workspace, WorkspaceMember
            
            existing = session.exec(
                select(TrendCategory).where(TrendCategory.category_name == category_name)
            ).first()
            
            if existing:
                existing.trend_data = json.dumps(trend_data, ensure_ascii=False)
                existing.last_updated = datetime.utcnow()
                print(f"{category_name} güncellendi")
            else:
                new_record = TrendCategory(
                    category_name=category_name,
                    trend_data=json.dumps(trend_data, ensure_ascii=False)
                )
                session.add(new_record)
                print(f"{category_name} oluşturuldu")
            
            session.commit()
            return True
            
    except Exception as e:
        print(f"DB hatası {category_name}: {e}")
        return False

def main():
    success_count = 0
    
    for i, category in enumerate(CATEGORIES):
        if i > 0:
            wait_time = random.randint(60, 90)
            print(f"⏳ {wait_time} saniye bekleniyor...")
            time.sleep(wait_time)
        
        trend_data = get_trends_data(category)
        
        if trend_data:
            if save_to_db(category, trend_data):
                print(f"{category} başarıyla kaydedildi\n")
                success_count += 1
            else:
                print(f"{category} kaydedilemedi\n")
        else:
            print(f"{category} - veri alınamadı, atlandı\n")
    
    print(f"🎉 İşlem tamamlandı!")
    print(f"{success_count}/{len(CATEGORIES)} kategori başarıyla kaydedildi")
    
    if success_count == 0:
        print("\n no data found")


if __name__ == "__main__":
    main()
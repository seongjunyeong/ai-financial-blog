# Database Schema: news_articles

금융 뉴스 수집을 위한 메인 데이터 저장소입니다.

## Table: news_articles
| Column | Type | Description |
| :--- | :--- | :--- |
| id | uuid | Primary Key |
| title | text | 뉴스 제목 |
| original_url | text | 뉴스 원문 링크 |
| content | text | 뉴스 원문 내용 |
| summary | text | AI 요약본 |
| sentiment_score | numeric | 시장 심리 점수 |
| keywords | text[] | 키워드 리스트 |
| created_at | timestamp | 수집 시간 |
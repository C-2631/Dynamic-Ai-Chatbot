"""Analytics database models, message logging, and aggregated metrics engine."""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime, SmallInteger,
    select, func, desc, case
)
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("chatbot.analytics")

Base = declarative_base()


class MessageLog(Base):
    """Schema matching Section 13.2 of the system architecture."""
    __tablename__ = "message_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(128), index=True, nullable=False)
    ts = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    channel = Column(String(32), default="web", nullable=False)
    intent = Column(String(64), nullable=True)
    confidence = Column(Float, nullable=True)
    sentiment = Column(String(32), nullable=True)
    source = Column(String(32), nullable=True)  # faq | template | llm | clarify | handoff | bandit | slot
    latency_ms = Column(Integer, default=0, nullable=False)
    feedback = Column(SmallInteger, nullable=True)  # 1 = thumbs up, 0 = thumbs down, NULL = unrated


# Configure Database Engine
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.database_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initializes tables in PostgreSQL / SQLite."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error("Failed to initialize database tables: %s", e)

# Auto-initialize database schema
init_db()


def log_turn(
    session_id: str,
    channel: str,
    intent: str,
    confidence: float,
    sentiment: str,
    source: str,
    latency_ms: int
) -> int:
    """Logs an individual conversation turn to the database."""
    session = SessionLocal()
    try:
        record = MessageLog(
            session_id=session_id,
            ts=datetime.now(timezone.utc),
            channel=channel,
            intent=intent,
            confidence=round(confidence, 3),
            sentiment=sentiment,
            source=source,
            latency_ms=latency_ms
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return record.id
    except Exception as e:
        session.rollback()
        logger.error("Failed to log message turn: %s", e)
        return -1
    finally:
        session.close()


def update_feedback(session_id: str, rating: int, message_id: Optional[int] = None) -> bool:
    """
    Records user feedback (thumbs up = 1, thumbs down = 0).
    If message_id is provided, updates that turn; otherwise updates the last turn of the session.
    """
    session = SessionLocal()
    try:
        query = session.query(MessageLog)
        if message_id:
            record = query.filter(MessageLog.id == message_id).first()
        else:
            record = (
                query.filter(MessageLog.session_id == session_id)
                .order_by(desc(MessageLog.id))
                .first()
            )

        if record:
            record.feedback = 1 if rating > 0 else 0
            session.commit()
            return True
        return False
    except Exception as e:
        session.rollback()
        logger.error("Failed to update feedback: %s", e)
        return False
    finally:
        session.close()


def get_analytics_summary(days: int = 7) -> Dict[str, Any]:
    """
    Aggregates performance metrics over the specified time window:
    - Containment rate
    - Average latency (ms)
    - Fallback rate
    - CSAT score (% thumbs up)
    - Total messages
    - Top intents distribution
    - Sentiment distribution
    """
    session = SessionLocal()
    try:
        since_date = datetime.now(timezone.utc) - timedelta(days=days)

        total_msgs = session.query(func.count(MessageLog.id)).filter(MessageLog.ts >= since_date).scalar() or 0
        avg_latency = session.query(func.avg(MessageLog.latency_ms)).filter(MessageLog.ts >= since_date).scalar() or 0.0

        # Fallback count (sources: clarify, handoff)
        fallback_msgs = (
            session.query(func.count(MessageLog.id))
            .filter(MessageLog.ts >= since_date, MessageLog.source.in_(["clarify", "handoff"]))
            .scalar() or 0
        )
        fallback_rate = (fallback_msgs / total_msgs) if total_msgs > 0 else 0.0

        # CSAT: positive feedback / total rated
        total_rated = (
            session.query(func.count(MessageLog.id))
            .filter(MessageLog.ts >= since_date, MessageLog.feedback.isnot(None))
            .scalar() or 0
        )
        positive_rated = (
            session.query(func.count(MessageLog.id))
            .filter(MessageLog.ts >= since_date, MessageLog.feedback == 1)
            .scalar() or 0
        )
        csat = (positive_rated / total_rated) if total_rated > 0 else 1.0

        # Containment Rate: Conversations not requiring human handoff
        handoffs = (
            session.query(func.count(MessageLog.id))
            .filter(MessageLog.ts >= since_date, MessageLog.source == "handoff")
            .scalar() or 0
        )
        containment_rate = ((total_msgs - handoffs) / total_msgs) if total_msgs > 0 else 1.0

        # Top Intents
        top_intents_raw = (
            session.query(MessageLog.intent, func.count(MessageLog.id))
            .filter(MessageLog.ts >= since_date)
            .group_by(MessageLog.intent)
            .order_by(desc(func.count(MessageLog.id)))
            .limit(6)
            .all()
        )
        top_intents = [{"intent": row[0] or "unknown", "count": row[1]} for row in top_intents_raw]

        # Sentiment breakdown
        sentiments_raw = (
            session.query(MessageLog.sentiment, func.count(MessageLog.id))
            .filter(MessageLog.ts >= since_date)
            .group_by(MessageLog.sentiment)
            .all()
        )
        sentiment_breakdown = {row[0] or "neutral": row[1] for row in sentiments_raw}

        return {
            "period_days": days,
            "total_messages": total_msgs,
            "avg_latency_ms": round(float(avg_latency), 1),
            "containment_rate": round(float(containment_rate), 3),
            "fallback_rate": round(float(fallback_rate), 3),
            "csat": round(float(csat), 3),
            "top_intents": top_intents,
            "sentiment_distribution": sentiment_breakdown
        }
    except Exception as e:
        logger.error("Failed to query analytics summary: %s", e)
        return {
            "error": str(e),
            "total_messages": 0,
            "avg_latency_ms": 0,
            "containment_rate": 0.0,
            "fallback_rate": 0.0,
            "csat": 0.0,
            "top_intents": [],
            "sentiment_distribution": {}
        }
    finally:
        session.close()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, users, transactions, categories, dashboard, reports

# Socket.IO setup
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.CORS_ORIGINS.split(',')
)
socket_app = socketio.ASGIApp(sio)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    yield
    # Shutdown
    print("👋 Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    lifespan=lifespan,
    docs_url=f"/api/{settings.API_VERSION}/docs",
    redoc_url=f"/api/{settings.API_VERSION}/redoc",
    openapi_url=f"/api/{settings.API_VERSION}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"/api/{settings.API_VERSION}/users", tags=["Users"])
app.include_router(transactions.router, prefix=f"/api/{settings.API_VERSION}/transactions", tags=["Transactions"])
app.include_router(categories.router, prefix=f"/api/{settings.API_VERSION}/categories", tags=["Categories"])
app.include_router(dashboard.router, prefix=f"/api/{settings.API_VERSION}/dashboard", tags=["Dashboard"])
app.include_router(reports.router, prefix=f"/api/{settings.API_VERSION}/reports", tags=["Reports"])

# Mount Socket.IO
app.mount("/socket.io", socket_app)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.API_VERSION,
        "docs": f"/api/{settings.API_VERSION}/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Socket.IO events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit('connection_response', {'data': 'Connected to server'}, room=sid)


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


# Helper function to emit events (use this in your routes)
async def emit_notification(event: str, data: dict):
    """Emit real-time notification to all connected clients"""
    await sio.emit(event, data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

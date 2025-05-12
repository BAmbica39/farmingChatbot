from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers from other modules
from auth import router as auth_router
from chatbot import router as chatbot_router  # Only if you have chatbot endpoints

app = FastAPI()

# Allow CORS from frontend (Vite dev server usually runs at port 5173)
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def read_root():
    return {"message": "Backend is running. Visit /docs to test the API."}

# Include your routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["Chatbot"])

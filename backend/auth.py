from fastapi import APIRouter, HTTPException, FastAPI
from pydantic import BaseModel
import mysql.connector
import bcrypt
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(data: SignupRequest):
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Anubica0406@#",
            database="farmingdb"
        )
        cursor = db.cursor()

        cursor.execute("SELECT * FROM users WHERE email = %s", (data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Email already exists")

        hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt())

        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                        (data.name, data.email, hashed_password.decode('utf-8')))
        db.commit()
        cursor.close()
        db.close()

        return {"message": "Signup successful"}

    except mysql.connector.Error as err:
        print(f"DB error: {err}")
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")

@router.post("/login")
async def login(data: LoginRequest):
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Anubica0406@#",
            database="farmingdb"
        )
        cursor = db.cursor()
        cursor.execute("SELECT password FROM users WHERE email = %s", (data.email,))
        result = cursor.fetchone()

        if result is None:
            raise HTTPException(status_code=401, detail="Invalid email")

        hashed_password = result[0]

        if not bcrypt.checkpw(data.password.encode('utf-8'), hashed_password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid password")

        return {"message": "Login successful"}

    except mysql.connector.Error as err:
        print(f"DB error: {err}")
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")

app.include_router(router, prefix="/auth")
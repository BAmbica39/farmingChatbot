from fastapi import APIRouter, HTTPException
import pandas as pd
from pydantic import BaseModel

router = APIRouter()

# Load your dataset
df = pd.read_csv("farming_knowledge.csv")

class Question(BaseModel):
    question: str

@router.post("/") # Changed to post request and also the route from /ask to /
async def ask_question(question_data: Question): # changed the param from q:str to question_data:Question
    match = df[df["question"].str.lower() == question_data.question.lower()]
    if not match.empty:
        return {"answer": match.iloc[0]["answer"]}
    else:
        return {"answer": "Sorry, I don't have an answer for that."}
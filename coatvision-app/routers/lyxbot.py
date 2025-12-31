from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI

from ..config import OPENAI_API_KEY



router = APIRouter(
    prefix="/api/lyxbot",
    tags=["lyxbot"],
)


# --------- Modeller ---------

class LyxbotRequest(BaseModel):
    message: str


class LyxbotResponse(BaseModel):
    reply: str


# --------- OpenAI-klient ---------

client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = (
    "Du er LYXbot, en ekspert på bilpleie, lakkorrigering og keramisk coating.\n"
    "Svar på norsk, kort og presist, som en dyktig detailer.\n"
    "Gi konkrete råd om vask, polering, beskyttelse og vedlikehold av bil.\n"
)


# --------- Endepunkt ---------

@router.post("/chat", response_model=LyxbotResponse)
async def lyxbot_chat(body: LyxbotRequest) -> LyxbotResponse:
    """
    Enkelt chat-endepunkt for LYXbot.
    Tar inn en tekst-melding og svarer med AI.
    """
    try:
        completion = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": body.message},
            ],
        )

        reply: Any = completion.choices[0].message.content
        if not reply:
            reply = "Beklager, jeg klarte ikke å generere et svar akkurat nå."

        return LyxbotResponse(reply=str(reply))

    except Exception as e:
        # Logg til terminalen så vi ser ekte feil hvis noe går galt
        print("LYXBOT ERROR:", repr(e))

        # Vis en ryddig feilmelding i Swagger
        raise HTTPException(
            status_code=500,
            detail="Feil mot AI-tjenesten. Prøv igjen senere.",
        ) from e

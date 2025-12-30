from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
from openai import OpenAI
import unicodedata

from ..config import OPENAI_API_KEY

# Router for LYXbot
router = APIRouter(
    prefix="/api/lyxbot",
    tags=["lyxbot"],
)

# OpenAI-klient
client = OpenAI(api_key=OPENAI_API_KEY)


def strip_non_ascii(text: str) -> str:
    """
    Fjerner tegn som ikke lar seg representere i ren ASCII.
    Dette unngår 'ascii codec'-feil i underliggende bibliotek.
    """
    if text is None:
        return ""
    return (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )


# Rå systemprompt (med norske tegn)
SYSTEM_PROMPT_RAW = (
    "Du er LYXbot, en ekspert på bilpleie, lakkorrigering, coating, "
    "interiordetailing og vedlikehold. "
    "Svar pa norsk, kort og presist, og kom gjerne med konkrete produkt- "
    "og maskinanbefalinger nar det er naturlig."
)

# Renset systemprompt som bare inneholder ASCII-tegn
SYSTEM_PROMPT = strip_non_ascii(SYSTEM_PROMPT_RAW)


class LyxbotRequest(BaseModel):
    message: str


class LyxbotResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=LyxbotResponse)
async def lyxbot_chat(body: LyxbotRequest) -> LyxbotResponse:
    """
    Enkelt chat-endepunkt for LYXbot.
    Tar inn en tekst-melding og svarer med AI.
    """
    try:
        user_message = strip_non_ascii(body.message)

        completion = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )

        reply: Any = completion.choices[0].message.content
        if reply is None:
            reply = "Beklager, jeg klarte ikke a generere et svar akkurat na."

        # Vi returnerer som streng
        return LyxbotResponse(reply=str(reply))

    except Exception:
        # Ikke send hele exception-teksten videre (kan inneholde rare tegn)
        raise HTTPException(
            status_code=500,
            detail="Feil mot AI-tjenesten. Proev igjen senere.",
        )

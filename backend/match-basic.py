import base64
import os
from typing import List, Optional

import openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def get_match_score(
    lost_description: str,
    lost_image_path: Optional[str] = None,
    found_image_paths: Optional[List[str]] = None
) -> int:
    if found_image_paths is None:
        found_image_paths = []

    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant that compares lost and found items."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": f"This is a lost item. Description: {lost_description}"}
            ]
        }
    ]

    if lost_image_path:
        try:
            lost_image_base64 = encode_image(lost_image_path)
            messages[1]["content"].append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{lost_image_base64}"}
                }
            )
        except Exception as e:
            print(f"Failed to encode lost image: {e}")

    messages[1]["content"].append(
        {"type": "text", "text": "This is a found item. Do they seem to be the same item? "
                                 "Give a score from 1 (not similar) to 5 (very likely same). Return only the integer score."}
    )

    for path in found_image_paths:
        try:
            found_image_base64 = encode_image(path)
            messages[1]["content"].append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{found_image_base64}"}
                }
            )
        except Exception as e:
            print(f"Failed to encode found image '{path}': {e}")

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=50
        )
        answer = response.choices[0].message.content.strip()
        return int(answer)  # Make sure you expect just an integer
    except Exception as e:
        print(f"OpenAI API call failed: {e}")
        return -1  # Error case

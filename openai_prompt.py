from openai import OpenAI
import json
client = 
    
# Make a request to OpenAI API
response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {
            "role": "system",
            "content": "Create 9 image prompts and text for speech bubbles if there supposed to be any, but there can also be none and then leave it empty for image generation which can be used for a comic page based on the story I will provide you."
        },
        {
            "role": "user",
            "content": "a pirate is on a solo mission to find a hidden island"
        }
    ],
    response_format={
    "type": "json_schema",
    "json_schema": {
        "name": "prompts",
        "schema": {
      "type": "object",
      "properties": {
          "panels": {
              "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "image": {"type": "object", "items": {"type": "string"}},
                        "speech":{"type": "object", "items": {"type": "string"}},
                    }
                }
          }
      },
      "required": [
          "prompt"
      ]
  }
    }
}
)

print(response.choices[0].message.content)
a = json.loads(response.choices[0].message.content)
print(a['panels'][0])

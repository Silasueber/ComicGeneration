"use server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const Character = z.object({
  name: z.string(),
  alter: z.string(),
  erscheinung: z.array(z.string()),
  beweise: z.array(z.string()),
});

const CharacterText = z.object({
  characters: z.array(Character),
});

export const getCharacters = async (text: string) => {
  console.log(process.env.OPENAI_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Extrahiere die Character informationen. Beweise sollen die Text Abteile seien, woher man die Informationen entnehmen kann.",
      },
      {
        role: "user",
        content: text,
      },
    ],
    response_format: zodResponseFormat(CharacterText, "character"),
  });
  console.log(completion.choices[0].message.parsed);
  return completion.choices[0].message.parsed;
};

const Story = z.object({
  prompts: z.array(z.string()),
});

export const getStory = async (text: string) => {
  console.log(process.env.OPENAI_KEY);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Create 9 prompts for image generation which can be used for a comic page based on the story i will provide you",
      },
      {
        role: "user",
        content: text,
      },
    ],
    response_format: zodResponseFormat(Story, "prompts"),
  });
  
  return completion.choices[0].message.parsed;
};


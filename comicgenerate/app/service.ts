"use server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";


const Character = z.object({
  name: z.string(),
  alter: z.string(),
  erscheinung: z.array(z.string()),
  beweise: z.array(z.string()),
});

const CharacterText = z.object({
  characters: z.array(Character),
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { randomUUID } from "crypto";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration


const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const uploadImageFirebase = async (comic: string, title: string) => {
  const storage = getStorage();
  if(title.length == 0)
  {
    title = randomUUID().toString()
  }
  const storageRef = ref(storage, 'comics/'+title+'.png');
  let downloadURL = null
  await uploadString(storageRef, comic, "data_url", {contentType: "image/png"}).then(async (snapshot) => {
    console.log(snapshot.ref.toString())
    await getDownloadURL(storageRef).then(result => downloadURL = result); 
  });
  return downloadURL

}

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


export const uploadImageToCloud = async (comic: string) => {
    const url = "https://api.imgbb.com/1/upload?expiration=600&key="+process.env.IMG_UPLOAD_API;
    const formData = new FormData();
    // console.log(comic)

    formData.append("image", comic);
    formData.append("name", "comictest");
  
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const r = await response.json()
        console.log(r)
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
}
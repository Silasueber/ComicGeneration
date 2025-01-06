"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Image as ImageIcon, PenTool, Type } from "lucide-react";
import { getCharacters } from "./service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const [comic, setComic] = useState("");
  // const [processedImage, setProcessedImage] = useState<string>("");
  const [comicBlob, setComicBlob] = useState<File>();
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [outlineImage, setOutlineImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [charactersInText, setCharactersInText] = useState<{
    characters: {
      name: string;
      alter: string;
      erscheinung: string[];
      beweise: string[];
    }[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("outline");

  const prompting = async () => {
    if (!comic) {
      console.log("select Image first");
      return;
    }
    setLoading(true);
    const response = await fetch(comic);
    const blob = await response.blob();

    // Convert blob into a file (optional)
    const file = new File([blob], "downloadedFile.png", { type: blob.type });

    const formData = new FormData();
    formData.append("image", file);
    formData.append("prompt", promptText);
    
    // Demo only
    setComic("https://cdn-lfs.hf.co/repos/ce/86/ce862bec47b9ac1704f4d1210ab06f90bfe2205d43940d8bbaf0bc46a9ec7aec/37fb019e246ede5d32a8558f307aeac34baf547f2b884edd16013e673aa004a1?response-content-disposition=inline%3B+filename*%3DUTF-8%27%27res_lin.png%3B+filename%3D%22res_lin.png%22%3B&response-content-type=image%2Fpng&Expires=1733934823&Policy=eyJTdGF0ZW1lbnQiOlt7IkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTczMzkzNDgyM319LCJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLWxmcy5oZi5jby9yZXBvcy9jZS84Ni9jZTg2MmJlYzQ3YjlhYzE3MDRmNGQxMjEwYWIwNmY5MGJmZTIyMDVkNDM5NDBkOGJiYWYwYmM0NmE5ZWM3YWVjLzM3ZmIwMTllMjQ2ZWRlNWQzMmE4NTU4ZjMwN2FlYWMzNGJhZjU0N2YyYjg4NGVkZDE2MDEzZTY3M2FhMDA0YTE%7EcmVzcG9uc2UtY29udGVudC1kaXNwb3NpdGlvbj0qJnJlc3BvbnNlLWNvbnRlbnQtdHlwZT0qIn1dfQ__&Signature=jJAB6afDKcT65M2yvXXvBMIZuGnlukQLss4Mlli4Pcy47xAR6A82A93MVH8Ul7A-pCujD%7EhyJ3ej30qgzaRxdgLeL8eglybDuLl7hCG2rptNCgbP93zrS68Z15ZgUPelHFyd6iCcn3QLBbX09Y3TbH6K3xh0yeB0KxEyFJX3kyRD2KINw8d06lJs2UW0iyK8yakKLnYvMLcFokYzciSY04q3IhXtYIoceMIPb4PwW12-O9JwOIWfPjvoFhFaTCk1Ub2x1oo%7EC%7EZ8JFiGseM9f1NJ-xPAdF4nWumAv60-x4kSPBTJkNkkR9EbxRmAimC6yeGlGjaSgu7z95EAC6fZCg__&Key-Pair-Id=K3RPWS32NSSJCE");

    try {
      const response = await fetch("http://127.0.0.1:5000/prompt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      // Convert response to Blob to display image
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setComic(imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSketch = async () => {
    if (!comicBlob) {
      console.log("select Image first");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("image", comicBlob);

    try {
      const response = await fetch("http://127.0.0.1:5000/sketch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }
      // Convert response to Blob to display image
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setOutlineImage(imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServer = async () => {
    if (!comicBlob) {
      console.log("select Image first");
      return;
    }
    const formData = new FormData();
    formData.append("image", comicBlob);

    try {
      const response = await fetch("http://127.0.0.1:5000/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      // Convert response to Blob to display image
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setComic(imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const generateComicPage = async () => {
    // if (!comicBlob) {
    //   console.log("select Image first");
    //   return;
    // }
    // const formData = new FormData();
    // formData.append("image", comicBlob);

    try {
      const response = await fetch("http://127.0.0.1:5000/generatePage", {
        method: "GET",
        // body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setComic(imageUrl);
      // // Convert response to Blob to display image
      // const imageBlob = await response.blob();
      // const imageUrl = URL.createObjectURL(imageBlob);
      // setComic(imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const getCharactersFromText = async () => {
    const c = await getCharacters(text);
    setCharactersInText(c);
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setComic(URL.createObjectURL(event.target.files[0]));
      setComicBlob(event.target.files[0] || null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r shadow-sm">
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab("outline")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "outline"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-100"
            }`}
          >
            <PenTool size={20} />
            <span>Image Outline</span>
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "generate"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-100"
            }`}
          >
            <ImageIcon size={20} />
            <span>Generate Image</span>
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "text"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-100"
            }`}
          >
            <Type size={20} />
            <span>Text Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab("comicPage")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "comicPage"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-100"
            }`}
          >
            <Type size={20} />
            <span>Comic Page Generation</span>
          </button>
        </nav>
      </div>
      <div className="flex-1 flex">
        <div className="w-full p-6 bg-white border-r">
          {activeTab === "outline" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Image Outline</h2>
              <div>
                <Label htmlFor="image-upload">Select an image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="mt-2"
                />
              </div>
              <Button onClick={generateSketch} className="w-full">
                Get Outline
              </Button>
            </div>
          )}
          {activeTab === "comicPage" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Comic Page</h2>
              <Button onClick={generateComicPage} className="w-full">
                Generate Page
              </Button>
              <img
                  key={comic}
                  src={comic}
                  alt={
                    outlineImage ? "Outlined image" : "Uploaded or generated image"
                  }
                  className="max-w-full max-h-[calc(100vh-4rem)] object-contain"
                />
            </div>
          )}
          {activeTab === "generate" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generate Image</h2>
              <div>
                <Label htmlFor="image-upload">Select an image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="prompt-input">Enter prompt</Label>
                <Textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2"
                  placeholder="Enter image generation prompt..."
                />
              </div>
              <Button onClick={prompting} className="w-full">
                Generate Image
              </Button>
            </div>
          )}
          {activeTab === "text" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Text Analysis</h2>
              <div>
                <Label htmlFor="text-input">Enter Chapter</Label>
                <Textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-2"
                  rows={20}
                  placeholder="Enter text here..."
                />
              </div>
              <Button onClick={getCharactersFromText} className="w-full">
                Get Characters
              </Button>
            </div>
          )}
        </div>
        {/* <div className="w-2/3 p-8 overflow-y-auto">
          <img
            src={comic}
            alt={
              outlineImage ? "Outlined image" : "Uploaded or generated image"
            }
            className="max-w-full max-h-[calc(100vh-4rem)] object-contain"
          />
          {(image || outlineImage) &&
            (activeTab === "outline" || activeTab === "generate") && (
              <div className="flex items-center justify-center relative">
                <img
                  src={outlineImage || image}
                  alt={
                    outlineImage
                      ? "Outlined image"
                      : "Uploaded or generated image"
                  }
                  className="max-w-full max-h-[calc(100vh-4rem)] object-contain"
                />
              </div>
            )}
          {activeTab === "text" && charactersInText && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Characters in Text</h2>
              {charactersInText.characters.map((character, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2" />
                      {character.name}
                    </CardTitle>
                    <CardDescription>Age: {character.age}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="appearance">
                        <AccordionTrigger>Appearance</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5">
                            {character.erscheinung.map((trait, i) => (
                              <li key={i}>{trait}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="evidence">
                        <AccordionTrigger>Evidence</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5">
                            {character.beweise.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm font-medium">
                  This can take a while...
                </p>
              </div>
            </div>
          )}
        </div> */}
      </div>
    </div>
    // <div className="flex h-screen bg-gray-100">
    //   <div className="w-1/2 p-8 space-y-6">
    //     <div>
    //       <Label htmlFor="image-upload">Select an image</Label>
    //       <Input
    //         id="image-upload"
    //         type="file"
    //         accept="image/*"
    //         onChange={onImageChange}
    //         className="mt-2"
    //       />
    //     </div>
    //     <div>
    //       <Button onClick={generateSketch} className="w-full">
    //         Get Outline
    //       </Button>
    //     </div>
    //     <div>
    //       <Label htmlFor="text-input">Enter text</Label>
    //       <Textarea
    //         id="text-input"
    //         value={promptText}
    //         onChange={(e: ChangeEvent<HTMLInputElement>) =>
    //           setPromptText(e.target.value)
    //         }
    //         className="mt-2"
    //         placeholder="Enter text here..."
    //       />
    //     </div>
    //     <Button onClick={prompting} className="w-full">
    //       Generate
    //     </Button>
    //   </div>
    //   <div className="w-1/2 p-8 bg-white flex items-center justify-center">
    //     {comic ? (
    //       <>
    //         <img
    //           src={comic}
    //           alt="Uploaded image"
    //           className="max-w-full max-h-full object-contain"
    //         />
    //         {loading && (
    //           <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    //             <div className="bg-white p-4 rounded-lg flex flex-col items-center">
    //               <Loader2 className="h-8 w-8 animate-spin text-primary" />
    //               <p className="mt-2 text-sm font-medium">
    //                 This can take a while...
    //               </p>
    //             </div>
    //           </div>
    //         )}
    //       </>
    //     ) : (
    //       <div className="text-gray-400">No image selected</div>
    //     )}
    //   </div>
    // </div>

    // <div className="m-16">
    //   <div className="">
    //     <main className="flex justify-between w-full">
    //       <div className="left">
    //         <div className="grid w-full max-w-sm items-center gap-1.5">
    //           <Label htmlFor="picture">Picture</Label>

    //           <Input
    //             id="picture"
    //             type="file"
    //             onChange={(e) => onImageChange(e)}
    //           />
    //           <Input
    //             id="prompt"
    //             type="text"
    //             value={promptText}
    //             onChange={(e) => setPromptText(e.target.value)}
    //             placeholder="Describe the Scene as good as possible"
    //           />

    //           <Button onClick={fetchServer}>Generate</Button>
    //           <Button onClick={prompting}>Prompting</Button>
    //           <Button onClick={generateSketch}>Get Sketch</Button>
    //         </div>
    //       </div>
    //       <div className="">
    //         {comic && (
    //           <Image src={comic} alt="comic" width={500} height={500} />
    //         )}
    //         {processedImage && (
    //           <Image
    //             src={processedImage}
    //             alt="comic"
    //             width={500}
    //             height={500}
    //           />
    //         )}
    //       </div>
    //     </main>

    //     <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    //   </div>
    // </div>
  );
}

// export default function Component() {
//   const [image, setImage] = useState<string | null>(null);
//   const [outlineImage, setOutlineImage] = useState<string | null>(null);
//   const [prompt, setPrompt] = useState("");
//   const [text, setText] = useState("");
//   const [characters, setCharacters] = useState<string | null>(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [activeTab, setActiveTab] = useState("outline");

//   const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImage(e.target?.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const getOutline = () => {
//     setIsGenerating(true);
//     setTimeout(() => {
//       setOutlineImage(image);
//       setIsGenerating(false);
//     }, 3000);
//   };

//   const generateImage = () => {
//     setIsGenerating(true);
//     setTimeout(() => {
//       setImage("/placeholder.svg?height=400&width=400");
//       setIsGenerating(false);
//     }, 5000);
//   };

//   const getCharacters = () => {
//     setIsGenerating(true);
//     setTimeout(() => {
//       setCharacters(`Total characters: ${text.length}`);
//       setIsGenerating(false);
//     }, 2000);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <div className="w-64 bg-white border-r shadow-sm">
//         <nav className="p-4 space-y-2">
//           <button
//             onClick={() => setActiveTab("outline")}
//             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//               activeTab === "outline"
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-gray-100"
//             }`}
//           >
//             <PenTool size={20} />
//             <span>Image Outline</span>
//           </button>
//           <button
//             onClick={() => setActiveTab("generate")}
//             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//               activeTab === "generate"
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-gray-100"
//             }`}
//           >
//             <ImageIcon size={20} />
//             <span>Generate Image</span>
//           </button>
//           <button
//             onClick={() => setActiveTab("text")}
//             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//               activeTab === "text"
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-gray-100"
//             }`}
//           >
//             <Type size={20} />
//             <span>Text Analysis</span>
//           </button>
//         </nav>
//       </div>
//       <div className="flex-1 flex">
//         <div className="w-1/3 p-6 bg-white border-r">
//           {activeTab === "outline" && (
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold">Image Outline</h2>
//               <div>
//                 <Label htmlFor="image-upload">Select an image</Label>
//                 <Input
//                   id="image-upload"
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="mt-2"
//                 />
//               </div>
//               <Button onClick={getOutline} className="w-full">
//                 Get Outline
//               </Button>
//             </div>
//           )}
//           {activeTab === "generate" && (
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold">Generate Image</h2>
//               <div>
//                 <Label htmlFor="prompt-input">Enter prompt</Label>
//                 <Textarea
//                   id="prompt-input"
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                   className="mt-2"
//                   placeholder="Enter image generation prompt..."
//                 />
//               </div>
//               <Button onClick={generateImage} className="w-full">
//                 Generate Image
//               </Button>
//             </div>
//           )}
//           {activeTab === "text" && (
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold">Text Analysis</h2>
//               <div>
//                 <Label htmlFor="text-input">Enter text</Label>
//                 <Textarea
//                   id="text-input"
//                   value={text}
//                   onChange={(e) => setText(e.target.value)}
//                   className="mt-2"
//                   placeholder="Enter text here..."
//                 />
//               </div>
//               <Button onClick={getCharacters} className="w-full">
//                 Get Characters
//               </Button>
//               {characters && (
//                 <p className="text-sm font-medium mt-2">{characters}</p>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="w-2/3 p-8 flex items-center justify-center relative">
//           {image || outlineImage ? (
//             <>
//               <img
//                 src={outlineImage || image}
//                 alt={
//                   outlineImage
//                     ? "Outlined image"
//                     : "Uploaded or generated image"
//                 }
//                 className="max-w-full max-h-full object-contain"
//               />
//               {isGenerating && (
//                 <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//                   <div className="bg-white p-4 rounded-lg flex flex-col items-center">
//                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                     <p className="mt-2 text-sm font-medium">
//                       This can take a while...
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-gray-400">No image selected or generated</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

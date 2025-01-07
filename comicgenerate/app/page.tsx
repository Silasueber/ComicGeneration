'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import SilverLora from "../public/Silver.webp"
import JimLora from "../public/jim.webp"
import TomLora from "../public/tom.webp"
import Link from 'next/link'
import { ComicViewer } from './components/ComicViewer'
import Spinner from './components/Spinner'


const loraOptions = [
  { value: "silver", label: 'Silver' },
  { value: "jim", label: 'Jim' },
  { value: "tom", label: 'Tom' },
]

const layoutOptions = [
  { value: 'layout1', label: 'Layout 1' },
  { value: 'layout2', label: 'Layout 2' },
  { value: 'layout3', label: 'Layout 3' },
  { value: 'layout4', label: 'Layout 4' },
  { value: 'layout5', label: 'Layout 5' },
  { value: 'layout6', label: 'Layout 6 - Black background' },
]


export interface PanelDimensions {
  width: number
  height: number
}

export default function GeneratePage() {
  const [storyIdea, setStoryIdea] = useState('')
  const [selectedLora, setSelectedLora] = useState('')
  const [selectedLayout, setSelectedLayout] = useState('')
  const [loading, setLoading] = useState(false)

  const [comic, setComic] = useState<string>()
  const [comicblob, setComicblob] = useState<string>()


  const openSvgInTab = () => {
    const svg = document.getElementById("comic_page")
    // convert to a valid XML source
    const as_text = new XMLSerializer().serializeToString(svg);
    // store in a Blob
    const blob = new Blob([as_text], { type: "image/svg+xml" });
    // create an URI pointing to that blob
    const url = URL.createObjectURL(blob);


    open(url);
  }

  function scaleSvgDimensions(svgText: string) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    const svg = svgElement.getElementsByTagName("svg")
    if(svg.length > 0)
    {
      svg[0].removeAttribute("width");

      svg[0].removeAttribute("height");
    }else{
      svgElement.removeAttribute("width");
      svgElement.removeAttribute("height");
    }

    // // if (width) svgElement.setAttribute('width', scaleValue(width, scaleFactor));
    // // if (height) svgElement.setAttribute('height', scaleValue(height, scaleFactor));
  
  
    // Serialize the modified SVG back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  }

  const blobToBase64 = async (url: string) => {
    return new Promise(async (resolve, _) => {
      // do a request to the blob uri
      const response = await fetch(url);
  
      // response has a method called .blob() to get the blob file
      const blob = await response.blob();
  
      // instantiate a file reader
      const fileReader = new FileReader();
  
      // read the file
      fileReader.readAsDataURL(blob);
  
      fileReader.onloadend = function(){
        resolve(fileReader.result); // Here is the base64 string
      }
    });
  };
  

  async function replaceImage(svgText: string, id: string, newImage: string, prompt: string | null) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    const image = svgDoc.getElementById(id)
    const newData = await blobToBase64(newImage)
    console.log(newData)
    image?.setAttribute("href", newData)
    if(prompt)
    {
      image?.setAttribute("prompt", prompt)
    }
    
   

    // // if (width) svgElement.setAttribute('width', scaleValue(width, scaleFactor));
    // // if (height) svgElement.setAttribute('height', scaleValue(height, scaleFactor));
  
  
    // Serialize the modified SVG back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  }

  const saveSVG = () => {
    const svg = document.getElementById("comic_page")
    // convert to a valid XML source
    const as_text = new XMLSerializer().serializeToString(svg);
    // store in a Blob
    const blob = new Blob([as_text], { type: "image/svg+xml" });
    // create an URI pointing to that blob
    const url = URL.createObjectURL(blob);
    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "comic.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }


  const cleanSvg = async () => {
    // Fetch the raw SVG from the API
    setLoading(true);
    const formData = new FormData();
    formData.append("layout", selectedLayout);
    formData.append("lora", selectedLora);
    formData.append("prompt", storyIdea);

    try {
      const response = await fetch("http://127.0.0.1:5000/get-svg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }
      const svgText = await response.text();

      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      setComicblob(url)
      setComic(scaleSvgDimensions(svgText))
      setLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleLoraCHange = (newLora: string) => {
    
  }

  const handleRedoClick = async (lora: string, panelId: string, panelDimensions: PanelDimensions, prompt: {prompt: string | undefined}): Promise<string> => {
    
    
    const formData = new FormData();
    formData.append("id", panelId);
    formData.append("lora", lora);
    formData.append("width", panelDimensions.width.toString());
    formData.append("height", panelDimensions.height.toString());
    console.log(prompt)
    if(prompt.prompt)
    {

      formData.append("prompt", prompt.prompt);
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/generate_new_image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setComic(await replaceImage(comic!, panelId, url, prompt.prompt!))
      return url
    } catch (error) {
      console.error("Error uploading file:", error);
      return ""
    }
  }

  const handleSelectImage = async (panelId: string, imageUrl: string) => {
    // This is a placeholder. In a real application, you would update your SVG content here.
    console.log(`Selected image ${imageUrl} for panel: ${panelId}`)
    setComic(await replaceImage(comic!, panelId, imageUrl, null ))
    // You might want to update the comic state here with the new image
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Story Generator</h1>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generate Your Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="storyIdea" className="block text-sm font-medium mb-1">
                Story Idea
              </label>
              <Input
                id="storyIdea"
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
                placeholder="Enter your story idea"
              />
            </div>

            <div>
              <label htmlFor="lora" className="block text-sm font-medium mb-1">
                Select LoRA
              </label>
              <Select value={selectedLora} onValueChange={setSelectedLora}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a LoRA" />
                </SelectTrigger>
                <SelectContent>
                  {loraOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedLora && 
            <div className='flex items-center justify-center'>
              <Image width={200} src={selectedLora == "silver" ? SilverLora : selectedLora == "jim" ? JimLora : TomLora} alt='selected Lora'/>
            </div>
            }

            <div>
              <label htmlFor="layout" className="block text-sm font-medium mb-1">
                Select Layout
              </label>
              <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a layout" />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLayout && (
              <div className="mt-4">
                <LayoutSVG layout={selectedLayout} />
              </div>
            )}

            {
              loading ? 
              <Button onClick={cleanSvg} className="w-full" disabled> 
              Loading <Spinner/>
              </Button> : <Button onClick={cleanSvg} className="w-full">
                Generate
              </Button>
            }
            

          {comic &&  (
            <div className='flex flex-col gap-3'>
            <ComicViewer 
                  svgContent={comic} 
                  lora={selectedLora}
                  onGenerateNew={handleRedoClick}
                  onSelectImage={handleSelectImage}
                  onUpdatePrompt={() => console.log("updated prompt")}
                />
            <Button className='w-full' onClick={openSvgInTab}>
              
                Open in new Tab
            </Button>
            <Button onClick={saveSVG} className='w-full'>

              Download Comic
            </Button>
            
          </div>

             
              
           
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function LayoutSVG({ layout }: { layout: string }) {
  const svgContent = {
    layout1: (
        <svg height="350" version="1.1" viewBox="0, 0, 200, 350" width="200">
        <rect data-role="page-background" data-z-index="0" fill="#FFFFFF" height="350" width="240" x="0" y="0"/>
        <rect data-info="1st panel; top row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="152" id="panel_1" width="87" x="12" y="18"/>
        <rect data-info="2nd panel; top row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="73" id="panel_2" width="131" x="104" y="18"/>
        <rect data-info="3rd panel; top row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="73" id="panel_3" width="131" x="104" y="96"/>
        <rect data-info="5th panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor"opacity="0.2"  height="76" id="panel_5" width="71" x="12" y="175"/>
        <rect data-info="6th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor"opacity="0.2"  height="76" id="panel_6" width="71" x="88" y="175"/>
        <rect data-info="7th panel; bottom row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor"opacity="0.2"  height="76" id="panel_7" width="71" x="164" y="175"/>
        <rect data-info="8th panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor"opacity="0.2"  height="76" id="panel_8" width="109" x="12" y="256"/>
        <rect data-info="9th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor"opacity="0.2"  height="76" id="panel_9" width="109" x="126" y="256"/>
        </svg>
    ),
    layout2: (
      <svg height="350" version="1.1" viewBox="0, 0, 200, 350" width="200">
      <rect data-role="page-background" data-z-index="0" fill="#FFFFFF" height="350" width="248" x="0" y="0"/>
      <rect data-info="1st panel; top row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="73" id="panel_1" width="131" x="12" y="18"/>
      <rect data-info="2nd panel; top row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="73" id="panel_2" width="131" x="12" y="96"/>
      <rect data-info="3rd panel; top row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="152" id="panel_3" width="87" x="148" y="18"/>

      <rect data-info="5th panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="76" id="panel_5" width="71" x="12" y="175"/>
      <rect data-info="6th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="76" id="panel_6" width="71" x="88" y="175"/>
      <rect data-info="7th panel; bottom row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="76" id="panel_7" width="71" x="164" y="175"/>

      <rect data-info="8th panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="76" id="panel_8" width="109" x="12" y="256"/>
      <rect data-info="9th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="76" id="panel_9" width="109" x="126" y="256"/>
      </svg>
    ),
    layout3: (
      <svg height="350" version="1.1" viewBox="0, 0, 200, 350" width="200">
        <rect data-info="1st panel; top row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_1" width="131" x="12" y="18"/>
        <rect data-info="2nd panel; top row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_2" width="87" x="148" y="18"/>

        <rect data-info="3rd panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="155" id="panel_3" width="224" x="12" y="98"/>

        <rect data-info="4th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_4" width="87" x="12" y="258"/>
        <rect data-info="5th panel; bottom row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_5" width="131" x="104" y="258"/>
    </svg>
    ),
    layout4: (
      <svg height="350" version="1.1" viewBox="0, 0, 248, 350" width="248" x="0">
        <rect data-role="page-background" data-z-index="0" fill="#FFFFFF" height="350" width="248" x="0" y="0"/>
        <rect data-info="half-page background panel for atmosphere; do not use characters objects as it is partially covered by further panels" data-role="panel" data-z-index="1" fill="currentColor" opacity="0.4" height="175" id="background_panel" width="248" x="0" y="0"/>
      
        <rect data-info="1st panel; top row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="78" id="panel_1" width="71" x="12" y="156"/>
        
        <rect data-info="2nd panel; top row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="78" id="panel_2" width="71" x="88" y="156"/>
        
        <rect data-info="3rd panel; top row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="78" id="panel_3" width="71" x="164" y="156"/>
      

        <rect data-info="5th panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="78" id="panel_5" width="71" x="12" y="240"/>
        
        <rect data-info="6th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="78" id="panel_6" width="71" x="88" y="240"/>
      
        <rect data-info="7th panel; bottom row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="78" id="panel_7" width="71" x="164" y="240"/>
        
      </svg>
    ),
    layout5: (
      <svg height="350" version="1.1" viewBox="0, 0, 248, 350" width="248" x="0">
        <rect data-role="page-background" data-z-index="0" fill="#FFFFFF" height="350" width="248" x="0" y="0"/>
        <rect data-info="half-page background panel for atmosphere; do not use characters objects as it is partially covered by further panels" data-role="panel" data-z-index="1" fill="currentColor" opacity="0.4" height="1440" id="background_panel" width="2480" x="0" y="0"/>
        <rect data-info="1st panel; top row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_1" width="109" x="12" y="98"/>
        <rect data-info="2nd panel; top row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_2" width="109" x="126" y="98"/>
        <rect data-info="3rd panel; middle row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_3" width="71" x="12" y="178"/>
        <rect data-info="4th panel; middle row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_4" width="71" x="88" y="178"/>
        <rect data-info="5th panel; middle row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_5" width="71" x="164" y="178"/>
        <rect data-info="6th panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_6" width="109" x="12" y="258"/>
        <rect data-info="7th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_7" width="109" x="126" y="258"/>
    </svg>
    ),
    layout6: (
      <svg height="350" version="1.1" viewBox="0, 0, 248, 350" width="200">
        <rect data-info="half-page background panel for atmosphere; do not use characters objects as it is partially covered by further panels" data-role="panel" data-z-index="1" fill="currentColor" opacity="0.4" height="144" id="background_panel" width="248" x="0" y="0"/>
        <rect data-info="1st panel; top row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_1" width="109" x="12" y="98"/>
        <rect data-info="2nd panel; top row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_2" width="109" x="126" y="98"/>
        <rect data-info="3rd panel; middle row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_3" width="71" x="12" y="178"/>
        <rect data-info="4th panel; middle row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_4" width="71" x="88" y="178"/>
        <rect data-info="5th panel; middle row; third panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_5" width="71" x="164" y="178"/>
        <rect data-info="6th panel; bottom row; first panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_6" width="109" x="12" y="258"/>
        <rect data-info="7th panel; bottom row; second panel from the left" data-role="panel" data-z-index="2" fill="currentColor" opacity="0.2" height="75" id="panel_7" width="109" x="126" y="258"/>
      </svg>
    ),
  }

  return (
    <div className="flex justify-center">
      {svgContent[layout as keyof typeof svgContent]}
    </div>
  )
}


import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea'
import Spinner from './Spinner'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

interface PopupProps {
  isOpen: boolean
  lora: string,
  onClose: () => void
  panelId: string
  currentPrompt: string
  imageHistory: string[]
  onGenerateNew: (newPrompt: string) => Promise<void>
  onSelectImage: (imageUrl: string) => void
  onUpdatePrompt: (newPrompt: string) => void
  onUpdateLora: (newPrompt: string) => void
}

export function Popup({
  isOpen,
  lora,
  onClose,
  panelId,
  currentPrompt,
  imageHistory,
  onGenerateNew,
  onSelectImage,
  onUpdatePrompt,
  onUpdateLora
}: PopupProps) {
    const [prompt, setPrompt] = useState("")
    const [speech, setSpeech] = useState("")

    useEffect(() => {

      try{
        console.log(currentPrompt) // Ensure keys don't get mismatched)
        setPrompt(JSON.parse(currentPrompt.replaceAll("'",'"'))['image'][0])
        setSpeech(JSON.parse(currentPrompt.replaceAll("'",'"'))['speech'][0])

      }catch(e)
      {
        console.log("Error while parsing JSON" + currentPrompt)
        console.error(e)
      }
    },[])
  
  const [editPrompt, setEditPrompt] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const handleUpdatePrompt = () => {
    console.log(prompt)
    onUpdatePrompt("{'image': ['"+prompt.replaceAll("'","")+"'], 'speech': ['"+speech.replaceAll("'","")+"']}")
    setEditPrompt(false)
  }

  const generateNewImage = async () => {
    setLoading(true)
    await onGenerateNew(prompt)
    setLoading(false)
    
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Panel {panelId} Options</DialogTitle>
          <DialogDescription>
            Update prompt, generate a new image, or select from history
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 ">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input value={lora} onChange={e => onUpdateLora(e.target.value)}/>
            <span className="col-span-4">Current Prompt:</span>
            {
                editPrompt ? 

                <>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="col-span-3"
                />
                <Textarea
                  id="speech"
                  value={speech}
                  onChange={(e) => setSpeech(e.target.value)}
                  className="col-span-3"
                />
                <Button onClick={handleUpdatePrompt} className="col-span-1">Update</Button>
                </>
                 : 
                 <>
                  <p className="col-span-4 text-sm text-muted-foreground"><b>Image Prompt:</b> {prompt}</p>
                  <p className="col-span-4 text-sm text-muted-foreground"><b>Dialogue:</b> {speech}</p>
                 <Button onClick={() => setEditPrompt(!editPrompt)} className="col-span-1">Edit</Button>
                 </>
            
            }
            
          </div>
          {
            loading ? 
            <Button onClick={generateNewImage} disabled>Loading <Spinner/></Button>
            :

            <Button onClick={generateNewImage}>Generate New Image</Button>
          }
          <div className='w-full flex items-center justify-center'>

          <div className='w-8/12'>


          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-sm"
          >
          <CarouselContent>
          {imageHistory.map((imageUrl, index) => (
            <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
            <div className="p-1">
              {/* <Card>
                <CardContent className="flex justify-center p-2 overflow-hidden"> */}
                  
                <img
                key={index}
                src={imageUrl}
                alt={`History image ${index + 1}`}
                className="w-full cursor-pointer border border-gray-200 hover:border-primary"
                onClick={() => onSelectImage(imageUrl)}
              />
                {/* </CardContent>
              </Card> */}
            </div>
          </CarouselItem>
             
            ))}

            
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
          </div>
          </div>
          {/* <div className="grid grid-cols-2 gap-2">
            {imageHistory.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`History image ${index + 1}`}
                className="w-full h-auto cursor-pointer border border-gray-200 hover:border-primary"
                onClick={() => onSelectImage(imageUrl)}
              />
            ))}
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}


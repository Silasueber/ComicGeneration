import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea'
import Spinner from './Spinner'

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  panelId: string
  currentPrompt: string
  imageHistory: string[]
  onGenerateNew: (newPrompt: string) => Promise<void>
  onSelectImage: (imageUrl: string) => void
  onUpdatePrompt: (newPrompt: string) => void
}

export function Popup({
  isOpen,
  onClose,
  panelId,
  currentPrompt,
  imageHistory,
  onGenerateNew,
  onSelectImage,
  onUpdatePrompt
}: PopupProps) {
  const [prompt, setPrompt] = useState(currentPrompt)
  const [editPrompt, setEditPrompt] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const handleUpdatePrompt = () => {
    onUpdatePrompt(prompt)
    setEditPrompt(false)
  }

  const generateNewImage = async () => {
    setLoading(true)
    await onGenerateNew(prompt)
    setLoading(false)
    
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Panel {panelId} Options</DialogTitle>
          <DialogDescription>
            Update prompt, generate a new image, or select from history
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
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
                <Button onClick={handleUpdatePrompt} className="col-span-1">Update</Button>
                </>
                 : 
                 <>
                <p className="col-span-4 text-sm text-muted-foreground">{currentPrompt}</p>
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
          <div className="grid grid-cols-2 gap-2">
            {imageHistory.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`History image ${index + 1}`}
                className="w-full h-auto cursor-pointer border border-gray-200 hover:border-primary"
                onClick={() => onSelectImage(imageUrl)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


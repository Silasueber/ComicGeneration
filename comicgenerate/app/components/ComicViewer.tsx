import { useEffect, useState, useCallback } from 'react'
import { RedoArrow } from './RedoArrow'
import { Popup } from './Popup'
import { PanelDimensions } from '../page'

interface ComicViewerProps {
  svgContent: string,
  lora: string,
  onGenerateNew: (lora: string, panelId: string, dimensions: PanelDimensions, prompt: {prompt: string | undefined}) => Promise<string>
  onSelectImage: (panelId: string, imageUrl: string) => void
  onUpdatePrompt: (panelId: string, newPrompt: string) => void
}

export function ComicViewer({ lora, svgContent, onGenerateNew, onSelectImage, onUpdatePrompt  }: ComicViewerProps) {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const [redoPositions, setRedoPositions] = useState<{ [key: string]: { top: number; left: number } }>({})
  const [panelDimensions, setPanelDimensions] = useState<{ [key: string]: PanelDimensions }>({})
  const [panelPrompts, setPanelPrompts] = useState<{ [key: string]: {prompt: string | undefined} }>({})
  const [imageHistory, setImageHistory] = useState<{ [key: string]: string[] }>({})
  const [activePopup, setActivePopup] = useState<string | null>(null)
  const [imageLora, setImageLora] = useState(lora)

  const calculatePositions = useCallback(() => {
    if (containerRef) {
      const positions: { [key: string]: { top: number; left: number } } = {}
      const dimensions: { [key: string]: PanelDimensions } = {}
      const prompts: { [key: string]: {prompt: string | undefined} } = {}

      for (let i = 1; i <= 9; i++) {
        const panel = containerRef.querySelector(`#panel_${i}`)
        if (panel instanceof SVGImageElement) {
          const rect = panel.getBoundingClientRect()
          const containerRect = containerRef.getBoundingClientRect()
          positions[`panel_${i}`] = {
            top: rect.top - containerRect.top,
            left: rect.right - containerRect.left, // 20px from the right edge
          }
          dimensions[`panel_${i}`] = {
            width: panel.width.baseVal.value,
            height: panel.height.baseVal.value
          }
          prompts[`panel_${i}`] = {
            prompt: panel.getAttribute("prompt") || undefined
          }
          
          // Initialize image history for each panel
          if (!imageHistory[`panel_${i}`]) {
            setImageHistory(prev => ({
              ...prev,
              [`panel_${i}`]: [panel.getAttribute("href") || ""]
            }))
          }
        }
      }

      try{
        const panel = containerRef.querySelector(`#background_panel`)
        if (panel instanceof SVGImageElement) {
          const rect = panel.getBoundingClientRect()
          const containerRect = containerRef.getBoundingClientRect()
          positions[`background_panel`] = {
            top: rect.top - containerRect.top,
            left: rect.right - containerRect.left, // 20px from the right edge
          }
          dimensions[`background_panel`] = {
            width: panel.width.baseVal.value,
            height: panel.height.baseVal.value
          }
          prompts[`background_panel`] = {
            prompt: panel.getAttribute("prompt") || undefined
          }
          
          // Initialize image history for each panel
          if (!imageHistory[`background_panel`]) {
            setImageHistory(prev => ({
              ...prev,
              [`background_panel`]: [panel.getAttribute("href") || ""]
            }))
          }
        }
      }catch(e)
      {
        console.error(e)
      }

      setRedoPositions(positions)
      setPanelDimensions(dimensions)
      setPanelPrompts(prompts)
    }
  }, [containerRef, imageHistory])

  useEffect(() => {
    if (containerRef) {
      containerRef.innerHTML = svgContent

      requestAnimationFrame(() => {
        setTimeout(calculatePositions, 0)
      })
    }
  }, [svgContent, containerRef, calculatePositions])

  useEffect(() => {
    window.addEventListener('resize', calculatePositions)
    return () => window.removeEventListener('resize', calculatePositions)
  }, [calculatePositions])

  const getPanelDimensions = (panelId: string): PanelDimensions | null => {
    return panelDimensions[panelId] || null
  }

  const handleRedoClick = (panelId: string) => {
    setActivePopup(panelId)
  }

  const handleUpdatePrompt = (panelId: string, newPrompt: string) => {
    onUpdatePrompt(panelId, newPrompt)
    setPanelPrompts(prev => ({
      ...prev,
      [panelId]: { prompt: newPrompt }
    }))
  }


  const handleClosePopup = () => {
    setActivePopup(null)
  }

  const handleGenerateNew = async (panelId: string) => {
    const newImageUrl = await onGenerateNew(imageLora, panelId, getPanelDimensions(panelId)!, {prompt: panelPrompts[panelId]?.prompt})
    setImageHistory(prev => ({
      ...prev,
      [panelId]: [...(prev[panelId] || []), newImageUrl]
    }))
  }

  const handleSelectImage = (panelId: string, imageUrl: string) => {
    onSelectImage(panelId, imageUrl)
    handleClosePopup()
  }

  

  const generateRedoArrows = () => {
    return Object.entries(redoPositions).map(([panelId, position]) => (
      <div
        key={panelId}
        className="absolute z-10"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <RedoArrow onClick={() => handleRedoClick(panelId)} />
        {activePopup === panelId && (
          <Popup
            isOpen={true}
            onClose={handleClosePopup}
            panelId={panelId}
            currentPrompt={panelPrompts[panelId]?.prompt || ""}
            imageHistory={imageHistory[panelId] || []}
            lora={imageLora}
            onUpdateLora={(e) => setImageLora(e)}
            onGenerateNew={() => handleGenerateNew(panelId)}
            onSelectImage={(imageUrl) => handleSelectImage(panelId, imageUrl)}
            onUpdatePrompt={(newPrompt) => handleUpdatePrompt(panelId, newPrompt)}
          />
        )}
      </div>
    ))
  }

  return (
    <div className="relative">
      <div ref={setContainerRef} className="relative">
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      </div>
      {generateRedoArrows()}
    </div>
  )
}


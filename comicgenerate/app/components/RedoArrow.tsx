import { ArrowPathIcon } from '@heroicons/react/24/solid'

interface RedoArrowProps {
  onClick: () => void;
}

export function RedoArrow({ onClick }: RedoArrowProps) {
  return (
    <div 
      className="absolute top-1 right-1 p-1 bg-white rounded-full cursor-pointer"
      onClick={onClick}
    >
      <ArrowPathIcon className="w-4 h-4 text-gray-600" />
    </div>
  )
}


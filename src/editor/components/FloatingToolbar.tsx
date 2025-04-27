import React from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, 
  IndentDecrease, IndentIncrease, Eraser 
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

interface FloatingToolbarProps {
  position: { x: number; y: number };
  onClose: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ position, onClose }) => {
  const {
    isBold,
    isItalic,
    isUnderline,
    alignment,
    isBulletList,
    isNumberedList,
    indentLevel,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    setAlignment,
    toggleBulletList,
    toggleNumberedList,
    setIndentLevel,
  } = useEditorStore();

  return (
    <div 
      className="fixed bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 z-50"
      style={{ 
        top: `${position.y - 40}px`, 
        left: `${position.x}px`,
      }}
    >
      <button 
        className={`p-1 rounded ${isBold ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={toggleBold}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button 
        className={`p-1 rounded ${isItalic ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={toggleItalic}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button 
        className={`p-1 rounded ${isUnderline ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={toggleUnderline}
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-300 mx-2" />

      <button 
        className={`p-1 rounded ${alignment === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={() => setAlignment('left')}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button 
        className={`p-1 rounded ${alignment === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={() => setAlignment('center')}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button 
        className={`p-1 rounded ${alignment === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={() => setAlignment('right')}
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button 
        className={`p-1 rounded ${alignment === 'justify' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={() => setAlignment('justify')}
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-300 mx-2" />

      <button 
        className={`p-1 rounded ${isBulletList ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={toggleBulletList}
      >
        <List className="w-4 h-4" />
      </button>
      <button 
        className={`p-1 rounded ${isNumberedList ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        onClick={toggleNumberedList}
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-300 mx-2" />

      <button 
        className="p-1 rounded hover:bg-gray-100"
        onClick={() => setIndentLevel(Math.max(0, indentLevel - 1))}
      >
        <IndentDecrease className="w-4 h-4" />
      </button>
      <button 
        className="p-1 rounded hover:bg-gray-100"
        onClick={() => setIndentLevel(indentLevel + 1)}
      >
        <IndentIncrease className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-300 mx-2" />

      <button className="p-1 rounded hover:bg-gray-100">
        <Eraser className="w-4 h-4" />
      </button>
    </div>
  );
}; 
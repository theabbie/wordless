import React, { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { useEditorStore } from '../store/editorStore';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, 
  IndentDecrease, IndentIncrease, Eraser, Type, 
  ChevronDown, ChevronUp, Maximize2, Minimize2, X,
  Quote, Code, FileText, Heading1, Heading2, Heading3,
  Undo, Redo
} from 'lucide-react';
import { FloatingToolbar } from './FloatingToolbar';
import { MentionDropdown } from './MentionDropdown';

interface MentionState {
  isActive: boolean;
  query: string;
  position: { x: number; y: number };
}

export const Editor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    query: '',
    position: { x: 0, y: 0 },
  });

  const {
    content,
    isBold,
    isItalic,
    isUnderline,
    fontSize,
    fontFamily,
    alignment,
    isBulletList,
    isNumberedList,
    indentLevel,
    headingLevel,
    blockType,
    setContent,
    setSelection,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    setFontSize,
    setFontFamily,
    setAlignment,
    toggleBulletList,
    toggleNumberedList,
    setIndentLevel,
    setHeadingLevel,
    setBlockType,
    undo,
    redo,
  } = useEditorStore();

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const rect = range.getBoundingClientRect();
          setToolbarPosition({
            x: rect.left + (rect.width / 2),
            y: rect.top,
          });
          setShowFloatingToolbar(true);
        } else {
          setShowFloatingToolbar(false);
        }
        setSelection({
          start: range.startOffset,
          end: range.endOffset,
        });
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [setSelection]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          toggleBold();
          break;
        case 'i':
          e.preventDefault();
          toggleItalic();
          break;
        case 'u':
          e.preventDefault();
          toggleUnderline();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    setContent(content);

    // Handle @ mentions
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = range.startContainer.textContent || '';
      const position = range.getBoundingClientRect();
      
      // Check if we're typing an @ mention
      const lastAtSymbol = text.lastIndexOf('@');
      if (lastAtSymbol !== -1) {
        const query = text.slice(lastAtSymbol + 1);
        if (query.length > 0) {
          setMentionState({
            isActive: true,
            query,
            position: {
              x: position.left,
              y: position.bottom,
            },
          });
          return;
        }
      }
    }

    setMentionState(prev => ({ ...prev, isActive: false }));
  };

  const handleMentionSelect = (user: { id: string; name: string }) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = range.startContainer.textContent || '';
      const lastAtSymbol = text.lastIndexOf('@');
      
      if (lastAtSymbol !== -1) {
        const before = text.slice(0, lastAtSymbol);
        const mention = `@${user.name}`;
        const after = text.slice(range.startOffset);
        
        const newText = before + mention + after;
        range.startContainer.textContent = newText;
        
        // Move cursor to end of mention
        const newRange = document.createRange();
        newRange.setStart(range.startContainer, lastAtSymbol + mention.length);
        newRange.setEnd(range.startContainer, lastAtSymbol + mention.length);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    setMentionState(prev => ({ ...prev, isActive: false }));
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  useEffect(() => {
    if (editorRef.current) {
      applyFormat('bold', isBold ? 'true' : 'false');
    }
  }, [isBold]);

  useEffect(() => {
    if (editorRef.current) {
      applyFormat('italic', isItalic ? 'true' : 'false');
    }
  }, [isItalic]);

  useEffect(() => {
    if (editorRef.current) {
      applyFormat('underline', isUnderline ? 'true' : 'false');
    }
  }, [isUnderline]);

  useEffect(() => {
    if (editorRef.current) {
      applyFormat('justifyLeft', alignment === 'left' ? 'true' : 'false');
      applyFormat('justifyCenter', alignment === 'center' ? 'true' : 'false');
      applyFormat('justifyRight', alignment === 'right' ? 'true' : 'false');
      applyFormat('justifyFull', alignment === 'justify' ? 'true' : 'false');
    }
  }, [alignment]);

  useEffect(() => {
    if (editorRef.current) {
      applyFormat('insertUnorderedList', isBulletList ? 'true' : 'false');
    }
  }, [isBulletList]);

  useEffect(() => {
    if (editorRef.current) {
      applyFormat('insertOrderedList', isNumberedList ? 'true' : 'false');
    }
  }, [isNumberedList]);

  useEffect(() => {
    if (editorRef.current) {
      applyFormat('outdent', 'true');
      for (let i = 0; i < indentLevel; i++) {
        applyFormat('indent', 'true');
      }
    }
  }, [indentLevel]);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-md">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <X className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-4 text-sm">
            <button className="hover:bg-gray-200 px-2 py-1 rounded">File</button>
            <button className="hover:bg-gray-200 px-2 py-1 rounded">Edit</button>
            <button className="hover:bg-gray-200 px-2 py-1 rounded">View</button>
            <button className="hover:bg-gray-200 px-2 py-1 rounded">Insert</button>
            <button className="hover:bg-gray-200 px-2 py-1 rounded">Format</button>
            <button className="hover:bg-gray-200 px-2 py-1 rounded">Tools</button>
            <button className="hover:bg-gray-200 px-2 py-1 rounded">Table</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 p-2 border-b">
          <select 
            className="border rounded px-2 py-1"
            value={headingLevel}
            onChange={(e) => setHeadingLevel(e.target.value as any)}
          >
            <option value="p">Normal text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <select 
            className="border rounded px-2 py-1"
            value={blockType}
            onChange={(e) => setBlockType(e.target.value as any)}
          >
            <option value="p">Paragraph</option>
            <option value="blockquote">Quote</option>
            <option value="pre">Code Block</option>
            <option value="div">Normal Block</option>
          </select>

          <select 
            className="border rounded px-2 py-1"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
          
          <select 
            className="border rounded px-2 py-1"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          >
            {[8,9,10,11,12,14,16,18,20,24,30,36,48,60,72,96].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-gray-300 mx-2" />

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

          <button 
            className="p-1 rounded hover:bg-gray-100"
            onClick={undo}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-100"
            onClick={redo}
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <button className="p-1 rounded hover:bg-gray-100">
            <Eraser className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={editorRef}
        contentEditable
        className="flex-1 p-4 bg-white m-4 rounded-lg shadow-md focus:outline-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          textAlign: alignment,
        }}
      />

      {showFloatingToolbar && (
        <FloatingToolbar 
          position={toolbarPosition}
          onClose={() => setShowFloatingToolbar(false)}
        />
      )}

      {mentionState.isActive && (
        <MentionDropdown
          query={mentionState.query}
          position={mentionState.position}
          onSelect={handleMentionSelect}
          onClose={() => setMentionState(prev => ({ ...prev, isActive: false }))}
        />
      )}
    </div>
  );
}; 
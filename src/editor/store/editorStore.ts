import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  content: string;
  selection: {
    start: number;
    end: number;
  } | null;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  fontSize: string;
  fontFamily: string;
  textColor: string;
  highlightColor: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  isBulletList: boolean;
  isNumberedList: boolean;
  indentLevel: number;
  headingLevel: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  blockType: 'p' | 'blockquote' | 'pre' | 'div';
  history: {
    past: string[];
    future: string[];
  };
  setContent: (content: string) => void;
  setSelection: (selection: { start: number; end: number } | null) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  setFontSize: (size: string) => void;
  setFontFamily: (family: string) => void;
  setTextColor: (color: string) => void;
  setHighlightColor: (color: string) => void;
  setAlignment: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  toggleBulletList: () => void;
  toggleNumberedList: () => void;
  setIndentLevel: (level: number) => void;
  setHeadingLevel: (level: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => void;
  setBlockType: (type: 'p' | 'blockquote' | 'pre' | 'div') => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      content: '',
      selection: null,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      fontSize: '16',
      fontFamily: 'Arial',
      textColor: '#000000',
      highlightColor: '#ffffff',
      alignment: 'left',
      isBulletList: false,
      isNumberedList: false,
      indentLevel: 0,
      headingLevel: 'p',
      blockType: 'p',
      history: {
        past: [],
        future: [],
      },
      setContent: (content) => {
        const { history } = get();
        set({
          content,
          history: {
            past: [...history.past.slice(-50), content],
            future: [],
          },
        });
      },
      setSelection: (selection) => set({ selection }),
      toggleBold: () => set((state) => ({ isBold: !state.isBold })),
      toggleItalic: () => set((state) => ({ isItalic: !state.isItalic })),
      toggleUnderline: () => set((state) => ({ isUnderline: !state.isUnderline })),
      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (family) => set({ fontFamily: family }),
      setTextColor: (color) => set({ textColor: color }),
      setHighlightColor: (color) => set({ highlightColor: color }),
      setAlignment: (alignment) => set({ alignment }),
      toggleBulletList: () => set((state) => ({ isBulletList: !state.isBulletList })),
      toggleNumberedList: () => set((state) => ({ isNumberedList: !state.isNumberedList })),
      setIndentLevel: (level) => set({ indentLevel: level }),
      setHeadingLevel: (level) => set({ headingLevel: level }),
      setBlockType: (type) => set({ blockType: type }),
      undo: () => {
        const { history, content } = get();
        if (history.past.length > 0) {
          const newPast = history.past.slice(0, -1);
          const previous = history.past[history.past.length - 1] || '';
          set({
            content: previous,
            history: {
              past: newPast,
              future: [content, ...history.future],
            },
          });
        }
      },
      redo: () => {
        const { history, content } = get();
        if (history.future.length > 0) {
          const next = history.future[0];
          set({
            content: next,
            history: {
              past: [...history.past, content],
              future: history.future.slice(1),
            },
          });
        }
      },
      saveToHistory: () => {
        const { content, history } = get();
        set({
          history: {
            past: [...history.past.slice(-50), content],
            future: [],
          },
        });
      },
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({
        content: state.content,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        textColor: state.textColor,
        highlightColor: state.highlightColor,
        alignment: state.alignment,
        headingLevel: state.headingLevel,
        blockType: state.blockType,
      }),
    }
  )
); 
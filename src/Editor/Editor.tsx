import {
  $getRoot,
  $getSelection,
  type EditorState,
  LexicalEditor
} from 'lexical';
import { useEffect, useState } from 'react';

import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
// import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import {
  useLexicalComposerContext,
} from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { CAN_USE_DOM } from './_environment.ts';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { ToolbarContext } from './context/ToolbarContext.tsx';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ShortcutsPlugin from './plugins/ShortcutsPlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import ContentEditable from './ui/ContentEditable';
import FloatingTextFormatToolbarPlugin
  from './plugins/FloatingTextFormatToolbarPlugin';
import CommentPlugin from './plugins/CommentPlugin';
import { TableContext } from './plugins/TablePlugin';
import PlaygroundNodes from './nodes/PlaygroundNodes';

import './Editor.css';
import { createEmptyEditorState } from './utils/createEmptyEditorState.ts';
import { transMarkdown } from './utils/transMarkdown.ts';

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState: EditorState) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    console.log(root, selection);
  });
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

export type EditorProps = {
  content?: string;
}

export function Editor({ content }: EditorProps) {
  const initialConfig: InitialConfigType = {
    namespace: 'Playground',
    theme: PlaygroundEditorTheme,
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    editorState: (editor: LexicalEditor) => {
      if (content?.trim().length) {
        editor.update(() => transMarkdown(content));
      }
      return '';
    }
  };

  return (
    <div className={'editor-shell'}>
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <ToolbarContext>
            <EditorInner/>
          </ToolbarContext>
        </SharedHistoryContext>
      </LexicalComposer>
    </div>
  );
}

const EditorInner = () => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);

  const placeholder = 'Enter some rich text...';

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <div className={'editor-container'}>
      <CommentPlugin
        // providerFactory={undefined}
      />
      <ToolbarPlugin
        editor={editor}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <ShortcutsPlugin
        editor={activeEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      {floatingAnchorElem != null && !isSmallWidthViewport && (
        <>
          <FloatingTextFormatToolbarPlugin
            anchorElem={floatingAnchorElem}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        </>
      )}
      <RichTextPlugin
        contentEditable={
          <div className="editor-scroller">
            <div className="editor" ref={onRef}>
              <ContentEditable placeholder={placeholder}/>
            </div>
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/*<PlainTextPlugin*/}
      {/*  contentEditable={*/}
      {/*    <ContentEditable*/}
      {/*      aria-placeholder={'Enter some text...'}*/}
      {/*      placeholder={<div>Enter some text...</div>}*/}
      {/*    />*/}
      {/*  }*/}
      {/*  ErrorBoundary={LexicalErrorBoundary}*/}
      {/*/>*/}
      <OnChangePlugin onChange={onChange}/>
      <HistoryPlugin/>
      <MyCustomAutoFocusPlugin/>
    </div>
  );
};

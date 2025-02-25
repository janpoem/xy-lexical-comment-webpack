import { Editor } from './Editor';

export function App() {

  return (
    <>
      {/* padding to show comment icon */}
      <div style={{ height: 60 }} />
      <Editor content={'# Hello, World!'} />
    </>
  );
}

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import EmailEditor, { type EditorRef, type EmailEditorProps } from 'react-email-editor';
import type { TemplateDesign, TemplateVariable } from '@/types';
import { variablesToMergeTags } from '@/lib/templates/editor';

export interface TemplateEmailEditorHandle {
  exportDesign: () => Promise<{ html: string; design: TemplateDesign }>;
  isReady: () => boolean;
}

interface TemplateEmailEditorProps {
  design?: TemplateDesign | null;
  variables?: TemplateVariable[] | null;
}

const TemplateEmailEditor = forwardRef<TemplateEmailEditorHandle, TemplateEmailEditorProps>(
  function TemplateEmailEditor({ design, variables }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorRef>(null);
    const readyRef = useRef(false);
    const designRef = useRef(design);
    const [height, setHeight] = useState(0);

    designRef.current = design;

    useEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      const updateHeight = () => {
        const next = Math.floor(node.getBoundingClientRect().height);
        if (next > 0) setHeight(next);
      };

      updateHeight();
      const observer = new ResizeObserver(updateHeight);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const handleReady: EmailEditorProps['onReady'] = (unlayer) => {
      readyRef.current = true;

      const nextDesign = designRef.current;
      if (nextDesign) {
        unlayer.loadDesign(
          nextDesign as Parameters<NonNullable<EditorRef['editor']>['loadDesign']>[0],
        );
      }

      unlayer.setMergeTags(variablesToMergeTags(variables));
    };

    useEffect(() => {
      const editor = editorRef.current?.editor;
      if (!editor || !readyRef.current) return;
      editor.setMergeTags(variablesToMergeTags(variables));
    }, [variables]);

    useImperativeHandle(ref, () => ({
      exportDesign: () =>
        new Promise((resolve, reject) => {
          const editor = editorRef.current?.editor;

          if (!editor || !readyRef.current) {
            reject(new Error('Editor is not ready yet.'));
            return;
          }

          editor.exportHtml((data) => {
            resolve({
              html: data.html,
              design: data.design as TemplateDesign,
            });
          });
        }),
      isReady: () => readyRef.current,
    }));

    return (
      <div ref={containerRef} className="h-full min-h-0 w-full">
        {height > 0 ? (
          <EmailEditor
            ref={editorRef}
            minHeight={`${height}px`}
            onReady={handleReady}
            options={{
              displayMode: 'email',
              version: 'stable',
              devices: ['desktop', 'mobile'],
              defaultDevice: 'desktop',
              mergeTags: variablesToMergeTags(variables),
            }}
          />
        ) : null}
      </div>
    );
  },
);

export default TemplateEmailEditor;

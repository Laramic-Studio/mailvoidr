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

const HEIGHT_REMOUNT_DELTA = 48;

function unlayerProjectId(): number | undefined {
  const raw = import.meta.env.VITE_UNLAYER_PROJECT_ID;
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

const TemplateEmailEditor = forwardRef<TemplateEmailEditorHandle, TemplateEmailEditorProps>(
  function TemplateEmailEditor({ design, variables }, ref) {
    const projectId = unlayerProjectId();
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorRef>(null);
    const readyRef = useRef(false);
    const designRef = useRef(design);
    const heightRef = useRef(0);
    const resizingRef = useRef(false);
    const [height, setHeight] = useState(0);
    const [instanceKey, setInstanceKey] = useState(0);

    designRef.current = design;

    useEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      const applyHeight = (next: number) => {
        if (next <= 0) return;

        const previous = heightRef.current;
        const delta = Math.abs(next - previous);

        // First measurement — mount editor.
        if (previous === 0) {
          heightRef.current = next;
          setHeight(next);
          return;
        }

        // Significant resize after ready — remount with preserved design so Unlayer fills.
        if (readyRef.current && delta >= HEIGHT_REMOUNT_DELTA && !resizingRef.current) {
          const editor = editorRef.current?.editor;
          if (!editor) {
            heightRef.current = next;
            setHeight(next);
            return;
          }

          resizingRef.current = true;
          editor.exportHtml((data) => {
            designRef.current = data.design as TemplateDesign;
            readyRef.current = false;
            heightRef.current = next;
            setHeight(next);
            setInstanceKey((key) => key + 1);
            resizingRef.current = false;
          });
          return;
        }

        heightRef.current = next;
        setHeight(next);
      };

      const updateHeight = () => {
        applyHeight(Math.floor(node.getBoundingClientRect().height));
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
            reject(new Error('Editor is still loading.'));
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
            key={instanceKey}
            ref={editorRef}
            minHeight={`${height}px`}
            onReady={handleReady}
            options={{
              ...(projectId ? { projectId } : {}),
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

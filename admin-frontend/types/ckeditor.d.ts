declare module '@ckeditor/ckeditor5-react' {
  import { ComponentType } from 'react';

  export interface CKEditorProps {
    editor: any;
    config?: any;
    data?: string;
    onChange?: (event: any, editor: any) => void;
    onReady?: (editor: any) => void;
    onFocus?: (event: any, editor: any) => void;
    onBlur?: (event: any, editor: any) => void;
    disabled?: boolean;
    id?: string;
  }

  export const CKEditor: ComponentType<CKEditorProps>;
}

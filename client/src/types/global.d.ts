/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'react' {
  interface CSSProperties {
    [key: string]: any;
  }
}

declare module 'lucide-react';

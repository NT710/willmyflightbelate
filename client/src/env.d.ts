/// <reference types="vite/client" />

declare module '*.svg' {
  import React = require('react');
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module 'react' {
  interface CSSProperties {
    [key: string]: any;
  }
}

declare module 'lucide-react'

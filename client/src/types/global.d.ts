/// <reference types="vite/client" />

import React from 'react';

declare module 'lucide-react';

declare module '@/*';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    className?: string;
  }
  
  interface CSSProperties {
    [key: string]: any;
  }
}

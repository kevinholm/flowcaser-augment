// React JSX runtime types
/// <reference types="react" />

declare module 'react/jsx-runtime' {
  export function jsx(
    type: any,
    props: any,
    key?: any
  ): React.ReactElement<any, any>
  
  export function jsxs(
    type: any,
    props: any,
    key?: any
  ): React.ReactElement<any, any>
  
  export function Fragment(props: { children?: React.ReactNode }): React.ReactElement
}

declare module 'react/jsx-dev-runtime' {
  export function jsxDEV(
    type: any,
    props: any,
    key?: any,
    isStaticChildren?: boolean,
    source?: any,
    self?: any
  ): React.ReactElement<any, any>
  
  export function Fragment(props: { children?: React.ReactNode }): React.ReactElement
}

// Global JSX namespace
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {}
    interface ElementAttributesProperty {
      props: {}
    }
    interface ElementChildrenAttribute {
      children: {}
    }
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export {}

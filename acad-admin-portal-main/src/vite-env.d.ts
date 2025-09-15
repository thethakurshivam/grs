/// <reference types="vite/client" />

// Allow importing PDF files as URLs
declare module '*.pdf' {
  const src: string;
  export default src;
}

declare module "@supabase/ssr" {
  /** Minimal declarations to satisfy TypeScript in this project. */
  export function createServerClient(...args: any[]): any;
  export function createBrowserClient(...args: any[]): any;
  const _default: {
    createServerClient: any;
    createBrowserClient: any;
  };
  export default _default;
}

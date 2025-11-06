declare module "@radix-ui/react-slot" {
  import * as React from "react";

  // Minimal Slot typing to satisfy imports like: import { Slot } from '@radix-ui/react-slot'
  export const Slot: React.ForwardRefExoticComponent<
    React.PropsWithChildren<Record<string, any>> &
      React.RefAttributes<HTMLElement>
  >;

  export default Slot;
}

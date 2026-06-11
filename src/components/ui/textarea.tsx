import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex bg-transparent disabled:opacity-50 shadow-sm px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full min-h-[60px] placeholder:text-muted-foreground md:text-sm text-base disabled:cursor-not-allowed",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-bold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline: "border-2 border-primary/20 bg-card text-primary hover:bg-primary-soft",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "text-primary hover:bg-primary-soft",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground shadow-soft hover:bg-success/90",
        warning: "bg-warning text-warning-foreground shadow-soft hover:bg-warning/90",
        soft: "bg-primary-soft text-primary hover:bg-accent",
      },
      size: {
        default: "min-h-12 px-5 py-3",
        sm: "min-h-10 rounded-lg px-4 text-sm",
        lg: "min-h-14 rounded-2xl px-7 text-lg",
        xl: "min-h-16 w-full rounded-2xl px-6 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

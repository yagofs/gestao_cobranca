  import { cn } from "@/lib/utils"

  function Skeleton({
    className,
    ...props
  }: Readonly<React.HTMLAttributes<HTMLDivElement>>) { // <--- Correção aplicada
    return (
      <div
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    )
  }

  export { Skeleton }
  import * as React from "react"
  import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

  import { cn } from "@/lib/utils"
  import { ButtonProps, buttonVariants } from "@/components/ui/button"

  const Pagination = ({
    className,
    ...props
  }: Readonly<React.ComponentProps<"nav">>) => (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
  Pagination.displayName = "Pagination"

  const PaginationContent = React.forwardRef<
    HTMLUListElement,
    React.ComponentProps<"ul">
  >(({ className, ...props }: Readonly<React.ComponentProps<"ul">>, ref) => (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  ))
  PaginationContent.displayName = "PaginationContent"

  const PaginationItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentProps<"li">
  >(({ className, ...props }: Readonly<React.ComponentProps<"li">>, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  ))
  PaginationItem.displayName = "PaginationItem"

  type PaginationLinkProps = {
    isActive?: boolean
  } & Pick<ButtonProps, "size"> &
    React.ComponentProps<"a">

  // CORREÇÃO APLICADA AQUI
  const PaginationLink = ({
    className,
    isActive,
    size = "icon",
    children, // 1. Adicionado `children` para receber o conteúdo do link
    ...props
  }: Readonly<PaginationLinkProps>) => ( // 2. Adicionado `Readonly` para boas práticas
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    >
      {children} {/* 3. Conteúdo do link é renderizado aqui */}
    </a>
  )
  PaginationLink.displayName = "PaginationLink"

  const PaginationPrevious = ({
    className,
    ...props
  }: Readonly<React.ComponentProps<typeof PaginationLink>>) => (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  )
  PaginationPrevious.displayName = "PaginationPrevious"

  const PaginationNext = ({
    className,
    ...props
  }: Readonly<React.ComponentProps<typeof PaginationLink>>) => (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  )
  PaginationNext.displayName = "PaginationNext"

  const PaginationEllipsis = ({
    className,
    ...props
  }: Readonly<React.ComponentProps<"span">>) => (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
  PaginationEllipsis.displayName = "PaginationEllipsis"

  export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  }

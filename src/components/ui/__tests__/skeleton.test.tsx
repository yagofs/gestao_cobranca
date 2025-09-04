import { render } from "@testing-library/react"
import { Skeleton } from "../skeleton"

describe("Skeleton", () => {
  it("renderiza skeleton", () => {
    const { container } = render(<Skeleton className="h-4 w-4" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

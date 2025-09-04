import { render } from "@testing-library/react"
import { Separator } from "../separator"

describe("Separator", () => {
  it("renderiza o separator", () => {
    const { container } = render(<Separator />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

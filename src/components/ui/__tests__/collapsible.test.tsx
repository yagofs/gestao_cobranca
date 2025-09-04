import { render, screen } from "@testing-library/react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../collapsible"

describe("Collapsible", () => {
  it("renderiza conteúdo colapsável", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Conteúdo oculto</CollapsibleContent>
      </Collapsible>
    )
    expect(screen.getByText("Toggle")).toBeInTheDocument()
  })
})

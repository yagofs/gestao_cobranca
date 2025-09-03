import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../dropdown-menu"

describe("DropdownMenu", () => {
  test("abre o menu ao clicar no trigger", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Abrir</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    // Clica no trigger usando userEvent (mais realista que fireEvent)
    await userEvent.click(screen.getByText("Abrir"))

    // Agora espera o Item 1 aparecer no portal
    const item = await screen.findByRole("menuitem", { name: /Item 1/i })
    expect(item).toBeInTheDocument()
  })
})

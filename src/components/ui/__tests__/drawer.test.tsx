import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../dropdown-menu";

describe("DropdownMenu", () => {
  it("abre o menu ao clicar no trigger", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Abrir</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText("Abrir"));
    expect(await screen.findByText("Item 1")).toBeInTheDocument();
  });
});

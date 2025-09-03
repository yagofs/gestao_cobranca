import { render, screen, fireEvent } from "@testing-library/react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "../context-menu";
import "@testing-library/jest-dom";

describe("ContextMenu", () => {
  it("abre o menu de contexto ao clicar com botão direito", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Opção 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    fireEvent.contextMenu(screen.getByText("Área"));

    expect(await screen.findByText("Opção 1")).toBeInTheDocument();
  });
});

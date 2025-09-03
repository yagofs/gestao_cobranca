import { render, screen } from "@testing-library/react";
import { ScrollArea } from "../scroll-area";
import "@testing-library/jest-dom";

describe("ScrollArea", () => {
  it("renderiza conteúdo com scroll", () => {
    render(<ScrollArea>Conteúdo rolável</ScrollArea>);
    expect(screen.getByText("Conteúdo rolável")).toBeInTheDocument();
  });
});

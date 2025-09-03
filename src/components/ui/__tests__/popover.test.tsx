import { render, screen, fireEvent } from "@testing-library/react";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import "@testing-library/jest-dom";

describe("Popover", () => {
  it("abre o popover ao clicar no trigger", async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Conteúdo</PopoverContent>
      </Popover>
    );

    fireEvent.click(screen.getByText("Open"));

    expect(await screen.findByText("Conteúdo")).toBeInTheDocument();
  });
});

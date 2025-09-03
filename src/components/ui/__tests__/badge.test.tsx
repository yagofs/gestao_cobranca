import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";
import "@testing-library/jest-dom";

describe("Badge", () => {
  it("renderiza com texto", () => {
    render(<Badge>Ativo</Badge>);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("aplica a classe default", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default").className).toMatch(/bg-primary/);
  });
});

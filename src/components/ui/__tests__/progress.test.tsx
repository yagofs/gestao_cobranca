import { render, screen } from "@testing-library/react";
import { Progress } from "../progress";
import "@testing-library/jest-dom";

describe("Progress", () => {
  it("renderiza a barra de progresso com valor", () => {
    render(<Progress value={50} />);
    const bar = screen.getByRole("progressbar");

    expect(bar).toBeInTheDocument();
    // garante que o estilo de width foi aplicado
    expect(bar.firstChild).toHaveStyle("transform: translateX(-50%)");
  });

  it("renderiza mesmo sem valor definido", () => {
    render(<Progress />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});

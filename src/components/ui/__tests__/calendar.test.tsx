import { render, screen } from "@testing-library/react";
import { Calendar } from "../calendar";
import "@testing-library/jest-dom";

describe("Calendar", () => {
  it("renderiza o calendário", () => {
    render(<Calendar />);
    expect(screen.getByRole("grid")).toBeInTheDocument(); // grid = tabela de dias
  });
});

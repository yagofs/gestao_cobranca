import { render, screen } from "@testing-library/react";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import "@testing-library/jest-dom";

describe("RadioGroup", () => {
  it("renderiza item de rádio", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="1" />
      </RadioGroup>
    );
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });
});

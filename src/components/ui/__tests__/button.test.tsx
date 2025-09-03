import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../button";
import "@testing-library/jest-dom";

describe("Button", () => {
  it("renderiza com o texto", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("dispara o evento onClick quando clicado", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza com a variante default por padrão", () => {
    render(<Button>Default</Button>);
    const button = screen.getByText("Default");
    expect(button).toHaveClass("bg-primary"); // classe do shadcn
  });

  it("renderiza com a variante secundária", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText("Secondary");
    expect(button).toHaveClass("bg-secondary");
  });

  it("renderiza com a variante outline", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText("Outline");
    expect(button).toHaveClass("border");
  });

  it("renderiza com tamanho pequeno", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText("Small");
    expect(button).toHaveClass("h-9 px-3");
  });

  it("renderiza com tamanho grande", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText("Large");
    expect(button).toHaveClass("h-11 px-8");
  });

  it("aplica classes extras corretamente", () => {
    render(<Button className="extra-class">Extra</Button>);
    const button = screen.getByText("Extra");
    expect(button).toHaveClass("extra-class");
  });

  it("fica desabilitado quando passado disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });
});

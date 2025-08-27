import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../button";
import '@testing-library/jest-dom';

describe("Button", () => {
  it("renderiza o texto corretamente", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("chama onClick quando clicado", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Clique" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("fica desabilitado quando passado disabled", () => {
    render(<Button disabled>Desabilitado</Button>);
    expect(screen.getByRole("button", { name: "Desabilitado" })).toBeDisabled();
  });

  it("aplica a classe do variant outline", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button", { name: "Outline" });
    expect(button.className).toMatch(/border-input/);
  });

  it("aplica a classe do size lg", () => {
    render(<Button size="lg">Grande</Button>);
    const button = screen.getByRole("button", { name: "Grande" });
    expect(button.className).toMatch(/h-11/);
  });

  it("não chama onClick quando desabilitado", () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Desabilitado</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Desabilitado" }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renderiza como um link quando passado 'asChild' e href", () => {
    render(
      <Button asChild>
        <a href="https://exemplo.com">Link</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toBeInTheDocument();
  });
});
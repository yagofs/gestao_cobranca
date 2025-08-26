import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";
import '@testing-library/jest-dom';

describe("Button", () => {
    it("renderiza o texto corretamente", () => {
        render(<Button>Enviar</Button>);
        expect(screen.getByText("Enviar")).toBeInTheDocument();
    });

    it("chama onClick quando clicado", () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Clique</Button>);
        fireEvent.click(screen.getByText("Clique"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("fica desabilitado quando passado disabled", () => {
        render(<Button disabled>Desabilitado</Button>);
        expect(screen.getByText("Desabilitado")).toBeDisabled();
    });

    it("aplica a classe do variant outline", () => {
        render(<Button variant="outline">Outline</Button>);
        const button = screen.getByText("Outline");
        expect(button.className).toMatch(/border-input/);
    });

    it("aplica a classe do size lg", () => {
        render(<Button size="lg">Grande</Button>);
        const button = screen.getByText("Grande");
        expect(button.className).toMatch(/h-11/);
    });
});
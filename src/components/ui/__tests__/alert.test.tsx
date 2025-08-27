import React from "react";
import { render, screen } from "@testing-library/react";
import { Alert } from "../alert";
import '@testing-library/jest-dom';

describe("Alert", () => {
  it("renderiza o conteúdo corretamente", () => {
    render(<Alert>Mensagem de alerta</Alert>);
    expect(screen.getByText("Mensagem de alerta")).toBeInTheDocument();
  });
});
import React from "react";
import { render, screen } from "@testing-library/react";
import { AspectRatio } from "../aspect-ratio";
import '@testing-library/jest-dom';

describe("AspectRatio", () => {
  it("renderiza o conteúdo corretamente", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <div>Conteúdo com proporção</div>
      </AspectRatio>
    );
    expect(screen.getByText("Conteúdo com proporção")).toBeInTheDocument();
  });
});
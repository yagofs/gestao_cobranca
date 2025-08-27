import React from "react";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import '@testing-library/jest-dom';

describe("Avatar", () => {
  it("renderiza a imagem do avatar", () => {
    render(
      <Avatar>
        <AvatarImage src="https://exemplo.com/avatar.png" alt="Avatar" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    const img = screen.getByAltText("Avatar");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://exemplo.com/avatar.png");
  });

  it("renderiza o fallback quando não há imagem", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});
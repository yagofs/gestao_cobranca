import { render, screen } from "@testing-library/react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../resizable";
import "@testing-library/jest-dom";

describe("Resizable", () => {
  it("renderiza painel redimensionável", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel>Panel</ResizablePanel>
        <ResizableHandle />
      </ResizablePanelGroup>
    );
    expect(screen.getByText("Panel")).toBeInTheDocument();
  });

  it("renderiza handle com ícone quando withHandle = true", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel>Panel</ResizablePanel>
        <ResizableHandle withHandle />
      </ResizablePanelGroup>
    );
    const handle = screen.getByRole("separator");
    expect(handle.querySelector("svg")).toBeInTheDocument();
  });
});

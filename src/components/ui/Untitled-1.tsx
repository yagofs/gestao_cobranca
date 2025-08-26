// Exemplo: src/components/ui/tabs.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import '@testing-library/jest-dom';

describe("Tabs", () => {
  it("renderiza o trigger corretamente", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Conteúdo Tab 1</TabsContent>
        <TabsContent value="tab2">Conteúdo Tab 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
  });

  it("mostra o conteúdo do tab selecionado", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Conteúdo Tab 1</TabsContent>
        <TabsContent value="tab2">Conteúdo Tab 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Conteúdo Tab 1")).toBeVisible();
    expect(screen.queryByText("Conteúdo Tab 2")).not.toBeInTheDocument();
  });

  it("altera o conteúdo ao clicar em outro tab", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Conteúdo Tab 1</TabsContent>
        <TabsContent value="tab2">Conteúdo Tab 2</TabsContent>
      </Tabs>
    );
    fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Conteúdo Tab 2")).toBeVisible();
    expect(screen.queryByText("Conteúdo Tab 1")).not.toBeInTheDocument();
  });
});
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../accordion";
import '@testing-library/jest-dom';

describe("Accordion", () => {
  it("renderiza o título corretamente", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Título do Accordion</AccordionTrigger>
          <AccordionContent>Conteúdo do Accordion</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText("Título do Accordion")).toBeInTheDocument();
  });

  it("não mostra o conteúdo inicialmente", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion</AccordionTrigger>
          <AccordionContent>Conteúdo Escondido</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText("Conteúdo Escondido")).not.toBeInTheDocument();
  });

  it("mostra o conteúdo ao clicar no título", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion</AccordionTrigger>
          <AccordionContent>Conteúdo Visível</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    fireEvent.click(screen.getByText("Accordion"));
    expect(screen.getByText("Conteúdo Visível")).toBeVisible();
  });

  it("fecha o conteúdo ao clicar novamente", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion</AccordionTrigger>
          <AccordionContent>Conteúdo Toggle</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByText("Accordion");
    fireEvent.click(trigger); // abre
    fireEvent.click(trigger); // fecha
    expect(screen.queryByText("Conteúdo Toggle")).not.toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../dialog";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom';

describe("Dialog Component", () => {
  it("deve abrir o Dialog ao clicar no trigger", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do Dialog</DialogTitle>
          </DialogHeader>
          <DialogDescription>Descrição do Dialog</DialogDescription>
          <DialogFooter>
            <DialogClose>Fechar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Open Dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Open Dialog"));

    expect(screen.getByText("Título do Dialog")).toBeInTheDocument();
    expect(screen.getByText("Descrição do Dialog")).toBeInTheDocument();
    expect(screen.getByText("Fechar")).toBeInTheDocument();
  });

  it("deve fechar o Dialog ao clicar em Fechar", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do Dialog</DialogTitle>
          </DialogHeader>
          <DialogDescription>Descrição do Dialog</DialogDescription>
          <DialogFooter>
            <DialogClose>Fechar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByText("Open Dialog"));
    await userEvent.click(screen.getByText("Fechar"));

    expect(screen.queryByText("Título do Dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Descrição do Dialog")).not.toBeInTheDocument();
  });
});
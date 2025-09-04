import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../sheet'; // Adapte os imports

describe("Sheet", () => {
  it("renderiza conteúdo do Sheet após ser aberto", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Título do Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    // 1. Encontre e clique no botão para abrir o Sheet
    const openButton = screen.getByRole('button', { name: /abrir/i });
    await user.click(openButton);

    // 2. Agora, procure pelo título
    expect(await screen.findByText("Título do Sheet")).toBeInTheDocument();
  });
});
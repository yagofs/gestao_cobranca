import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../hover-card";

describe("HoverCard", () => {
  it("mostra o conteúdo ao passar o mouse no trigger", async () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent>Conteúdo</HoverCardContent>
      </HoverCard>
    );

    await userEvent.hover(screen.getByText("Trigger"));
    expect(await screen.findByText("Conteúdo")).toBeInTheDocument();
  });
});

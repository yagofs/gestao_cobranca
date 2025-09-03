import { render, screen } from "@testing-library/react";
import { Pagination, PaginationItem, PaginationLink } from "../pagination";
import "@testing-library/jest-dom";

describe("Pagination", () => {
  it("renderiza link de página", () => {
    render(
      <Pagination>
        <PaginationItem>
          <PaginationLink href="/page/1">1</PaginationLink>
        </PaginationItem>
      </Pagination>
    );
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/page/1");
  });
});

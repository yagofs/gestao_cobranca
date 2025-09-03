import { render, screen } from "@testing-library/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "../breadcrumb";
import "@testing-library/jest-dom";

describe("Breadcrumb", () => {
  it("renderiza links corretamente", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/about">About</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });
});

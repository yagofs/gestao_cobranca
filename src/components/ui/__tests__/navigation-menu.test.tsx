import { render, screen } from "@testing-library/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../navigation-menu";
import "@testing-library/jest-dom";

describe("NavigationMenu", () => {
  it("renderiza link corretamente", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/test">Test</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByRole("link", { name: "Test" })).toHaveAttribute("href", "/test");
  });
});

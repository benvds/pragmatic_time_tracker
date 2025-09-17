import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { App } from "./App";

describe("<App />", () => {
    it("should render the App", () => {
        render(<App />);

        expect(screen.getByText(/Description/i)).toBeInTheDocument();

        // expect(
        //   screen.getByRole('link', {
        //     name: /start building for free/i
        //   })
        // ).toBeInTheDocument()
        //
        // expect(screen.getByRole('img')).toBeInTheDocument()
        //
        // expect(container.firstChild).toBeInTheDocument()
    });
});

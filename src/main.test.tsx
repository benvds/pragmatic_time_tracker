import { describe, it, expect, vi, beforeEach } from "vitest";

describe("main.tsx", () => {
    let mockCreateRoot: ReturnType<typeof vi.fn>;
    let mockRender: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockRender = vi.fn();
        mockCreateRoot = vi.fn(() => ({ render: mockRender }));

        vi.doMock("react-dom/client", () => ({
            createRoot: mockCreateRoot,
        }));

        vi.doMock("./App", () => ({
            App: () => null,
        }));

        Object.defineProperty(document, "getElementById", {
            value: vi.fn(() => document.createElement("div")),
            writable: true,
        });
    });

    it("should render App component in StrictMode", async () => {
        await import("./main");

        expect(document.getElementById).toHaveBeenCalledWith("root");
        expect(mockCreateRoot).toHaveBeenCalledWith(expect.any(HTMLElement));
        expect(mockRender).toHaveBeenCalledTimes(1);
    });
});

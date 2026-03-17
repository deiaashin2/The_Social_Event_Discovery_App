import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Gatekeeper from "../components/Gatekeeper";

describe("Gatekeeper Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirects to /login when user is unauthenticated", async () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Gatekeeper>
                <div data-testid="protected-content">Protected Content</div>
              </Gatekeeper>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should not show protected content
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    // Should be redirected to login
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
  });

  it("renders children when user is authenticated", async () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Gatekeeper>
                <div data-testid="protected-content">Protected Content</div>
              </Gatekeeper>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should show protected content
    expect(await screen.findByTestId("protected-content")).toBeInTheDocument();
    // Should not show login page
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});

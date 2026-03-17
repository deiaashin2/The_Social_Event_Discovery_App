import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AuthForm from "../components/AuthForm";

// Mock global fetch
global.fetch = vi.fn();

describe("AuthForm Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("updates input fields correctly when typed into", () => {
    render(
      <MemoryRouter>
        <AuthForm mode="login" />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("displays error message on failed login (401)", async () => {
    // Mock failed fetch response
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Invalid Credentials" }),
    });

    render(
      <MemoryRouter>
        <AuthForm mode="login" />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    // Wait for error message to appear
    const errorMessage = await screen.findByText(/invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("updates Full Name field in signup mode", () => {
    render(
      <MemoryRouter>
        <AuthForm mode="signup" />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText("John Doe") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    expect(nameInput.value).toBe("Jane Doe");
  });
});

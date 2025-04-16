// vi.mock must be at the top
import {vi, Mock} from "vitest";
vi.mock("@context/auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));
import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {useAuth} from "@context/auth/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import '@testing-library/jest-dom'; // Import for toBeInTheDocument


describe("ProtectedRoute with isRestoring logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithAuthContext = (initialRoute = "/dashboard") => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div data-testid="dashboard-content">Dashboard Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };


    it("renders loading placeholder while isRestoring is true", () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            isRestoring: true,
            user: null,
        });
        renderWithAuthContext();
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("renders children after restoration if authenticated", async () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            isRestoring: false,
            user: {id: "1", username: "student"},
        });
        renderWithAuthContext();
        expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("redirects to login after restoration if not authenticated", async () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            isRestoring: false,
            user: null,
        });
        renderWithAuthContext();
        await waitFor(() => expect(screen.getByText("Login Page")).toBeInTheDocument());
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    });

    it("does not redirect or render children if restoration never completes", () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            isRestoring: true,
            user: null,
        });
        renderWithAuthContext();
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("renders loading placeholder, then children after restoration completes (async)", async () => {
        // Use the same mocking approach as other tests
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            isRestoring: true,
            user: null,
        });

        const {rerender} = renderWithAuthContext();
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();

        // Update the mock for the second render
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            isRestoring: false,
            user: {id: "1", username: "student"},
        });

        // Rerender with the same component structure as before
        rerender(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div data-testid="dashboard-content">Dashboard Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByTestId("dashboard-content")).toBeInTheDocument());
    });
});


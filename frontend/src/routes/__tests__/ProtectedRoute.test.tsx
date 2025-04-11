// vi.mock must be at the top
import {vi} from "vitest";
vi.mock("@context/auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {AuthUser, AuthContextProps} from "../../context/auth/types";
import {useAuth} from "@context/auth/AuthContext";
import ProtectedRoute from "../ProtectedRoute";

describe("ProtectedRoute with isRestoring logic", () => {
    function renderWithAuthContext(initialRoute = "/dashboard") {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Dashboard Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    }

    it("renders loading placeholder while isRestoring is true", () => {
        (useAuth as jest.Mock).mockReturnValue({
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
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            isRestoring: false,
            user: {id: "1", username: "student"},
        });
        renderWithAuthContext();
        expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("redirects to login after restoration if not authenticated", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            isRestoring: false,
            user: null,
        });
        renderWithAuthContext();
        await waitFor(() => {
            expect(screen.getByText("Login Page")).toBeInTheDocument();
        });
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    });

    it("does not redirect or render children if restoration never completes", async () => {
        (useAuth as jest.Mock).mockReturnValue({
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
        const mockUseAuth = useAuth as jest.Mock;
        // Initial: restoring
        mockUseAuth.mockReturnValueOnce({
            isAuthenticated: false,
            isRestoring: true,
            user: null,
        });
        const {rerender} = renderWithAuthContext();
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();

        // Restoration completes, user is authenticated
        mockUseAuth.mockReturnValueOnce({
            isAuthenticated: true,
            isRestoring: false,
            user: {id: "1", username: "student"},
        });
        rerender(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Dashboard Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
        });
    });
});

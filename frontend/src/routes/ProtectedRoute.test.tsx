import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom'; // Import for toBeInTheDocument
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {vi, Mock} from "vitest";
vi.mock("@context/auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));
import {describe, it, expect} from 'vitest';

import {useAuth} from "@context/auth/AuthContext";
import {ErrorProvider} from "@/components/ErrorNotifier/ErrorProvider";

import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute with isRestoring logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithAuthContext = (initialRoute = "/dashboard") => {
        return render(
            <ErrorProvider>
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
            </ErrorProvider>
        );
    };


    it("renders loading placeholder while isRestoring is true", () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            isRestoring: true,
            user: null,
            getUserRole: vi.fn().mockReturnValue('user')
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
            getUserRole: vi.fn().mockReturnValue('user')
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
            getUserRole: vi.fn().mockReturnValue(null)
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
            getUserRole: vi.fn().mockReturnValue(null)
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
            getUserRole: vi.fn().mockReturnValue(null)
        });

        const {rerender} = renderWithAuthContext();
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();

        // Update the mock for the second render
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            isRestoring: false,
            user: {id: "1", username: "student"},
            getUserRole: vi.fn().mockReturnValue('user')
        });

        // Rerender with the same component structure as before
        rerender(
            <ErrorProvider>
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
            </ErrorProvider>
        );

        await waitFor(() => expect(screen.getByTestId("dashboard-content")).toBeInTheDocument());
    });
});


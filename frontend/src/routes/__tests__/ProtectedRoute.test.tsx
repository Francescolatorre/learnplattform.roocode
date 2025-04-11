import React, {createContext} from "react";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {AuthUser, AuthContextProps} from "../../context/auth/types";

// Redefine a local AuthContext for testing
const MockAuthContext = createContext<AuthContextProps>({
    user: null,
    isAuthenticated: false,
    isRestoring: false,
    login: async () => { },
    logout: async () => { },
    getUserRole: () => "guest",
    redirectToDashboard: () => { },
    setError: () => { },
});
import ProtectedRoute from "../ProtectedRoute";

describe("ProtectedRoute with isRestoring logic", () => {
    function renderWithAuthContext(contextValue: AuthContextProps, initialRoute = "/dashboard") {
        return render(
            <MockAuthContext.Provider value={contextValue as AuthContextProps}>
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
            </MockAuthContext.Provider>
        );
    }

    it("renders loading placeholder while isRestoring is true", () => {
        renderWithAuthContext({
            isAuthenticated: false,
            isRestoring: true,
            user: null,
            login: async () => { },
            logout: async () => { },
            getUserRole: () => "guest",
            redirectToDashboard: () => { },
            setError: () => { },
        });
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("renders children after restoration if authenticated", async () => {
        renderWithAuthContext({
            isAuthenticated: true,
            isRestoring: false,
            user: {id: "1", username: "student"} as AuthUser,
            login: async () => { },
            logout: async () => { },
            getUserRole: () => "guest",
            redirectToDashboard: () => { },
            setError: () => { },
        });
        expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("redirects to login after restoration if not authenticated", async () => {
        renderWithAuthContext({
            isAuthenticated: false,
            isRestoring: false,
            user: null,
            login: async () => { },
            logout: async () => { },
            getUserRole: () => "guest",
            redirectToDashboard: () => { },
            setError: () => { },
        });
        await waitFor(() => {
            expect(screen.getByText("Login Page")).toBeInTheDocument();
        });
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    });

    it("does not redirect or render children if restoration never completes", async () => {
        renderWithAuthContext({
            isAuthenticated: false,
            isRestoring: true,
            user: null,
        });
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    it("renders loading placeholder, then children after restoration completes (async)", async () => {
        // Simulate restoration transition
        let contextValue: AuthContextProps = {
            isAuthenticated: false,
            isRestoring: true,
            user: null,
            login: async () => { },
            logout: async () => { },
            getUserRole: () => "guest",
            redirectToDashboard: () => { },
            setError: () => { },
        };
        const {rerender} = render(
            <MockAuthContext.Provider value={contextValue as AuthContextProps}>
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
            </MockAuthContext.Provider>
        );
        expect(screen.getByTestId("protected-route-loading")).toBeInTheDocument();

        // Restoration completes, user is authenticated
        contextValue = {
            isAuthenticated: true,
            isRestoring: false,
            user: {id: "1", username: "student"} as AuthUser,
            login: async () => { },
            logout: async () => { },
            getUserRole: () => "guest",
            redirectToDashboard: () => { },
            setError: () => { },
        };
        rerender(
            <MockAuthContext.Provider value={contextValue as AuthContextProps}>
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
            </MockAuthContext.Provider>
        );
        await waitFor(() => {
            expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
        });
    });
});

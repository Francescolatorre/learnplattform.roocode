export const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
    });

    if (!response.ok) {
        throw new Error('Failed to login');
    }
};

export const logout = async (): Promise<void> => {
    const response = await fetch('/api/auth/logout/', {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to logout');
    }
};

export const resetPassword = async (email: string): Promise<void> => {
    const response = await fetch('/api/auth/reset-password/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
    });

    if (!response.ok) {
        throw new Error('Failed to reset password');
    }
};

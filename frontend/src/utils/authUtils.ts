export const getUserRole = (): string => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user).role || 'guest'; // Fallback to 'guest' if role is not defined
    } catch {
      console.error('Failed to parse user data from localStorage');
    }
  }
  return 'guest'; // Default role
};

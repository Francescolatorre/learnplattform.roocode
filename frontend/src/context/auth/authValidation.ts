export const isValidUsername = (username: string): boolean => {
  if (username.length < 3 || username.length > 150) {
    return false;
  }
  const pattern = new RegExp('^[a-zA-Z0-9_]+$');
  return pattern.test(username);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

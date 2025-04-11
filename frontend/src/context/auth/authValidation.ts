export const isValidUsername = (username: string): boolean => {
  if (username.length < 3 || username.length > 150) {
    return false;
  }
  const pattern = new RegExp('^[a-zA-Z0-9_]+$');
  return pattern.test(username);
};

export const isValidEmail = (email: string): boolean => {
  const pattern = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
  return pattern.test(email);
};

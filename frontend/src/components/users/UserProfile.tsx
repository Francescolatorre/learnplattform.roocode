import React from 'react';

interface IUserProfileProps {
  user: {
    display_name: string;
    username: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}

const UserProfile: React.FC<IUserProfileProps> = ({user}) => {
  return (
    <div>
      <h1>{user.display_name || user.username}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
};

export default UserProfile;

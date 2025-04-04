import React, { useEffect, useState } from 'react';

const LoginLogs: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const storedLogs = localStorage.getItem('loginLogs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
      localStorage.removeItem('loginLogs');
    }
  }, []);

  return (
    <div>
      <h2>Login Logs:</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default LoginLogs;

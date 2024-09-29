import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

function SessionManagement() {
  const { activeSessions, logoutDevice } = useAuth();
  const currentDeviceId = localStorage.getItem('deviceId');

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>
      <ul>
        {activeSessions.map(session => (
          <li key={session.deviceId} className="mb-2 p-2 border rounded">
            Device ID: {session.deviceId}
            {session.deviceId === currentDeviceId ? ' (This device)' : ''}
            <button 
              onClick={() => logoutDevice(session.deviceId)}
              className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionManagement;
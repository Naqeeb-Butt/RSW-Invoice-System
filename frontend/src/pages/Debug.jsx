import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import logger from '../utils/logger';

export default function Debug() {
  const [healthData, setHealthData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/debug/health');
      setHealthData(response.data);
      logger.info('Health check successful', response.data);
    } catch (error) {
      logger.error('Health check failed', error);
      setHealthData({ error: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUsers = useCallback(async () => {
    try {
      const response = await axios.get('/api/v1/debug/users');
      setUsersData(response.data);
      logger.info('Users check successful', { userCount: response.data.user_count });
    } catch (error) {
      logger.error('Users check failed', error);
      setUsersData({ error: error.message });
    }
  }, []);

  const loadLogs = useCallback(() => {
    // Get recent logs from localStorage
    const recentLogs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('log_')) {
        try {
          const log = JSON.parse(localStorage.getItem(key));
          recentLogs.push(log);
        } catch (e) {
          // Ignore invalid logs
        }
      }
    }
    setLogs(recentLogs.slice(-20)); // Last 20 logs
  }, []);

  const clearLogs = useCallback(() => {
    // Clear log entries from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('log_')) {
        localStorage.removeItem(key);
      }
    }
    setLogs([]);
  }, []);

  const testLogin = useCallback(async () => {
    try {
      logger.info('Testing login with debug credentials');
      const formData = new FormData();
      formData.append('username', 'admin@aasko.com');
      formData.append('password', 'admin123');
      
      const response = await axios.post('/api/v1/auth/login', formData);
      logger.info('Test login successful', response.data);
      alert('Test login successful! Check console for details.');
    } catch (error) {
      logger.error('Test login failed', error);
      alert(`Test login failed: ${error.response?.data?.detail || error.message}`);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    checkUsers();
    loadLogs();
  }, [checkHealth, checkUsers, loadLogs]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Debug Dashboard</h1>
        <p className="text-gray-600">Monitor application health and debug issues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
          {healthData ? (
            <div className="space-y-3">
              <div className={`p-3 rounded ${healthData.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Status:</strong> {healthData.status}
              </div>
              {healthData.database && (
                <div className="p-3 bg-gray-100 rounded">
                  <p><strong>Database:</strong> {healthData.database.status}</p>
                  <p><strong>Users:</strong> {healthData.database.user_count}</p>
                  <p><strong>Admin User:</strong> {healthData.database.admin_user_exists ? 'Exists' : 'Missing'}</p>
                </div>
              )}
              {healthData.environment && (
                <div className="p-3 bg-gray-100 rounded">
                  <p><strong>API Version:</strong> {healthData.environment.api_version}</p>
                  <p><strong>Token Expires:</strong> {healthData.environment.token_expire_minutes} minutes</p>
                </div>
              )}
              {healthData.error && (
                <div className="p-3 bg-red-100 text-red-800 rounded">
                  <strong>Error:</strong> {healthData.error}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading health data...</div>
          )}
          <button
            onClick={checkHealth}
            className="mt-4 btn btn-secondary"
            disabled={loading}
          >
            Refresh Health
          </button>
        </div>

        {/* Users */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Users</h2>
          {usersData ? (
            <div className="space-y-3">
              {usersData.error ? (
                <div className="p-3 bg-red-100 text-red-800 rounded">
                  <strong>Error:</strong> {usersData.error}
                </div>
              ) : (
                <>
                  <div className="p-3 bg-gray-100 rounded">
                    <p><strong>Total Users:</strong> {usersData.user_count}</p>
                  </div>
                  {usersData.users && usersData.users.length > 0 && (
                    <div className="space-y-2">
                      {usersData.users.map(user => (
                        <div key={user.id} className="p-2 bg-gray-50 rounded text-sm">
                          <p><strong>{user.name}</strong> ({user.email})</p>
                          <p>Active: {user.is_active ? 'Yes' : 'No'}</p>
                          <p>Created: {new Date(user.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading users data...</div>
          )}
          <button
            onClick={checkUsers}
            className="mt-4 btn btn-secondary"
            disabled={loading}
          >
            Refresh Users
          </button>
        </div>

        {/* Debug Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Actions</h2>
          <div className="space-y-3">
            <button
              onClick={testLogin}
              className="w-full btn btn-primary"
              disabled={loading}
            >
              Test Login with Admin Credentials
            </button>
            <button
              onClick={loadLogs}
              className="w-full btn btn-secondary"
            >
              Refresh Logs
            </button>
            <button
              onClick={clearLogs}
              className="w-full btn btn-secondary"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs found</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                  <div className="flex justify-between">
                    <span className={`font-semibold ${
                      log.level === 'ERROR' ? 'text-red-600' : 
                      log.level === 'WARN' ? 'text-yellow-600' : 
                      log.level === 'INFO' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{log.message}</p>
                  {log.data && (
                    <pre className="text-xs text-gray-600 mt-1">{JSON.stringify(log.data, null, 2)}</pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

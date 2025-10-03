import React from 'react';
import AdminPanel from '../../components/AdminPanel.jsx';

export default function Settings() {
  return (
    <div>
      <h3>Settings / Admin</h3>
      <ul>
        <li>Branch Management</li>
        <li>User & Role Management</li>
      </ul>
      
      <hr style={{ margin: '20px 0' }} />
      
      <AdminPanel />
    </div>
  );
}

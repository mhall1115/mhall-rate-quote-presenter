import React, { useState } from 'react';
import { User } from '../../hooks/useUsers';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface AdminDashboardProps {
  loanOfficers: User[];
  onAddUser: (user: User) => { success: boolean; message?: string };
  onDeleteUser: (email: string) => void;
}

const LoanOfficerRow: React.FC<{ user: User; onDelete: (email: string) => void }> = ({ user, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-md">
      <span className="text-sm font-medium text-gray-200">{user.email}</span>
      <Button
        variant="danger"
        onClick={() => {
          if (window.confirm(`Are you sure you want to delete the user ${user.email}? This will also delete all their quotes.`)) {
            onDelete(user.email);
          }
        }}
        className="px-2 py-1 text-xs"
      >
        Delete
      </Button>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ loanOfficers, onAddUser, onDeleteUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    const result = onAddUser({ email, password, role: 'lo' });

    if (result.success) {
      setSuccess(`Loan Officer ${email} has been created.`);
      setEmail('');
      setPassword('');
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-float-in">
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Add New Loan Officer</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            id="new-lo-email"
            name="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="new-lo-password"
            name="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <div className="pt-2">
            <Button type="submit">Create Loan Officer</Button>
          </div>
        </form>
      </Card>
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Manage Loan Officers</h3>
        {loanOfficers.length > 0 ? (
          <div className="space-y-2">
            {loanOfficers.map((lo) => (
              <LoanOfficerRow key={lo.email} user={lo} onDelete={onDeleteUser} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No loan officers have been added yet.</p>
        )}
      </Card>
    </div>
  );
};

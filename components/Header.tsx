
import React from 'react';
import { Button } from './common/Button';
import { User } from '../hooks/useUsers';

interface HeaderProps {
  title: string;
  user: User;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, user, onSignOut }) => {
  return (
    <header className="bg-transparent sticky top-0 z-10 bg-slate-950/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-100 tracking-wider">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm font-medium text-gray-300 hidden sm:block" aria-label={`Logged in as ${user.email}`}>{user.email}</span>
            <Button variant="secondary" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;



import { useState, useEffect, useCallback } from 'react';

export interface User {
  email: string;
  // In a real app, never store passwords in plaintext. This is for simulation only.
  password?: string;
  role: 'admin' | 'lo' | 'borrower';
}

const USERS_STORAGE_KEY = 'mortgageAppUsers';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Seed initial users if none exist
        try {
            const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (!storedUsers) {
                const initialUsers: User[] = [
                  { email: 'admin@mortgage.app', password: 'password', role: 'admin' },
                  { email: 'lo@mortgage.app', password: 'password', role: 'lo' },
                  { email: 'borrower@mortgage.app', password: 'password', role: 'borrower' }
                ];
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
                setUsers(initialUsers);
            } else {
                setUsers(JSON.parse(storedUsers));
            }
        } catch (error) {
            console.error("Failed to initialize users in localStorage", error);
            // If storage is corrupt, start fresh
            const initialUsers: User[] = [
              { email: 'admin@mortgage.app', password: 'password', role: 'admin' },
              { email: 'lo@mortgage.app', password: 'password', role: 'lo' },
              { email: 'borrower@mortgage.app', password: 'password', role: 'borrower' }
            ];
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
            setUsers(initialUsers);
        }
    }, []);

    const findUser = useCallback((email: string): User | undefined => {
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }, [users]);
    
    // In a real app, this would involve hashing and comparing.
    const validatePassword = useCallback((user: User, password: string): boolean => {
        return user.password === password;
    }, []);

    const addUser = useCallback((newUser: User): { success: boolean, message?: string } => {
        if (findUser(newUser.email)) {
            return { success: false, message: 'A user with this email already exists.' };
        }
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
        return { success: true };
    }, [users, findUser]);

    const deleteUser = useCallback((email: string) => {
        const updatedUsers = users.filter(u => u.email !== email);
        setUsers(updatedUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
        // Also remove their quotes
        localStorage.removeItem(`mortgageQuotes_${email}`);
    }, [users]);


    return { users, addUser, deleteUser, findUser, validatePassword };
}
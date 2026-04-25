// Initialize demo users on first load
export function initializeDemoUsers() {
  if (typeof window === 'undefined') return;

  const existingUsers = localStorage.getItem('users');
  if (existingUsers) return; // Already initialized

  const demoUsers = [
    {
      id: '1',
      email: 'client@example.com',
      password: 'password123',
      name: 'John Customer',
      role: 'client',
    },
    {
      id: '2',
      email: 'employee@example.com',
      password: 'password123',
      name: 'Maria Chef',
      role: 'employee',
    },
  ];

  localStorage.setItem('users', JSON.stringify(demoUsers));
}

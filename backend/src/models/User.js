// In-memory user store for demo purposes
// In production, you would use a proper database like DynamoDB, MongoDB, or PostgreSQL

export const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '$2b$10$ykhGmg56iw/qGGb/Zysa2e7M47p2W9lQ.cBrku9ZBquBB5XKCcBZq', // password: admin123
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@example.com',
    password: '$2b$10$ofbNQd.RI1p6ra.DiIr3.ejsocRLYorAUxFycQKc53YgYr2WQrVOe', // password: user123
    name: 'Regular User',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

export const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

export const createUser = (userData) => {
  const newUser = {
    id: (users.length + 1).toString(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  return newUser;
};
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: 'admin' | 'devops' | 'developer';
}

const USERS: User[] = [
  {
    id: 1,
    firstName: "Jan",
    lastName: "Kowalski",
    role: "admin"
  },
  {
    id: 2,
    firstName: "Anna",
    lastName: "Nowak",
    role: "developer"
  },
  {
    id: 3,
    firstName: "Piotr",
    lastName: "Zieliński",
    role: "devops"
  }
];

export const getCurrentUser = (): User => {
  return getAllUsers()[0];
};

export const getAllUsers = (): User[] => {
  return USERS;
};

export const getUserById = (id: number): User | undefined => {
  return USERS.find(u => u.id === id);
};
export interface User {
  id: number;
  firstName: string;
  lastName: string;
}

export const getCurrentUser = (): User => {
  return {
    id: 1,
    firstName: "Jan",
    lastName: "Kowalski"
  };
};
import type { Seller } from "../types";

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const generateSellerCode = (sellers: Seller[]): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const existingCodes = new Set(sellers.map((s) => s.code));
  let code: string;
  do {
    code = "";
    for (let i = 0; i < 6; i++)
      code += chars[Math.floor(Math.random() * chars.length)];
  } while (existingCodes.has(code));
  return code;
};

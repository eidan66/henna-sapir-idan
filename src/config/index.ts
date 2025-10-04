// Fix for development - avoid localhost loop
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE && !process.env.NEXT_PUBLIC_API_BASE.includes('localhost') 
  ? `${process.env.NEXT_PUBLIC_API_BASE}/api` 
  : '/api';
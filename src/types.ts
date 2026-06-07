export type ExpenseType = 'mason' | 'sunyoung' | 'shared';

export type Category = 
  | '식비' 
  | '카페/간식' 
  | '배달' 
  | '장보기' 
  | '쿠팡' 
  | '교통/주유' 
  | '생활비' 
  | '데이트' 
  | '강아지' 
  | '보험/고정비' 
  | '쇼핑' 
  | '병원/약' 
  | '기타';

export type PaymentMethod = '카드' | '현금' | '계좌이체' | '기타';

export interface Expense {
  id: string;
  type: ExpenseType;
  date: string; // YYYY-MM-DD
  amount: number;
  category: Category;
  place: string;
  paymentMethod: PaymentMethod;
  memo: string;
  createdAt: number;
}

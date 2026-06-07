import { 
  Coffee, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Home, 
  Heart, 
  Dog, 
  ShieldAlert, 
  Pill, 
  MoreHorizontal,
  ShoppingCart,
  Package
} from 'lucide-react';
import { Category } from '../types';

export const CategoryIcons: Record<Category, React.FC<any>> = {
  '식비': Utensils,
  '카페/간식': Coffee,
  '배달': Package,
  '장보기': ShoppingCart,
  '쿠팡': Package,
  '교통/주유': Car,
  '생활비': Home,
  '데이트': Heart,
  '강아지': Dog,
  '보험/고정비': ShieldAlert,
  '쇼핑': ShoppingBag,
  '병원/약': Pill,
  '기타': MoreHorizontal,
};

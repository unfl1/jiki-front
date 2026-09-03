import { apiRequest } from './client';

type MoneyResponse = {
  money: number;
};

export function getMyMoney(): Promise<MoneyResponse> {
  return apiRequest<MoneyResponse>('/user/money');
}

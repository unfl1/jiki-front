import { apiRequest } from './client';

export type PromiseSummary = {
  title: string;
  date: string;
  time: string;
  promiseId: number;
  creatorUsername: string;
};

export function getPromises(): Promise<PromiseSummary[]> {
  return apiRequest<PromiseSummary[]>('/promise');
}

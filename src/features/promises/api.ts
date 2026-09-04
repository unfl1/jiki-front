import { apiRequest } from '@/lib/api/client';

import { PromiseCreatePayload, PromiseDetail, PromiseSummary } from './types';

export function getPromises(): Promise<PromiseSummary[]> { return apiRequest<PromiseSummary[]>('/promise'); }

export function createPromise(payload: PromiseCreatePayload): Promise<PromiseDetail> {
  return apiRequest<PromiseDetail>('/promise', { method: 'POST', body: payload });
}

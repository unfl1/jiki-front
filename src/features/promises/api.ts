import { apiRequest } from '@/lib/api/client';

import { PromiseSummary } from './types';

export function getPromises(): Promise<PromiseSummary[]> { return apiRequest<PromiseSummary[]>('/promise'); }

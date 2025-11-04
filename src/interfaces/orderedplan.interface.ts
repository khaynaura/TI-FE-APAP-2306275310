import type { ClaimSummaryResponse } from '@/interfaces/claim.interface';

export interface OrderedPlanDetailResponse {
  id: string;
  insurancePlanId: string;
  status: string;
  expiredDate: string;
  createdAt: string;
  updatedAt: string;   
  claims: ClaimSummaryResponse[];
}

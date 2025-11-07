import type { ServiceEnum } from '@/stores/enums.stores.ts';

export interface CreatePolicyRequest {
  userId: string;
  bookingId: string;
  service: ServiceEnum;
  insurancePlanIds: string[];
}

export interface OrderedPlanSummary {
  id: string;
  insurancePlanId: string;
  status: string;
  expiredDate: string;
  claimsCount: number;
}

export interface Policy {
  id: string;
  bookingId: string;
  userId: string;
  service: ServiceEnum;
  startDate: string;
  status: string;
  totalPrice: number;
  totalCoverage: number;
  createdAt: string; 
  updatedAt: string;
  orderedPlans: OrderedPlanSummary[];
}

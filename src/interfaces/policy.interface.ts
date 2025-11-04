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
  expiredDate: string; // LocalDate dari backend -> string ISO di FE
  claimsCount: number;
}

export interface Policy {
  id: string;
  bookingId: string;
  userId: string;
  service: ServiceEnum;
  startDate: string; // LocalDate -> string
  status: string;
  totalPrice: number; // Integer -> number
  totalCoverage: number; // Integer -> number
  createdAt: string; // LocalDateTime -> string
  updatedAt: string; // LocalDateTime -> string
  orderedPlans: OrderedPlanSummary[];
}

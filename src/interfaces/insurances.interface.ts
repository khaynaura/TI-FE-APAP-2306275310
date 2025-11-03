import type { ServiceEnum } from '@/stores/enums.stores.ts'; // <-- Diambil dari store yang baru dibuat

// --- Insurance Plan (Response) ---k
export interface InsurancePlan {
    id: string;
    providerId: string;
    planName: string;
    price: number;
    coverage: number;
    coverageDetails: string;
    applicableService: ServiceEnum[];
    expiredByDays: number;
    createdAt: string;
    updatedAt: string;
}

// --- Insurance Plan (Request untuk Create & Update) ---
// Note: ID opsional untuk update, tapi kita menggunakan pola update yang menyertakan ID di body.
export interface InsurancePlanRequest {
    id?: string; // Opsional untuk Create, wajib untuk Update (jika mengikuti DTO backend)
    providerId: string;
    planName: string;
    price: number;
    coverage: number;
    coverageDetails: string;
    applicableService: ServiceEnum[];
    expiredByDays: number;
}

// --- Policy (Response) ---
export interface Policy {
    id: string;
    bookingId: string;
    userId: string;
    startDate: Date;
    status: string;
    service: ServiceEnum;
    totalCoverage: number;
    totalPrice: number;
    orderedPlans: OrderedPlanSummary[];
    createdAt: string;
    updatedAt: string;
}

// --- Ordered Plan Summary (untuk ditampilkan di Policy Detail) ---
export interface OrderedPlanSummary {
    id: string;
    insurancePlanId: string;
    status: string;
    expiredDate: string;
    claimsCount: number;
}

// --- Home Summary (Statistik) ---
export interface HomeSummary {
    totalInsurancePlans: number;
    totalPolicies: number;
    totalClaimsProcessed: number;
}

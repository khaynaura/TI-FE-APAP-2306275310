import type { ServiceEnum } from '@/stores/enums.stores.ts'; // <-- Diambil dari store yang baru dibuat

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

export interface InsurancePlanRequest {
    id?: string;
    providerId: string;
    planName: string;
    price: number;
    coverage: number;
    coverageDetails: string;
    applicableService: ServiceEnum[];
    expiredByDays: number;
}


// --- Home Summary (Statistik) ---
export interface HomeSummary {
    totalInsurancePlans: number;
    totalPolicies: number;
    totalClaimsProcessed: number;
}

export interface ClaimSummaryResponse {
  id: string;
  orderedPlanId: string;
  planName: string;
  status: string;
  daysSinceClaimed: number;
}

export interface ClaimDetailResponse {
  id: string;
  status: string;
  proof: string;
  rejectionReason: string | null;
  rejectionDescription: string | null;
  rejectionTimestamp: string | null; // LocalDateTime ISO string
  acceptedNote: string | null;
  acceptedTimestamp: string | null;  // LocalDateTime ISO string
}

export interface CreateClaimRequest {
  proof: string;
}

export interface ProcessClaimRequest {
  isAccepted: boolean;
  acceptedNote?: string;
  rejectionReason?: string;
  rejectionDescription?: string;
}

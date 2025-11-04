import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  ClaimSummaryResponse,
  ClaimDetailResponse,
  CreateClaimRequest,
  ProcessClaimRequest,
} from '@/interfaces/claim.interface';

const baseClaimUrl = `${import.meta.env.VITE_API_URL}/claim`;

export const useClaimStore = defineStore('claim', {
  state: () => ({
    list: [] as ClaimSummaryResponse[],
    detail: null as ClaimDetailResponse | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAllFiltered(params?: { status?: string; planId?: string }): Promise<ClaimSummaryResponse[]> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<ClaimSummaryResponse[]>>(baseClaimUrl, {
          params: {
            status: params?.status?.trim() || undefined,
            planId: params?.planId?.trim() || undefined,
          },
        });
        this.list = res.data.data ?? [];
        if (this.list.length === 0) {
          toast.warning('Tidak ada claim sesuai filter');
        } else {
          toast.success('Data Claim dimuat');
        }
        return this.list;
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const message = (e.response?.data as any)?.message ?? e.message;
          this.error = message;
          toast.error(`Gagal memuat claim: ${message}`);
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal memuat claim: ${this.error}`);
        }
        return [];
      } finally {
        this.loading = false;
      }
    },

    async getById(id: string): Promise<ClaimDetailResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<ClaimDetailResponse>>(`${baseClaimUrl}/${id}`);
        this.detail = res.data.data ?? null;
        if (this.detail) {
          toast.success('Detail Claim dimuat');
        } else {
          toast.warning('Claim tidak ditemukan');
        }
        return this.detail;
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const message = (e.response?.data as any)?.message ?? e.message;
          this.error = message;
          if (e.response?.status === 404) {
            toast.warning(message || 'Claim tidak ditemukan');
          } else {
            toast.error(`Gagal memuat detail claim: ${message}`);
          }
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal memuat detail claim: ${this.error}`);
        }
        this.detail = null;
        return null;
      } finally {
        this.loading = false;
      }
    },

    async submitClaim(orderedPlanId: string, payload: CreateClaimRequest): Promise<ClaimDetailResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post<CommonResponseInterface<ClaimDetailResponse>>(
          `${baseClaimUrl}/submit/${orderedPlanId}`,
          payload
        );
        if (res.status === 201) {
          this.detail = res.data.data ?? null;
          toast.success('Claim berhasil diajukan');
          return this.detail;
        }
        if (res.status === 400) toast.warning(res.data?.message ?? 'Gagal mengajukan claim');
        return null;
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const message = (e.response?.data as any)?.message ?? e.message;
          this.error = message;
          toast.error(`Gagal mengajukan claim: ${message}`);
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal mengajukan claim: ${this.error}`);
        }
        return null;
      } finally {
        this.loading = false;
      }
    },

    async processClaim(claimId: string, payload: ProcessClaimRequest): Promise<ClaimDetailResponse | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.put<CommonResponseInterface<ClaimDetailResponse>>(
          `${baseClaimUrl}/process/${claimId}`,
          payload
        );
        if (res.status === 200) {
          this.detail = res.data.data ?? null;
          toast.success('Claim berhasil diproses');
          return this.detail;
        }
        if (res.status === 400) toast.warning(res.data?.message ?? 'Gagal memproses claim');
        return null;
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const message = (e.response?.data as any)?.message ?? e.message;
          this.error = message;
          toast.error(`Gagal memproses claim: ${message}`);
        } else {
          this.error = e instanceof Error ? e.message : 'Unknown error';
          toast.error(`Gagal memproses claim: ${this.error}`);
        }
        return null;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.list = [];
      this.detail = null;
      this.loading = false;
      this.error = null;
    },
  },
});

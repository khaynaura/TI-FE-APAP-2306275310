import { defineStore } from 'pinia';
import axios from 'axios';
import { toast } from 'vue-sonner';
import type { InsurancePlan, InsurancePlanRequest } from '@/interfaces/insurances.interface';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';

const baseInsurancePlanUrl = `${import.meta.env.VITE_API_URL}/insurance-plan`;

export const useInsurancePlanStore = defineStore('insurancePlan', {
  state: () => ({
    plans: [] as InsurancePlan[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchPlans(search?: string): Promise<InsurancePlan[]> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<InsurancePlan[]>>(baseInsurancePlanUrl, {
          params: search?.trim() ? { search: search.trim() } : undefined,
        });
        this.plans = res.data.data ?? [];
        const isSearch = !!search?.trim();
        if (this.plans.length === 0) {
          toast.warning(isSearch ? 'Tidak ada hasil pencarian' : 'Data Insurance Plan kosong');
        } else {
          toast.success(isSearch ? 'Hasil pencarian Insurance Plan dimuat' : 'Data Insurance Plan dimuat');
        }
        return this.plans;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Unknown error';
        toast.error(`Gagal memuat Insurance Plan${search ? ` (search="${search}")` : ''}: ${this.error}`);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async getPlanById(id: string): Promise<InsurancePlan | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get<CommonResponseInterface<InsurancePlan>>(`${baseInsurancePlanUrl}/${id}`);
        return res.data.data ?? null;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Unknown error';
        toast.error(`Gagal memuat plan: ${this.error}`);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createPlan(payload: InsurancePlanRequest): Promise<InsurancePlan | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post<CommonResponseInterface<InsurancePlan>>(
          `${baseInsurancePlanUrl}/create`,
          payload
        );
        if (res.status === 201) {
          const created = res.data.data;
          this.plans.push(created);
          toast.success('Insurance Plan berhasil dibuat');
          return created;
        }
        if (res.status === 400) toast.warning('Gagal membuat plan: Data tidak valid');
        return null;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Unknown error';
        toast.error(`Error saat membuat plan: ${this.error}`);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updatePlan(payload: InsurancePlanRequest): Promise<InsurancePlan | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.put<CommonResponseInterface<InsurancePlan>>(
          `${baseInsurancePlanUrl}/update`,
          payload
        );
        if (res.status === 200) {
          const updated = res.data.data;
          const idx = this.plans.findIndex(p => p.id === updated.id);
          if (idx !== -1) this.plans[idx] = updated;
          toast.success('Insurance Plan berhasil diperbarui');
          return updated;
        }
        if (res.status === 400) toast.warning('Gagal memperbarui plan: Data tidak valid');
        if (res.status === 404) toast.warning('Plan tidak ditemukan');
        return null;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Unknown error';
        toast.error(`Error saat memperbarui plan: ${this.error}`);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deletePlan(id: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.delete<CommonResponseInterface<InsurancePlan>>(
          `${baseInsurancePlanUrl}/delete/${id}`
        );
        if (res.status === 200) {
          await this.fetchPlans();
          toast.success('Insurance Plan berhasil dihapus');
          return true;
        }
        if (res.status === 404) toast.warning('Plan tidak ditemukan');
        if (res.status === 400) toast.warning(res.data?.message ?? 'Gagal menghapus plan');
        return false;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Unknown error';
        toast.error(`Error saat menghapus plan: ${this.error}`);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});

import { defineStore } from 'pinia'
import axios from 'axios'
import { toast } from 'vue-sonner'
import type { CommonResponseInterface } from '@/interfaces/common.response.interface'
// Pastikan nama file interface benar: "insurance.interface.ts" atau "insurances.interface.ts"
import type { HomeSummary } from '@/interfaces/insurances.interface.ts'

// Backend mapping: @RequestMapping("/api/statistics")
// Pastikan VITE_API_URL sudah mencakup "/api"
const baseStatisticsUrl = `${import.meta.env.VITE_API_URL}/statistics`

export const useStatisticsStore = defineStore('statistics', {
    state: () => ({
        summary: null as HomeSummary | null,
        loading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchHomeSummary(force = false): Promise<HomeSummary | null> {
            if (this.summary && !this.error && !force) return this.summary

            this.loading = true
            this.error = null

            try {
                const response = await axios.get<CommonResponseInterface<HomeSummary>>(
                    `${baseStatisticsUrl}/summary`
                )

                this.summary = response.data.data

                if (this.summary) {
                    toast.success('Statistik Beranda berhasil dimuat')
                } else {
                    toast.warning('Data statistik kosong')
                }

                return this.summary
            } catch (err: unknown) {
                let msg = 'Unknown error'

                if (axios.isAxiosError(err)) {
                    const resp = err.response?.data as Partial<CommonResponseInterface<unknown>> | undefined
                    msg = (resp?.message as string) ?? err.message ?? msg
                } else if (err instanceof Error) {
                    msg = err.message
                }

                this.error = msg
                this.summary = null
                toast.error(`Error saat memuat statistik: ${this.error}`)
                return null
            } finally {
                this.loading = false
            }
        },
    },
})

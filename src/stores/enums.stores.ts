import { defineStore } from 'pinia';

// Enum untuk Service yang dapat dicakup oleh Insurance Plan
// Nilai-nilai ini harus sesuai dengan ServiceEnum di Java Backend Anda
export enum ServiceEnum {
    ACCOMMODATION = 'ACCOMMODATION',
    FLIGHT = 'FLIGHT',
    TOUR_PACKAGE = 'TOUR_PACKAGE',
    RENTALS = 'RENTALS',
    ALL_SERVICES = 'ALL_SERVICES' // Tambahkan ini untuk opsi filter di frontend
}

// Store sederhana untuk mengekspos enum ini agar bisa diakses di mana saja
export const useEnumsStore = defineStore('enums', {
    state: () => ({
        // Kita hanya menyediakan list Service untuk kemudahan di dropdown
        serviceOptions: [
            { label: 'Accommodation', value: ServiceEnum.ACCOMMODATION },
            { label: 'Flight', value: ServiceEnum.FLIGHT },
            { label: 'Tour Package', value: ServiceEnum.TOUR_PACKAGE },
            { label: 'Rentals', value: ServiceEnum.RENTALS }
        ],
        // Kita tambahkan di sini untuk mempermudah saat looping filter
        serviceFilterOptions: [
            { label: 'All Services', value: ServiceEnum.ALL_SERVICES },
            { label: 'Accommodation', value: ServiceEnum.ACCOMMODATION },
            { label: 'Flight', value: ServiceEnum.FLIGHT },
            { label: 'Tour Package', value: ServiceEnum.TOUR_PACKAGE },
            { label: 'Rentals', value: ServiceEnum.RENTALS }
        ]
        // Nanti kita akan tambahkan ClaimStatusEnum, PolicyStatusEnum di sini
    }),
});

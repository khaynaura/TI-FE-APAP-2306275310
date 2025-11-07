import { defineStore } from 'pinia';

export enum ServiceEnum {
    ACCOMMODATION = 'ACCOMMODATION',
    FLIGHT = 'FLIGHT',
    TOUR_PACKAGE = 'TOUR_PACKAGE',
    RENTALS = 'RENTALS',
    ALL_SERVICES = 'ALL_SERVICES'
}

export const useEnumsStore = defineStore('enums', {
    state: () => ({
        serviceOptions: [
            { label: 'Accommodation', value: ServiceEnum.ACCOMMODATION },
            { label: 'Flight', value: ServiceEnum.FLIGHT },
            { label: 'Tour Package', value: ServiceEnum.TOUR_PACKAGE },
            { label: 'Rentals', value: ServiceEnum.RENTALS }
        ],

        serviceFilterOptions: [
            { label: 'All Services', value: ServiceEnum.ALL_SERVICES },
            { label: 'Accommodation', value: ServiceEnum.ACCOMMODATION },
            { label: 'Flight', value: ServiceEnum.FLIGHT },
            { label: 'Tour Package', value: ServiceEnum.TOUR_PACKAGE },
            { label: 'Rentals', value: ServiceEnum.RENTALS }
        ]
    }),
});

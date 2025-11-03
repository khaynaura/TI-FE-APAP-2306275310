
export interface CommonResponseInterface<T> {
    status: number;
    message: string;
    timestamp: string;
    data: T;
}

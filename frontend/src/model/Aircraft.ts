import type {AircraftStatus} from "@/model/AircraftStatus";

export interface Aircraft {
    _id: string;
    name: string;
    model: string;
    capacity: number;
    rangeKm: number;
    seats: Array<string>;
    location?: AircraftStatus;
}
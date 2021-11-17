import { UserZipp } from "./userzipp";

export class Zona_Zipp{
    constructor(
        public _id: string,
        public address: string,
        public city: string,
        public description: string,
        public horary_start: string,
        public horary_to: string,
        public image_bill: string,
        public image_zona_zipp: string,
        public estado_zonazipp: boolean,
        public lat: number,
        public lng: number,
        public number_spaces: number,
        public price: number,
        public score: number,
        //servicios
        public electric_station: boolean,
        public bike_type: boolean,
        public motorcycle_type: boolean,
        public car_type: boolean,
        public security_guard: boolean,
        public roofed: boolean,
        public phone: boolean,
        public cctv: boolean,
        public total_hours_day: boolean,
        public leave_key: boolean,
        public small_type: boolean,
        public medium_type: boolean,
        public big_type: boolean,
        public userzonazipp: UserZipp,
        public isParking: boolean
    ){}
}
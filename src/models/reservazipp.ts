import { User } from "./user";
import { Zona_Zipp } from "./zonazipp";
import { UserZipp } from "./userzipp";

export class ReservaZona{
    constructor(
        public placa: string,
        public fecha_inicio: string,
        public fecha_final: string, 
        public hora_inicio: string,
        public hora_fin:string,
        public tiempo_total: string,
        public estado_reserva: boolean,
        public valor_total: number,
        public zonazipp: Zona_Zipp,
        public userzonazipp: UserZipp,
        public user: User
    ){}
}
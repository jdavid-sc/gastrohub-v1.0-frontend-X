import { MesaEstado } from './enums';

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: MesaEstado;
}

export interface MesaCreate {
  numero: number;
  capacidad: number;
  estado?: MesaEstado;
}

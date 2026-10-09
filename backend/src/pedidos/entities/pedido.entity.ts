import { EstadoPedido, TipoPedido } from '../enums/pedido.enums';

export interface PedidoItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: string;
  codigo: string;
  cliente: string;
  mesa: number | null;
  tipo: TipoPedido;
  estado: EstadoPedido;
  items: PedidoItem[];
  notas?: string;
  total: number;
  creadoEn: string;
  actualizadoEn: string;
}

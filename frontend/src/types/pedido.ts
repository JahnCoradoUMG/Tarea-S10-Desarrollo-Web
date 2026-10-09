export type TipoPedido = 'local' | 'para_llevar' | 'delivery';

export type EstadoPedido =
  | 'pendiente'
  | 'en_preparacion'
  | 'listo'
  | 'entregado'
  | 'cancelado';

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

export interface PedidoFormData {
  codigo: string;
  cliente: string;
  mesa: string;
  tipo: TipoPedido;
  estado: EstadoPedido;
  items: PedidoItem[];
  notas: string;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

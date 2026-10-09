import type { Pedido } from '../types/pedido';

interface PedidosTableProps {
  pedidos: Pedido[];
  onEdit: (pedido: Pedido) => void;
  onDelete: (pedido: Pedido) => void;
  busyId: string | null;
}

const estadoLabel: Record<Pedido['estado'], string> = {
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const tipoLabel: Record<Pedido['tipo'], string> = {
  local: 'Local',
  para_llevar: 'Para llevar',
  delivery: 'Delivery',
};

export function PedidosTable({
  pedidos,
  onEdit,
  onDelete,
  busyId,
}: PedidosTableProps) {
  if (pedidos.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay pedidos registrados.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>
                <span className="code">{pedido.codigo}</span>
                {pedido.mesa != null && (
                  <span className="mesa">Mesa {pedido.mesa}</span>
                )}
              </td>
              <td>{pedido.cliente}</td>
              <td>{tipoLabel[pedido.tipo]}</td>
              <td>
                <span className={`chip chip--${pedido.estado}`}>
                  {estadoLabel[pedido.estado]}
                </span>
              </td>
              <td className="total">Q {pedido.total.toFixed(2)}</td>
              <td className="actions">
                <button
                  type="button"
                  className="btn btn--small btn--ghost"
                  onClick={() => onEdit(pedido)}
                  disabled={busyId === pedido.id}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn--small btn--danger"
                  onClick={() => onDelete(pedido)}
                  disabled={busyId === pedido.id}
                >
                  {busyId === pedido.id ? '…' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

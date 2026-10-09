import { useEffect, useState, type FormEvent } from 'react';
import type {
  EstadoPedido,
  Pedido,
  PedidoFormData,
  PedidoItem,
  TipoPedido,
} from '../types/pedido';

interface PedidoFormProps {
  initial?: Pedido | null;
  submitting: boolean;
  onSubmit: (data: PedidoFormData) => Promise<void>;
  onCancel: () => void;
}

const emptyItem = (): PedidoItem => ({
  nombre: '',
  cantidad: 1,
  precioUnitario: 0,
});

function fromPedido(pedido: Pedido): PedidoFormData {
  return {
    codigo: pedido.codigo,
    cliente: pedido.cliente,
    mesa: pedido.mesa === null || pedido.mesa === undefined ? '' : String(pedido.mesa),
    tipo: pedido.tipo,
    estado: pedido.estado,
    items: pedido.items.map((item) => ({ ...item })),
    notas: pedido.notas ?? '',
  };
}

function blankForm(): PedidoFormData {
  return {
    codigo: '',
    cliente: '',
    mesa: '',
    tipo: 'local',
    estado: 'pendiente',
    items: [emptyItem()],
    notas: '',
  };
}

export function PedidoForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: PedidoFormProps) {
  const [form, setForm] = useState<PedidoFormData>(
    initial ? fromPedido(initial) : blankForm(),
  );

  useEffect(() => {
    setForm(initial ? fromPedido(initial) : blankForm());
  }, [initial]);

  const estimatedTotal = form.items.reduce(
    (acc, item) => acc + Number(item.cantidad || 0) * Number(item.precioUnitario || 0),
    0,
  );

  function updateField<K extends keyof PedidoFormData>(
    key: K,
    value: PedidoFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(
    index: number,
    key: keyof PedidoItem,
    value: string | number,
  ) {
    setForm((prev) => {
      const items = prev.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      );
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form className="pedido-form" onSubmit={handleSubmit}>
      <header className="pedido-form__header">
        <h2>{initial ? 'Editar pedido' : 'Nuevo pedido'}</h2>
        <p>Los cambios se reflejan solo tras confirmación de la API.</p>
      </header>

      <div className="form-grid">
        <label>
          Código
          <input
            required
            value={form.codigo}
            onChange={(e) => updateField('codigo', e.target.value.toUpperCase())}
            placeholder="ORD-1004"
            pattern="[A-Z]{3}-\d{3,}"
            title="Formato AAA-### (ej. ORD-1004)"
          />
        </label>

        <label>
          Cliente
          <input
            required
            minLength={2}
            maxLength={80}
            value={form.cliente}
            onChange={(e) => updateField('cliente', e.target.value)}
            placeholder="Nombre del cliente"
          />
        </label>

        <label>
          Tipo
          <select
            value={form.tipo}
            onChange={(e) => updateField('tipo', e.target.value as TipoPedido)}
          >
            <option value="local">Local</option>
            <option value="para_llevar">Para llevar</option>
            <option value="delivery">Delivery</option>
          </select>
        </label>

        <label>
          Mesa
          <input
            type="number"
            min={1}
            value={form.mesa}
            onChange={(e) => updateField('mesa', e.target.value)}
            placeholder={form.tipo === 'local' ? 'Obligatoria' : 'Opcional'}
            required={form.tipo === 'local'}
          />
        </label>

        <label>
          Estado
          <select
            value={form.estado}
            onChange={(e) => updateField('estado', e.target.value as EstadoPedido)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_preparacion">En preparación</option>
            <option value="listo">Listo</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>

        <label className="span-2">
          Notas
          <input
            maxLength={250}
            value={form.notas}
            onChange={(e) => updateField('notas', e.target.value)}
            placeholder="Observaciones (opcional)"
          />
        </label>
      </div>

      <section className="items-section">
        <div className="items-section__head">
          <h3>Ítems</h3>
          <button type="button" className="btn btn--ghost" onClick={addItem}>
            + Agregar ítem
          </button>
        </div>

        {form.items.map((item, index) => (
          <div className="item-row" key={index}>
            <input
              required
              placeholder="Nombre"
              value={item.nombre}
              onChange={(e) => updateItem(index, 'nombre', e.target.value)}
            />
            <input
              required
              type="number"
              min={1}
              step={1}
              placeholder="Cant."
              value={item.cantidad}
              onChange={(e) => updateItem(index, 'cantidad', Number(e.target.value))}
            />
            <input
              required
              type="number"
              min={0}
              step={0.01}
              placeholder="Precio"
              value={item.precioUnitario}
              onChange={(e) =>
                updateItem(index, 'precioUnitario', Number(e.target.value))
              }
            />
            <button
              type="button"
              className="btn btn--danger-ghost"
              onClick={() => removeItem(index)}
              disabled={form.items.length === 1}
              aria-label="Quitar ítem"
            >
              ✕
            </button>
          </div>
        ))}

        <p className="total-hint">
          Total estimado (servidor recalcula):{' '}
          <strong>Q {estimatedTotal.toFixed(2)}</strong>
        </p>
      </section>

      <footer className="pedido-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear pedido'}
        </button>
      </footer>
    </form>
  );
}

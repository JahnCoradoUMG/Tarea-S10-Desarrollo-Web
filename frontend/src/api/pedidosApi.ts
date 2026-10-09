import type { ApiErrorBody, Pedido, PedidoFormData } from '../types/pedido';

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function formatMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join('. ') : body.message;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T | null> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      formatMessage(body as ApiErrorBody | null, `Error HTTP ${response.status}`),
    );
  }

  return body as T;
}

function toPayload(form: PedidoFormData) {
  const mesaNumber =
    form.mesa.trim() === '' ? null : Number(form.mesa);

  return {
    codigo: form.codigo.trim().toUpperCase(),
    cliente: form.cliente.trim(),
    mesa: mesaNumber,
    tipo: form.tipo,
    estado: form.estado,
    items: form.items.map((item) => ({
      nombre: item.nombre.trim(),
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
    })),
    notas: form.notas.trim() || undefined,
  };
}

export async function listarPedidos(): Promise<Pedido[]> {
  return (await request<Pedido[]>('/pedidos')) ?? [];
}

export async function crearPedido(form: PedidoFormData): Promise<Pedido> {
  const created = await request<Pedido>('/pedidos', {
    method: 'POST',
    body: JSON.stringify(toPayload(form)),
  });
  if (!created) {
    throw new Error('La API no devolvió el pedido creado');
  }
  return created;
}

export async function actualizarPedido(
  id: string,
  form: PedidoFormData,
): Promise<Pedido> {
  const updated = await request<Pedido>(`/pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toPayload(form)),
  });
  if (!updated) {
    throw new Error('La API no devolvió el pedido actualizado');
  }
  return updated;
}

export async function eliminarPedido(id: string): Promise<void> {
  await request<null>(`/pedidos/${id}`, { method: 'DELETE' });
}

export { API_BASE };

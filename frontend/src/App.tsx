import { useCallback, useEffect, useState } from 'react';
import {
  actualizarPedido,
  API_BASE,
  crearPedido,
  eliminarPedido,
  listarPedidos,
} from './api/pedidosApi';
import { PedidoForm } from './components/PedidoForm';
import { PedidosTable } from './components/PedidosTable';
import { StatusBanner } from './components/StatusBanner';
import type { Pedido, PedidoFormData } from './types/pedido';
import './App.css';

type UiStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; message: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export default function App() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [status, setStatus] = useState<UiStatus>({ kind: 'idle' });
  const [editing, setEditing] = useState<Pedido | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const cargarPedidos = useCallback(async (silent = false) => {
    if (!silent) {
      setStatus({ kind: 'loading', message: 'Cargando pedidos…' });
    }
    try {
      const data = await listarPedidos();
      setPedidos(data);
      if (!silent) {
        setStatus({
          kind: 'success',
          message: `Se cargaron ${data.length} pedido(s).`,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los pedidos';
      setStatus({ kind: 'error', message });
    }
  }, []);

  useEffect(() => {
    void cargarPedidos();
  }, [cargarPedidos]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(pedido: Pedido) {
    setEditing(pedido);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(form: PedidoFormData) {
    setSubmitting(true);
    setStatus({
      kind: 'loading',
      message: editing ? 'Actualizando pedido…' : 'Creando pedido…',
    });
    try {
      if (editing) {
        const updated = await actualizarPedido(editing.id, form);
        setPedidos((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        setStatus({
          kind: 'success',
          message: `Pedido ${updated.codigo} actualizado correctamente.`,
        });
      } else {
        const created = await crearPedido(form);
        setPedidos((prev) =>
          [...prev, created].sort((a, b) => a.codigo.localeCompare(b.codigo)),
        );
        setStatus({
          kind: 'success',
          message: `Pedido ${created.codigo} creado correctamente.`,
        });
      }
      closeForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al guardar el pedido';
      setStatus({ kind: 'error', message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(pedido: Pedido) {
    const ok = window.confirm(
      `¿Eliminar el pedido ${pedido.codigo} de ${pedido.cliente}?`,
    );
    if (!ok) return;

    setBusyId(pedido.id);
    setStatus({ kind: 'loading', message: `Eliminando ${pedido.codigo}…` });
    try {
      await eliminarPedido(pedido.id);
      setPedidos((prev) => prev.filter((p) => p.id !== pedido.id));
      if (editing?.id === pedido.id) {
        closeForm();
      }
      setStatus({
        kind: 'success',
        message: `Pedido ${pedido.codigo} eliminado.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar el pedido';
      setStatus({ kind: 'error', message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">R</span>
          <div>
            <strong>Reztro Café</strong>
            <small>Orders Admin</small>
          </div>
        </div>
        <nav>
          <button type="button" className="nav-item nav-item--active">
            Pedidos
          </button>
        </nav>
        <p className="sidebar__meta">API: {API_BASE}</p>
      </aside>

      <main className="main">
        <header className="page-header">
          <div>
            <p className="eyebrow">Panel operativo</p>
            <h1>Pedidos</h1>
            <p className="lede">
              Gestiona pedidos del café: listar, crear, actualizar y eliminar
              contra la API NestJS.
            </p>
          </div>
          <div className="page-header__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void cargarPedidos()}
            >
              Actualizar
            </button>
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              + Nuevo pedido
            </button>
          </div>
        </header>

        {status.kind === 'loading' && (
          <StatusBanner kind="loading">{status.message}</StatusBanner>
        )}
        {status.kind === 'success' && (
          <StatusBanner kind="success">{status.message}</StatusBanner>
        )}
        {status.kind === 'error' && (
          <StatusBanner kind="error">{status.message}</StatusBanner>
        )}

        <section className="panel">
          <div className="panel__head">
            <h2>Listado</h2>
            <span className="count">{pedidos.length} registros</span>
          </div>
          <PedidosTable
            pedidos={pedidos}
            onEdit={openEdit}
            onDelete={(p) => void handleDelete(p)}
            busyId={busyId}
          />
        </section>

        {showForm && (
          <div className="drawer-backdrop" onClick={closeForm}>
            <div
              className="drawer"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <PedidoForm
                initial={editing}
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancel={closeForm}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

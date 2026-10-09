import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ReplacePedidoDto } from './dto/replace-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido, PedidoItem } from './entities/pedido.entity';
import { EstadoPedido, TipoPedido } from './enums/pedido.enums';

@Injectable()
export class PedidosService implements OnModuleInit {
  private readonly pedidos = new Map<string, Pedido>();

  onModuleInit(): void {
    this.seed();
  }

  findAll(): Pedido[] {
    return Array.from(this.pedidos.values()).sort((a, b) =>
      a.codigo.localeCompare(b.codigo),
    );
  }

  findOne(id: string): Pedido {
    const pedido = this.pedidos.get(id);
    if (!pedido) {
      throw new NotFoundException(`Pedido con id "${id}" no encontrado`);
    }
    return pedido;
  }

  create(dto: CreatePedidoDto): Pedido {
    this.assertCodigoUnico(dto.codigo);
    this.assertMesaSegunTipo(dto.tipo, dto.mesa);
    const items = this.normalizeItems(dto.items);
    const total = this.resolveTotal(items, dto.total);
    const now = new Date().toISOString();

    const pedido: Pedido = {
      id: randomUUID(),
      codigo: dto.codigo.trim(),
      cliente: dto.cliente.trim(),
      mesa: dto.mesa ?? null,
      tipo: dto.tipo,
      estado: dto.estado,
      items,
      notas: dto.notas?.trim(),
      total,
      creadoEn: now,
      actualizadoEn: now,
    };

    this.pedidos.set(pedido.id, pedido);
    return pedido;
  }

  update(id: string, dto: UpdatePedidoDto): Pedido {
    const campos = Object.entries(dto as Record<string, unknown>).filter(
      ([, value]) => value !== undefined,
    );
    if (campos.length === 0) {
      throw new BadRequestException(
        'El body de PATCH no puede estar vacío; envíe al menos un campo',
      );
    }

    const actual = this.findOne(id);
    const codigo = dto.codigo?.trim() ?? actual.codigo;
    if (codigo !== actual.codigo) {
      this.assertCodigoUnico(codigo, id);
    }

    const tipo = dto.tipo ?? actual.tipo;
    const mesa =
      dto.mesa !== undefined
        ? dto.mesa
        : actual.mesa;
    this.assertMesaSegunTipo(tipo, mesa);

    const items = dto.items
      ? this.normalizeItems(dto.items)
      : actual.items;
    const total = dto.items
      ? this.resolveTotal(items, dto.total)
      : dto.total !== undefined
        ? this.resolveTotal(items, dto.total)
        : actual.total;

    const actualizado: Pedido = {
      ...actual,
      codigo,
      cliente: dto.cliente !== undefined ? dto.cliente.trim() : actual.cliente,
      mesa: mesa ?? null,
      tipo,
      estado: dto.estado ?? actual.estado,
      items,
      notas:
        dto.notas !== undefined
          ? dto.notas?.trim() || undefined
          : actual.notas,
      total,
      actualizadoEn: new Date().toISOString(),
    };

    this.pedidos.set(id, actualizado);
    return actualizado;
  }

  replace(id: string, dto: ReplacePedidoDto): Pedido {
    const actual = this.findOne(id);
    this.assertCodigoUnico(dto.codigo, id);
    this.assertMesaSegunTipo(dto.tipo, dto.mesa);
    const items = this.normalizeItems(dto.items);
    const total = this.resolveTotal(items, dto.total);

    const reemplazado: Pedido = {
      id: actual.id,
      codigo: dto.codigo.trim(),
      cliente: dto.cliente.trim(),
      mesa: dto.mesa ?? null,
      tipo: dto.tipo,
      estado: dto.estado,
      items,
      notas: dto.notas?.trim(),
      total,
      creadoEn: actual.creadoEn,
      actualizadoEn: new Date().toISOString(),
    };

    this.pedidos.set(id, reemplazado);
    return reemplazado;
  }

  remove(id: string): void {
    this.findOne(id);
    this.pedidos.delete(id);
  }

  private assertCodigoUnico(codigo: string, excludeId?: string): void {
    for (const pedido of this.pedidos.values()) {
      if (pedido.codigo === codigo && pedido.id !== excludeId) {
        throw new ConflictException(
          `Ya existe un pedido con el código "${codigo}"`,
        );
      }
    }
  }

  private assertMesaSegunTipo(
    tipo: TipoPedido,
    mesa: number | null | undefined,
  ): void {
    if (tipo === TipoPedido.LOCAL && (mesa === null || mesa === undefined)) {
      throw new BadRequestException(
        'La mesa es obligatoria (entero ≥ 1) cuando el tipo es local',
      );
    }
  }

  private normalizeItems(
    items: Array<{ nombre: string; cantidad: number; precioUnitario: number }>,
  ): PedidoItem[] {
    return items.map((item) => ({
      nombre: item.nombre.trim(),
      cantidad: item.cantidad,
      precioUnitario: this.round2(item.precioUnitario),
    }));
  }

  private calcularTotal(items: PedidoItem[]): number {
    const suma = items.reduce(
      (acc, item) => acc + item.cantidad * item.precioUnitario,
      0,
    );
    return this.round2(suma);
  }

  private resolveTotal(
    items: PedidoItem[],
    totalCliente?: number,
  ): number {
    const calculado = this.calcularTotal(items);
    if (
      totalCliente !== undefined &&
      Math.abs(totalCliente - calculado) > 0.01
    ) {
      throw new BadRequestException(
        `El total enviado (${totalCliente}) no coincide con la suma de ítems (${calculado})`,
      );
    }
    return calculado;
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private seed(): void {
    const now = new Date().toISOString();

    const seeds: Pedido[] = [
      {
        id: randomUUID(),
        codigo: 'ORD-1001',
        cliente: 'Ana López',
        mesa: 4,
        tipo: TipoPedido.LOCAL,
        estado: EstadoPedido.EN_PREPARACION,
        items: [
          { nombre: 'Café americano', cantidad: 2, precioUnitario: 18.5 },
          { nombre: 'Croissant', cantidad: 1, precioUnitario: 22 },
        ],
        notas: 'Mesa cerca de la ventana',
        total: 59,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        id: randomUUID(),
        codigo: 'ORD-1002',
        cliente: 'Carlos Ruiz',
        mesa: null,
        tipo: TipoPedido.PARA_LLEVAR,
        estado: EstadoPedido.PENDIENTE,
        items: [
          { nombre: 'Capuchino', cantidad: 1, precioUnitario: 28 },
          { nombre: 'Brownie', cantidad: 1, precioUnitario: 20 },
        ],
        notas: 'Para llevar en 10 min',
        total: 48,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        id: randomUUID(),
        codigo: 'ORD-1003',
        cliente: 'María Pérez',
        mesa: null,
        tipo: TipoPedido.DELIVERY,
        estado: EstadoPedido.LISTO,
        items: [
          { nombre: 'Jugo natural', cantidad: 2, precioUnitario: 15 },
          { nombre: 'Sandwich club', cantidad: 1, precioUnitario: 45 },
        ],
        notas: 'Entregar en zona 10',
        total: 75,
        creadoEn: now,
        actualizadoEn: now,
      },
    ];

    for (const pedido of seeds) {
      this.pedidos.set(pedido.id, pedido);
    }
  }
}

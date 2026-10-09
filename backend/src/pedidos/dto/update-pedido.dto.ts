import { PartialType } from '@nestjs/swagger';
import { CreatePedidoDto } from './create-pedido.dto';

/**
 * Body parcial para PATCH. Al menos un campo debe enviarse
 * (validado en el servicio → 400 si el body está vacío).
 */
export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {}

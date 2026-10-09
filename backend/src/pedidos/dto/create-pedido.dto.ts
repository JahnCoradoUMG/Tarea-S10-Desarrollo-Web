import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { EstadoPedido, TipoPedido } from '../enums/pedido.enums';
import { PedidoItemDto } from './pedido-item.dto';

export class CreatePedidoDto {
  @ApiProperty({ example: 'ORD-1004', description: 'Código único del pedido' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[A-Z]{3}-\d{3,}$/, {
    message: 'codigo debe seguir el patrón AAA-### (ej. ORD-1004)',
  })
  codigo!: string;

  @ApiProperty({ example: 'Ana López', minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  cliente!: string;

  @ApiPropertyOptional({
    example: 5,
    nullable: true,
    description:
      'Entero ≥ 1 si tipo es local; puede ser null en para_llevar/delivery',
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  mesa?: number | null;

  @ApiProperty({ enum: TipoPedido, example: TipoPedido.LOCAL })
  @IsEnum(TipoPedido)
  tipo!: TipoPedido;

  @ApiProperty({ enum: EstadoPedido, example: EstadoPedido.PENDIENTE })
  @IsEnum(EstadoPedido)
  estado!: EstadoPedido;

  @ApiProperty({ type: [PedidoItemDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items!: PedidoItemDto[];

  @ApiPropertyOptional({ example: 'Sin azúcar', maxLength: 250 })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  notas?: string;

  @ApiPropertyOptional({
    example: 48.5,
    description:
      'Opcional. Si se envía, debe coincidir con la suma de ítems (tolerancia 0.01). El servidor recalcula el total.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total?: number;
}

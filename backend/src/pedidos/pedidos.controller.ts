import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ReplacePedidoDto } from './dto/replace-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PedidosService } from './pedidos.service';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los pedidos' })
  @ApiOkResponse({ description: 'Colección de pedidos' })
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por id' })
  @ApiOkResponse({ description: 'Pedido encontrado' })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un pedido' })
  @ApiCreatedResponse({ description: 'Pedido creado' })
  @ApiConflictResponse({ description: 'Código de pedido duplicado' })
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente un pedido' })
  @ApiOkResponse({ description: 'Pedido actualizado' })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  @ApiConflictResponse({ description: 'Código de pedido duplicado' })
  update(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.pedidosService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Reemplazar completamente un pedido (conserva id y creadoEn)',
  })
  @ApiOkResponse({ description: 'Pedido reemplazado' })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  @ApiConflictResponse({ description: 'Código de pedido duplicado' })
  replace(@Param('id') id: string, @Body() dto: ReplacePedidoDto) {
    return this.pedidosService.replace(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un pedido' })
  @ApiNoContentResponse({ description: 'Pedido eliminado' })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  remove(@Param('id') id: string): void {
    this.pedidosService.remove(id);
  }
}

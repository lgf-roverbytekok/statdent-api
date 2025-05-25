import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { OperatorResponseDto } from './dto/operator-response.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';

@Roles(Role.Statistician)
@ApiBearerAuth()
@ApiTags('Operators')
@Controller('operator')
export class OperatorController {
  constructor(private readonly service: OperatorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo operador' })
  @ApiResponse({ status: 201, type: OperatorResponseDto })
  create(@Body() dto: CreateOperatorDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los operadores' })
  @ApiResponse({ status: 200, type: [OperatorResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un operador por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: OperatorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un operador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: OperatorResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOperatorDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un operador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

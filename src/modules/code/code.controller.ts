import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { CodeService } from './code.service';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';

@Roles(Role.Statistician)
@ApiBearerAuth()
@ApiTags('Code') // Nombre del grupo en Swagger UI
@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo código' })
  @ApiResponse({ status: 201, description: 'Código creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para crear el código',
  })
  create(@Body() dto: CreateCodeDto) {
    return this.codeService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los códigos, opcionalmente filtrados por sección',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    type: Number,
    description: 'Filtrar por sección',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de códigos obtenida correctamente',
  })
  findAll(@Query('sectionId') sectionId?: string) {
    const secId = sectionId !== undefined ? parseInt(sectionId, 10) : undefined;
    return this.codeService.findAll(isNaN(<number>secId) ? undefined : secId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un código por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del código' })
  @ApiResponse({ status: 200, description: 'Código encontrado' })
  @ApiResponse({ status: 404, description: 'Código no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.codeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un código por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del código a actualizar',
  })
  @ApiResponse({ status: 200, description: 'Código actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Código no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodeDto) {
    return this.codeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un código por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del código a eliminar',
  })
  @ApiResponse({ status: 200, description: 'Código eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Código no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.codeService.remove(id);
  }
}

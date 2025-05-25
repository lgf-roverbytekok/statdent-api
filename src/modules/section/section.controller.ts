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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';

@Roles(Role.Statistician)
@ApiTags('Section')
@ApiBearerAuth()
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sección' })
  @ApiResponse({ status: 201, description: 'Sección creada exitosamente' })
  create(@Body() dto: CreateSectionDto) {
    return this.sectionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las secciones' })
  @ApiResponse({ status: 200, description: 'Lista de secciones' })
  findAll() {
    return this.sectionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Sección encontrada' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una sección existente' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la sección a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Sección actualizada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    return this.sectionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sección' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la sección a eliminar',
  })
  @ApiResponse({ status: 200, description: 'Sección eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.remove(id);
  }
}

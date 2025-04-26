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
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AgeGroupService } from './age-group.service';
import { CreateAgeGroupDto } from './dto/create-age-group.dto';
import { UpdateAgeGroupDto } from './dto/update-age-group.dto';

@ApiBearerAuth()
@ApiTags('Age Group')
@Controller('age-group')
export class AgeGroupController {
  constructor(private readonly ageGroupService: AgeGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo grupo de edad' })
  @ApiResponse({ status: 201, description: 'Creado', type: CreateAgeGroupDto })
  create(@Body() dto: CreateAgeGroupDto) {
    return this.ageGroupService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Recuperar todos los grupos de edad' })
  @ApiResponse({ status: 200, description: 'Lista de grupos de edad' })
  findAll() {
    return this.ageGroupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recuperar un grupo de edad por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Grupo de edad' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ageGroupService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo de edad existente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Actualizado con éxito' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgeGroupDto,
  ) {
    return this.ageGroupService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un grupo de edad' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Eliminado con éxito' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ageGroupService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validRole } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';



@Controller('products')
// Para usar cualquier ruta tenes que estar autenticado gracias al auth
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user:User
    ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOnePlain(id);
  }

  @Patch(':id')
  @Auth(validRole.admin)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @GetUser() user:User) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(validRole.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}

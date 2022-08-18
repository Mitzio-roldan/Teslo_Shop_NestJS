import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ObjectID, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }

  async create(createProductDto: CreateProductDto) {

    try {

      if (createProductDto.price) {
        createProductDto.price = +createProductDto.price
      }

      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product)
      return product

    } catch (error) {
      this.handleException(error)
    }


  }

  findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto

    return this.productRepository.find({
      take: limit,
      skip: offset
    })
  }

  async findOne(id: string) {
    let product: Product

    if (!uuidValidate(id)) {
      const queryBuilder = this.productRepository.createQueryBuilder()
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug',{
        title: id.toUpperCase(),
        slug: id.toLowerCase(),
      }).getOne()

    }
    else {
      product = await this.productRepository.findOneBy({ id })
    }

    if (!product) {
      throw new BadRequestException('Product no exist')
    }

    return product

  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })
    if(!product) throw new NotFoundException(`Product wit id: ${id} not found`)
    
    try {
      await this.productRepository.save(product)
      return product 
      
    } catch (error) {
      this.handleException(error)
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id)
      await this.productRepository.delete({ id: product.id })
      return 'Product deleted'

    } catch (error) {
      this.handleException(error)
    }

  }

  private handleException(error: any) {
    if (error.code == '23505') throw new BadRequestException(error.detail)
    this.logger.error(error)
    throw new InternalServerErrorException('ayuda')
  }
}

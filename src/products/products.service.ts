import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, ObjectID, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as uuidValidate } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { url } from 'inspector';
import { User } from '../auth/entities/auth.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private dataSource:DataSource
  ) { }

  async create(createProductDto: CreateProductDto, user:User) {

    try {

      const {images = [], ...productDetails} = createProductDto

      const product = this.productRepository.create({
      ...productDetails,
      images: images.map(image => this.productImageRepository.create({url: image})),
      user  
      })
      await this.productRepository.save(product)
      return {...product, images}

    } catch (error) {
      this.handleException(error)
    }


  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{
        images: true
      }
    })
    return products.map(product => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(id: string) {
    let product: Product

    if (!uuidValidate(id)) {
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug',{
        title: id.toUpperCase(),
        slug: id.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne()

    }
    else {
      product = await this.productRepository.findOneBy({ id })
    }

    if (!product) {
      throw new BadRequestException('Product no exist')
    }

    return product

  }

  async findOnePlain (term: string){
    const {images = [], ...rest} = await this.findOne(term)
    return{
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {
    
    const {images=[], ...toUpdate} = updateProductDto

    const product = await this.productRepository.preload({id, ...toUpdate})

    if(!product) throw new NotFoundException(`Product wit id: ${id} not found`)
    
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      
      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}})

        product.images = images.map(
          image => this.productImageRepository.create({url: image})
        )
      }
      product.user = user
      
      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()

      return this.findOnePlain(id)
      
    } catch (error) {
      
      await queryRunner.rollbackTransaction()
      await queryRunner.release()


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

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query
        .delete()
        .where({})
        .execute()

    } catch (error) {
      this.handleException(error)
    }
  }
}

import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, Tree, ManyToOne } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/auth.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({name: 'product_images'})
export class Product {

    @ApiProperty({
        example: '',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string

    @ApiProperty({
        example: 100,
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number

    @ApiProperty({
        example: 'Description example',
        description: 'Product Description',
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG - for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string

    @ApiProperty()
    @Column('text',{
        array:true,
        default:[]
    })
    tags: string[]

    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        {cascade:true, eager: true}
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user:User



    @BeforeInsert()
    checkSlugInsert() {

        if (!this.slug) {
            this.slug = this.title
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlug(){
        
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

}

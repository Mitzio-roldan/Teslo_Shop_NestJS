import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from './product.entity';

@Entity({name: 'products'})
export class ProductImage {

    @ApiProperty()
    @PrimaryGeneratedColumn()
    id:number
    
    @ApiProperty()
    @Column('text')
    url:string

    @ManyToOne(
        () => Product,
        (product) => product.images,
        {onDelete: 'CASCADE'}
    )
    product:Product

}
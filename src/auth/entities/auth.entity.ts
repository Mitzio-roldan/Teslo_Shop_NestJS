import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from '../../products/entities/product.entity';

@Entity('users')
export class User {

    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column('text',{
        unique: true
    })
    email: string

    @ApiProperty()
    @Column('text',{
        select: false
    })
    password: string

    @ApiProperty()
    @Column('text')
    fullName: string

    @ApiProperty()
    @Column({
        type:'boolean',
        default: true
    })
    isActive:boolean

    @ApiProperty()
    @Column('text', {
        array: true,
        default:['user']
    })
    roles: string[]

    @OneToMany(
        () => Product,
        (product) => product.user
    )
    product: Product


    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim()
    }
    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }

}

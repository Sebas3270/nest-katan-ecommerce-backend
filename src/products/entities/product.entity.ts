import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '17f154b5-1762-4807-99f7-86a0b1aede7a',
        description: 'Product Id',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt juvenile',
        description: 'Product Title',
        uniqueItems: true,
    })
    @Column({
        type: 'text',
        unique: true
    })
    title: string;

    @ApiProperty()
    @Column({
        type: 'float',
        default: 0,
    })
    price: number;

    @ApiProperty()
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty()
    @Column({
        type: 'text',
        unique: true
    })
    slug: string;

    @ApiProperty()
    @Column({
        type: 'int',
        default: 0,
    })
    stock: number;

    @ApiProperty()
    @Column({
        type: 'text',
        array: true
    })
    sizes: string[];

    @ApiProperty()
    @Column({
        type: 'text',
    })
    gender: string;

    @ApiProperty()
    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    @BeforeUpdate()
    checkSlugInsert(){

        if(!this.slug){
            this.slug = this.title;
        }

        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }

}

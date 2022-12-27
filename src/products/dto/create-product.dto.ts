import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        example: 'Spring T-shirt',
        nullable: false,
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 29.99,
        nullable: false,
    })
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @ApiProperty({
        example: 'New T-shirt that has a flower in the middle',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 'spring_t_shirt',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({
        example: 200,
        nullable: true,
    })
    @ApiProperty()
    @IsOptional()
    @IsInt()
    @IsPositive()
    stock?: number;

    @ApiProperty({
        example: ['xs,s,m,l,xl'],
        nullable: false,
    })
    @IsString({ each: true})
    @IsArray()
    sizes: string[];

    @ApiProperty({
        example: 'men',
        nullable: false,
    })
    @IsIn(['men', 'women', 'kid'])
    gender: string;

    @ApiProperty({
        example: ['spring','t-shirt','latest'],
        nullable: false,
    })
    @IsOptional()
    @IsString({ each: true})
    @IsArray()
    tags: string[];

    @ApiProperty({
        example: ['http://image1.jpg'],
        nullable: false,
    })
    @ApiProperty()
    @IsOptional()
    @IsString({ each: true})
    @IsArray()
    images: string[];

}

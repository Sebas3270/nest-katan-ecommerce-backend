import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    stock?: number;

    @IsString({ each: true})
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'kid'])
    gender: string;

    @IsOptional()
    @IsString({ each: true})
    @IsArray()
    tags: string[];

    @IsOptional()
    @IsString({ each: true})
    @IsArray()
    images: string[];

}

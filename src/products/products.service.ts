import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUuid } from 'uuid'

@Injectable()
export class ProductsService {

  private logger = new Logger();

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    
    try {

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
      
    } catch (error) {
      
      this.handleErrors(error);
      
    }

  }

  async findAll( paginationDto: PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset
    });

    return products;
  }

  async findOne(term: string) {
    // const product = await this.productRepository.findOneBy({ id })

    let product:Product

    if(isUuid(term)){ 
      product = await this.productRepository.findOneBy({ id: term })
    }else{
      // product = await this.productRepository.findOneBy({ slug: term })
      const queryBuilder = this.productRepository.createQueryBuilder()
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne()
    }

    if(!product)
      throw new NotFoundException(`Product with id/slug/name '${term}' not found`)

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    try {

      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto
      });
      if ( !product ) throw new NotFoundException(`Product with id '${id}' not found`);
      await this.productRepository.save(product);
      return product;

    } catch (error) {

      this.handleErrors(error);

    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }

  private handleErrors(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`There was an unexpected error, check logs`)
  }

}

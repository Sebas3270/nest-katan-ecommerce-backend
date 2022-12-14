import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { validate as isUuid } from 'uuid'
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {

  private logger = new Logger();

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto) {
    
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails, 
        images: images.map(image => this.productImageRepository.create({url: image})),
      });
      await this.productRepository.save(product);
      return { ...product, images};
      
    } catch (error) {
      
      this.handleErrors(error);
      
    }

  }

  async findAll( paginationDto: PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images.map(image => image.url)
    }));
  }

  async findOne(term: string) {
    // const product = await this.productRepository.findOneBy({ id })

    let product:Product

    if(isUuid(term)){ 
      product = await this.productRepository.findOneBy({ id: term })
    }else{
      // product = await this.productRepository.findOneBy({ slug: term })
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if(!product)
      throw new NotFoundException(`Product with id/slug/name '${term}' not found`)

    return product;
  }

  async findOneSummarized(term: string){
    const { images = [], ...restProduct } = await this.findOne(term);
    return {
      ...restProduct,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    
    const { images, ...toUpdate } = updateProductDto;
    
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
    if ( !product ) throw new NotFoundException(`Product with id '${id}' not found`);
    
    //Create QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {

      if ( images ){
        await queryRunner.manager.delete( ProductImage, { product: { id } } )

        product.images = images.map(image => this.productImageRepository.create({url: image}))
      }

      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      await this.productRepository.save(product);
      return this.findOneSummarized( id );

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleErrors(error);

    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async removeAll(){

    const query = this.productRepository.createQueryBuilder('product');

    try {

      return await query.delete()
      .where({})
      .execute()

    } catch (error) {
      this.handleErrors(error)
    }

  }

  private handleErrors(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`There was an unexpected error, check logs`)
  }

}

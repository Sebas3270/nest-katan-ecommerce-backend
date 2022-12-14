import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
  ){}
  
  async executeSeed(){
    await this.productsService.removeAll();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product => {
      insertPromises.push(this.productsService.create( product ));
    });

    await Promise.all(insertPromises);

    return 'Seed executed succesfully';
  }

}
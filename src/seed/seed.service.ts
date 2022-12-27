import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt'

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}
  
  async executeSeed(){
    // await this.productsService.removeAll();

    await this.deleteTables();
    const adminUser = await this.generateUsers();

    await this.generateProducts(adminUser);
    

    return 'Seed executed succesfully';
  }

  private async deleteTables(){
    await this.productsService.removeAll();
    
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute()
  }

  private async generateUsers(){

    const seedUsers = initialData.users;
    const users:User[] = [];

    seedUsers.forEach(user => {
      user.password = bcrypt.hashSync(user.password, 10);
      users.push(this.userRepository.create(user))
    });

    const [ adminUser ] = await this.userRepository.save(seedUsers);

    return adminUser;

  }
  
  private async generateProducts(user: User){
    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product => {
      insertPromises.push(this.productsService.create( product, user ));
    });

    await Promise.all(insertPromises);
  }
}

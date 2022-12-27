import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;

      return {
        user,
        token: this.getJwtToken({ id: user.id })
      }
      
    } catch (error) {
      this.handleDbErrors(error)
    }
  }

  async loginUser(loginUserDto: LoginUserDto){

    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email
      },
      select: {
        email: true,
        password: true,
        id: true
      }
    })

    console.log(user)

    if (!user) throw new UnauthorizedException(`Not valid credentials`)

    if( !bcrypt.compareSync( password, user.password ) ) throw new UnauthorizedException(`Not valid credentials`)

    return {
      user,
      token: this.getJwtToken({ id: user.id })
    }

  }

  private getJwtToken( payload: JwtPayload ){

    const token = this.jwtService.sign(payload);
    return token;

  }

  async checkAuthStatus(user: User){

    return {
      user,
      token: this.getJwtToken({ id: user.id })
    }

  }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  private handleDbErrors(error:any){

    if(error.code === '23505'){
      throw new BadRequestException(error.detail)
    }

    console.log(error)
    throw new InternalServerErrorException('Check server logs')

  }
}

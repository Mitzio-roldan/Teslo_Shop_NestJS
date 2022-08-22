import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService
  ){}


  async create(createUserDto: CreateUserDto) {
    
    try {
    
        const {password, ...userDate} = createUserDto

        const user = this.userRepository.create({
          ...userDate,
          password: bcrypt.hashSync(password, 10)
        })

        await this.userRepository.save(user)
        delete user.password

        return user
      
    } catch (error) {
      if (error.code == '23505') {
        throw new BadRequestException(error.detail)
      }
      console.log(error);
      throw new InternalServerErrorException('Please check server errors')
      
      
    }


  }

  async login(loginUserDto: LoginUserDto){

    const {email, password} = loginUserDto

    const user = await this.userRepository.findOne({
      where:{email},
      select: {email: true, password:true, id:true}  
    })

    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect')
    }
    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Email or password is incorrect')
    }
    return {...user,
      token: this.getJwtToken({id: user.id})
    }
    
  }

  private getJwtToken(payload:JwtPayloadInterface){
     
    const token = this.jwtService.sign(payload)
    return token

  }

  async checkAuthStatus(user: User){
    if (user) {
      const token = await this.getJwtToken({id: user.id})
      
      return {...user,
        token: this.getJwtToken({id: user.id})
      }
    }
     throw new UnauthorizedException('User not logged')
  }

  
}

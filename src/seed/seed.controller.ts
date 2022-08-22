import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';


// Crear el tag en la documentacion de la api 
@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

 

  @Get()
  executeSeed() {
    return this.seedService.runSeed();
  }

 }

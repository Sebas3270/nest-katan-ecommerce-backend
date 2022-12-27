import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage( @Param('imageName') imageName: string, @Res() res:Response){
    const path = this.filesService.getStaticProductImage(imageName);
    return res.sendFile(path)
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
        fileFilter: fileFilter,
        storage: diskStorage({
          destination: './static/uploads',
          filename: fileNamer
        })
      }
    ) 
  )
  uploadProductImage( @UploadedFile() file: Express.Multer.File ){

    // const secureUrl = file.filename
    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`

    return {
      secureUrl
    }
  }
}

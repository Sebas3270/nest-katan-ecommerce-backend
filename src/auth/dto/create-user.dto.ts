import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsLowercase, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

    @ApiProperty({
        example: 'test3@gmail.com',
        nullable: false
    })
    @IsString()
    @IsEmail()
    @IsLowercase()
    email: string;

    @ApiProperty({
        example: 'Abc123',
        nullable: false
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({
        example: 'Alejandro Castillo',
        nullable: false
    })
    @IsString()
    @IsNotEmpty()
    fullName: string;

}

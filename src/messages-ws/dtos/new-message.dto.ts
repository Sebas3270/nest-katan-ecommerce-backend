import { IsNotEmpty, IsString } from "class-validator";

export class NewMessageDto{

    constructor(){}

    @IsString()
    @IsNotEmpty()
    message: string;
}
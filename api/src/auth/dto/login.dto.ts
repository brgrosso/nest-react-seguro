import { IsEmail, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @MinLength(1)
  @MaxLength(72)
  password!: string;
}

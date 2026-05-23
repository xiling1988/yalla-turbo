import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role, IntendedRole, AccountStatus } from 'src/common/database/prisma-client';

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(IntendedRole)
  intendedRole?: IntendedRole;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class ProductItemDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsNumber()
  target_commission: number;
}

export class InvitationGroup {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsBoolean()
  autoAprove: boolean;

  // @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
  @IsNotEmpty()
  @IsString()
  endTime: string;
}

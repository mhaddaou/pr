import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BrandEnum } from '../enums/brand.enum';

enum CreatorAgencyEnum {
  ALL = 'All',
  MANAGED = 'Managed By agency',
  INDEPENDENT = 'Independent creators',
}
enum ContentTypeEnum {
  ALL = 'All',
  VIDEO = 'Video',
  LIVE = 'LIVE',
}

enum EstPostRateEnum {
  ALL = 'All',
  OK = 'Ok',
  BETTER = 'Better',
  GOOD = 'Good',
}

enum FollowerGenderEnum {
  ALL = 'All',
  Female = 'Female',
  Male = 'Male',
}
enum FollowerAgeEnum {  
  AGE_18_24 = '18 - 24',  
  AGE_25_34 = '25 - 34',  
  AGE_35_44 = '35 - 44',  
  AGE_45_54 = '45 - 54',  
  AGE_55_PLUS = '55+',  
} 
enum GMVEnum {  
  GMV_0_100 = '0 - 100',  
  GMV_100_1K = '100 - 1k',  
  GMV_1K_10K = '1k - 10k',  
  GMV_10K_PLUS = '10k+',  
} 
enum UnitsSoldEnum {  
  UNIT_0_10 = '0 - 10',  
  UNIT_10_100 = '10 - 100',  
  UNIT_100_1K = '100 - 1k',  
  UNIT_1K_PLUS = '1k+',  
}

enum AvgCommissionEnum {
  NO = 'No threshold',
  LESSTHAN20 = 'less than 20%',
  LESSTHAN15 = 'less than 15%',
  LESSTHAN10 = 'less than 10%',
  LESSTHAN5 = 'less than 5%',
}

export enum Categories {
  muslimFashion = 'muslimFashion',
  shoes = 'shoes',
  beautyAndPersonalCare = 'beautyAndPersonalCare',
  phonesAndElevtronics = 'phonesAndElevtronics',
  computersAndOfficeEquipment = 'computersAndOfficeEquipment',
  petSupplies = 'petSupplies',
  babyAndMaternity = 'babyAndMaternity',
  sportsAndOutdoor = 'sportsAndOutdoor',
  toysAndHobbies = 'toysAndHobbies',
  furniture = 'furniture',
  toolsAndHardware = 'toolsAndHardware',
  homeImprovement = 'homeImprovement',
  automotiveAndMotorcycle = 'automotiveAndMotorcycle',
  fashionAccessories = 'fashionAccessories',
  foodAndBeverages = 'foodAndBeverages',
  health = 'health',
  booksMagazinesAndAudio = 'booksMagazinesAndAudio',
}

@ValidatorConstraint({ name: 'isMinLessThanMax', async: false })
class IsMinLessThanMax implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as FollowersCountDto;
    return obj.min < obj.max;
  }

  defaultMessage(args: ValidationArguments) {
    return `min (${(args.object as any).min}) must be less than max (${(args.object as any).max})`;
  }
}

class FollowersCountDto {
  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(1)
  max: number;

  @Validate(IsMinLessThanMax)
  customValidation: boolean;
}

class Creators {
  @IsArray()
  @IsOptional()
  @IsEnum(Categories, {
    each: true,
    message: 'One or more categories are invalid.',
  })
  categories?: Categories[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FollowersCountDto)
  followersCount?: FollowersCountDto;

  @IsOptional()
  @IsEnum(CreatorAgencyEnum, {
    each: true,
    message: `createorAgency must be either "${CreatorAgencyEnum.ALL}", "${CreatorAgencyEnum.MANAGED}", or "${CreatorAgencyEnum.INDEPENDENT}"`,
  })
  createorAgency: CreatorAgencyEnum;

  @IsOptional()
  @IsBoolean({ message: '$property must be a boolean value (true or false)' })
  fastGrowing: boolean;

  @IsOptional()
  @IsBoolean({ message: '$property must be a boolean value (true or false)' })
  notInvitedInPast90Days : boolean

  @IsOptional()
  @IsEnum(AvgCommissionEnum, {
    each: true,
    message: `avgCommission must be either "${AvgCommissionEnum.NO}", "${AvgCommissionEnum.LESSTHAN20}", "${AvgCommissionEnum.LESSTHAN15}", "${AvgCommissionEnum.LESSTHAN10}", or "${AvgCommissionEnum.LESSTHAN5}"`,
  })
  avgCommission: AvgCommissionEnum;

  @IsOptional()
  @IsEnum(ContentTypeEnum, {
    each: true,
    message: `contentType must be either "${ContentTypeEnum.ALL}", "${ContentTypeEnum.VIDEO}", or "${ContentTypeEnum.LIVE}"`,
  })
  contentType : ContentTypeEnum


}

class Followers {
  @IsOptional()  
  @IsArray()  
  @IsEnum(FollowerAgeEnum, {  
    each: true,  
    message:  
      'Each followerAge must be one of the following values: "18 - 24", "25 - 34", "35 - 44", "45 - 54", "55+"',  
  })  
  followerAge: FollowerAgeEnum[];  

  @IsOptional()
  @IsEnum(FollowerGenderEnum, {
    each: true,
    message: `followerGender must be either "${FollowerGenderEnum.ALL}", "${FollowerGenderEnum.Female}", or "${FollowerGenderEnum.Male}"`,
  })
  followerGender: FollowerGenderEnum
}  

class Performance{
  @IsOptional()
  @IsArray()
  @IsEnum(GMVEnum, {
    each: true,
    message: `gmv must be either "${GMVEnum.GMV_0_100}", "${GMVEnum.GMV_100_1K}", "${GMVEnum.GMV_1K_10K}", or "${GMVEnum.GMV_10K_PLUS}"`,
    }) 
  gmv : GMVEnum[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  engagmenetRate : number;


  @IsOptional()
  @IsArray()
  @IsEnum(UnitsSoldEnum, {
    each: true,
    message: `unitsSold must be either "${UnitsSoldEnum.UNIT_0_10}", "${UnitsSoldEnum.UNIT_10_100}", "${UnitsSoldEnum.UNIT_100_1K}", or "${UnitsSoldEnum.UNIT_1K_PLUS}"`,
    })
  unitsSold : UnitsSoldEnum[]

  @IsOptional()
  @IsEnum(EstPostRateEnum, {
    each: true,
    message: `estPostRate must be either "${EstPostRateEnum.ALL}", "${EstPostRateEnum.BETTER}", "${EstPostRateEnum.OK}", or "${EstPostRateEnum.GOOD}"`,
    })
  estPostRate : EstPostRateEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  averageViewsPerVideo : number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  averageViewsPerLive : number;

  @IsOptional()
  @IsArray()
  @IsEnum(BrandEnum)
  brandCollaboration : BrandEnum[]





}


export class FiltersDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => Creators)
  creators?: Creators;

  @ValidateNested()
  @IsOptional()
  @Type(() => Followers)
  followers?: Followers;

  @ValidateNested()
  @IsOptional()
  @Type(() => Performance)
  performance?: Performance;
}



export class SendInvitationDto {
  @ValidateNested()
  @Type(() => FiltersDto)
  @IsOptional()
  filters?: FiltersDto;
}

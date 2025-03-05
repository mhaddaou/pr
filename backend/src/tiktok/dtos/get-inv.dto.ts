export enum StatusType {
    isDisabled = 'isDisabled',
    isEnabled = 'isEnabled',
    isReachedMax = 'isReachedMax',
    isNotFound = 'isNotFound',
  }
  
  export class GetInvDto {
    message: StatusType;
  }
  
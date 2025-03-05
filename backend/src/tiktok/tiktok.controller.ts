import { Body, Controller, Get, Post } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { InvitationGroup } from './dtos/invitation-group.dto';

@Controller('tiktok')
export class TiktokController {
  constructor(private readonly tiktokService: TiktokService) {}
  @Get()
  async checkIsWork() {
    return { message: 'is working ' };
  }

  @Post('automation')
  async automation(@Body() body: any) {
    const res = await this.tiktokService.automation(body);
    console.log(res);
    return res;
  }

  @Post('createProduct')
  async sendRequest(@Body() {cookie, invitationDetails} : {invitationDetails : InvitationGroup,cookie : string}){
    return await this.tiktokService.createInvitationRequest(invitationDetails, cookie);
  }

  @Post('getIds')
  async getIds(@Body() {cookie} : {cookie : string}){
    return await this.tiktokService.getIdsForCreateInv(cookie);
  }

  @Post('getProducts')
  async getProducts(@Body() {cookie} : {cookie : string}){
    return await this.tiktokService.getProducts(cookie);
  }

  // @Post('createProduct'){}
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

export class TopUpTokensDto {
  index: number;
  numberOfTokens: number;
}

export class BetsOrderDto {
  index: number;
  numberOfBets: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('check-state')
  checkState() {
    return this.appService.checkState();
  }

  @Post('open-bets')
  openBets(@Body() duration: number) {
    return this.appService.openBets(duration);
  }

  @Get('close-lottery')
  closeLottery() {
    return this.appService.closeLottery();
  }

  @Get('get-balance')
  getTokenBalance() {
    return this.appService.getTokenBalance();
  }

  @Post('topup-tokens')
  topUpTokens(@Body() topUp: TopUpTokensDto) {
    return this.appService.topUpTokens(topUp);
  }

  @Post('burn-tokens')
  burnTokens(@Body() tokensToBurn: TopUpTokensDto) {
    return this.appService.burnTokens(tokensToBurn);
  }

  @Post('place-bets')
  placeBets(@Body() betsOrderDto: BetsOrderDto) {
    return this.appService.placeBets(betsOrderDto);
  }

  @Post('withdraw')
  withdraw(@Body() tokens: number) {
    return this.appService.withdraw(tokens);
  }

  @Post('check-prize')
  checkPrize(@Body() accountIndex: number) {
    return this.appService.checkPrize(accountIndex);
  }
  //
  // @Get('allowance/:address/:owner/:spender')
  // async geAllowance(
  //   @Query('address') address: string,
  //   @Query('owner') owner: string,
  //   @Query('spender') spender: string,
  // ) {
  //   return await this.appService.getAllowance(address, owner, spender);
  // }
  //
  // @Post('claim-payment-order')
  // async claimPaymentOrder(@Body() body: ClaimPaymentOrderDTO) {
  //   return await this.appService.claimPaymentOrder(
  //     body.id,
  //     body.secret,
  //     body.address,
  //   );
  // }

}

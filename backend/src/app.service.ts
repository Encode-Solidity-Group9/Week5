import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as lotteryJson from './assets/Lottery.json';
import { BetsOrderDto, TopUpTokensDto } from './app.controller';

const TOKENIZED_LOTTERY_ADDRESS = '0xBDABC9564886E68D3d57faec9B2E8C53F12F612F';
const LOTTERY_CONTRACT_ADDRESS = '0x73A76b3f8Ff6A8614F175655e9cEC757fd76e6b2';

@Injectable()
export class AppService {
  provider;
  lotteryContract;

  constructor(private configService: ConfigService) {
    this.provider = ethers.getDefaultProvider('sepolia');
    this.lotteryContract = new ethers.Contract(
      LOTTERY_CONTRACT_ADDRESS,
      lotteryJson.abi,
      this.provider,
    );
  }

  async checkState() {
    return await this.lotteryContract.betsOpen;
  }

  async openBets(duration: number) {
    return await this.lotteryContract.openBets(duration);
  }

  async closeLottery() {
    return this.lotteryContract.closeBets();
  }

  async getTokenBalance(wallet: string) {
    return await this.lotteryContract.balanceOf(wallet);
  }

  async topUpTokens(topUp: TopUpTokensDto) {
    //should be taken from the FE and not be hardcoded here
    const privateKey = this.configService.get<string>('MNEMONICS');
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(this.provider);
    const tokenContract = new ethers.Contract(
      TOKENIZED_LOTTERY_ADDRESS,
      tokenJson.abi,
      signer,
    );
    const mintAmount = ethers.utils.parseEther('0.001');
    const transaction = await tokenContract.mint(
      topUp.indexAccount,
      mintAmount,
    );
    await transaction.wait();
    console.log(`transaction hash: ${transaction}`);
    return transaction.hash;
  }

  async burnTokens(tokensToBurn: TopUpTokensDto) {
    this.lotteryContract.burnTokens(tokensToBurn.numberOfTokens);
  }

  async placeBets(betsOrderDto: BetsOrderDto) {
    //todo check if customer has tokens and if not enough, buy the necessary amount
    //should be taken from the FE and not be hardcoded here
    const privateKey = this.configService.get<string>('MNEMONICS');
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(this.provider);
    const tokenContract = new ethers.Contract(
      TOKENIZED_LOTTERY_ADDRESS,
      tokenJson.abi,
      signer,
    );
    //todo calculate how many tokens the user needs to have to place a bet
    const mintAmount = ethers.utils.parseEther('0.001');
    const transaction = await tokenContract.mint(
      betsOrderDto.indexAccount,
      mintAmount,
    );
    //todo handle cases where the transaction has been canceled
    await transaction.wait();
    console.log(`transaction hash: ${transaction}`);
    //now that the user has token to use at the lottery, he/she could place a bet
    this.lotteryContract.betMany(betsOrderDto.numberOfBets);
  }

  async prizeWithdraw(tokens: number) {
    //should use the customer's wallet
    await this.lotteryContract.prizeWithdraw(tokens);
  }

  async checkPrize(accountIndex: number) {
    return await this.lotteryContract.prizePool;
  }
}

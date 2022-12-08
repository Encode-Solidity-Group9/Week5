import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import {BetsOrderDto, TopUpTokensDto} from "./app.controller";

export class PaymentOrderModel {
  id: number;
  secret: string;
  value: number;
}

const TOKENIZED_VOTES_ADDRESS = '0x0247081438196312861593684370827845';

@Injectable()
export class AppService {
  provider;
  paymentOrders: PaymentOrderModel[];

  constructor(private configService: ConfigService) {
    this.provider = ethers.getDefaultProvider('goerli');
    this.paymentOrders = [];
  }

  getHello(): string {
    return 'Hello World!';
  }

  getAnother(): string {
    return 'Another method';
  }

  getBlock(hash: string): Promise<ethers.providers.Block> {
    const providers = this.provider;
    return providers.getBlock(hash);
  }

  async getLastBlock(): Promise<ethers.providers.Block> {
    const providers = this.provider;
    return providers.getBlock('latest');
  }

  async getTotalSupply(address: string) {
    const contract = new ethers.Contract(address, tokenJson.abi, this.provider);
    const bigNumber = await contract.totalSupply();
    return ethers.utils.formatEther(bigNumber);
  }

  async getAllowance(address: string, owner: string, spender: string) {
    const contract = new ethers.Contract(address, tokenJson.abi, this.provider);
    const bigNumber = await contract.allowance(owner, spender);
    return ethers.utils.formatEther(bigNumber);
  }

  getPaymentOrder(id: string) {
    return { id: id, value: this.paymentOrders[id].value };
  }

  createPaymentOrder(secret: string, value: number) {
    const newPaymentOrder = new PaymentOrderModel();
    newPaymentOrder.secret = secret;
    newPaymentOrder.value = value;
    newPaymentOrder.id = this.paymentOrders.length;
    this.paymentOrders.push(newPaymentOrder);
    return newPaymentOrder.id;
  }

  async claimPaymentOrder(id: number, secret: string, address: string) {
    if (this.paymentOrders[id].secret != secret)
      throw new HttpException('Wrong secret!', 403);
    const seed = this.configService.get<string>('MNEMONIC');
    const contractAddress = this.configService.get<string>('MNEMONIC');
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const signer = wallet.connect(this.provider);
    const signedContract = new ethers.Contract(
      contractAddress,
      tokenJson.abi,
      signer,
    );
    const transaction = await signedContract.mint(
      address,
      ethers.utils.parseEther(this.paymentOrders[id].value.toString()),
    );
    return transaction.wait();
  }

  async claimTokens(address: string) {
    //build contract object
    //pick the signer using .env keys
    // connect the contract object to the signer
    // make the transaction to mint tokens
    //await the transaction, get the receipt, return the hash
    return { result: `transaction hash for tokens minted for ${address}` };
  }

  getTokenAddress() {
    return { result: TOKENIZED_VOTES_ADDRESS };
  }

  checkState() {}

  openBets(duration: number) {}

  closeLottery() {
    
  }

  getTokenBalance() {
    
  }

  topUpTokens(topUp: TopUpTokensDto) {
    
  }

  burnTokens(tokensToBurn: TopUpTokensDto) {
    
  }

  placeBets(betsOrderDto: BetsOrderDto) {
    
  }

  withdraw(tokens: number) {
    
  }

  checkPrize(accountIndex: number) {
    
  }
}

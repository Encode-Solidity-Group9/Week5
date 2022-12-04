import {Component} from '@angular/core';
import {ethers} from "ethers";
import tokenJson from '../assets/MyToken.json';

const TOKENIZED_VOTES_ADDRESS = "1x111111";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'Example-Title';
  myNumber = 42;
  lastBlockNumber: number | undefined;
  clicks = 0;
  wallet: ethers.Wallet | undefined;
  provider: ethers.providers.Provider;
  etherBalance: number | undefined;
  tokenBalance: number | undefined;
  votePower: number | undefined;
  tokenContract: ethers.Contract | undefined;
  minterWallet: ethers.Wallet;
  tokenAddress: string | undefined;
  http: any;

  constructor() {
    ethers
      .getDefaultProvider('goerli')
      .getBlock('latest')
      .then((block) => (this.lastBlockNumber = block.number));
    this.provider = ethers.providers.getDefaultProvider('goerli')
    this.minterWallet = ethers.Wallet.fromMnemonic("askjdfkjasdlkj")
  }

  countClicks(increment: string) {
    this.clicks += parseInt(increment);
  }

  createWallet() {
    this.http.get<any>("http://localhost:3000/token-address").subscribe((ans) => {
      this.tokenAddress = ans.result
      if (this.tokenAddress) {
        this.wallet = ethers.Wallet.createRandom().connect(this.provider)
        this.tokenContract = new ethers.Contract(
          TOKENIZED_VOTES_ADDRESS,
          tokenJson.abi,
          this.wallet
        )
        this.wallet.getBalance().then((balanceBN: ethers.BigNumberish) => {
          this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN))
        });
        this.tokenContract["balanceOf"](this.wallet.address).then(
          (balanceBN: ethers.BigNumberish) => {
            this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN))
          }
        )
      }
    })

  }

  claimTokens() {

  }

  connectBallot(address: string) {
    this.getBallotInfo()
  }

  delegate() {

  }

  castVote() {

  }

  getBallotInfo() {

  }
}

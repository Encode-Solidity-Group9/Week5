import { Component } from '@angular/core';
import { ethers } from 'ethers';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Bet and Win Promotion!';
  betsOpen = false;
  ETHbalance: string | undefined;
  wallet: ethers.Wallet | undefined;
  etherBalance: number | undefined;
  http: HttpClient;
  provider: ethers.providers.Provider;
  state: boolean | undefined;
  lotteryState = 'closed';
  closingTimeDate: Date | undefined;
  lotteryAddress: string | undefined;
  tokenBalance: string | undefined;
  betTxAddress: string | undefined;
  closedTxAddress: string | undefined;
  betPrize: string | undefined;
  betPrizeAccount: string | undefined;
  withdrawalTxHash: string | undefined;
  burnTokensTxHash: string | undefined;

  constructor(http: HttpClient) {
    this.http = http;
    //this.wallet = ethers.Wallet.fromMnemonic(environment.mnemonic); // This is to come from backend somehow, put mnemonic in environment file
    this.provider = ethers.providers.getDefaultProvider('goerli');
  }

  checkState() {
    this.http.get<any>('http://localhost:3000/check-state').subscribe((ans) => {
      this.state = ans.result;
      if (this.state) {
        this.lotteryState = 'open';
        this.closingTimeDate = ans.result.closingTimeDate;
        this.betsOpen = true;
      } else {
        this.lotteryState = 'closed';
        this.closingTimeDate = undefined;
        this.betsOpen = false;
      }
    });
  }

  openBets() {
    const duration = prompt('How long should bets be open for? (in seconds)');
    if (duration) {
      this.http
        .post<any>('http:localhost:3000/open-bets', { duration: duration })
        .subscribe((ans) => {
          this.lotteryAddress = ans;
          if (this.lotteryAddress) {
            this.checkState();
            setTimeout(() => this.closeBets(), parseInt(duration as string));
          } else {
            alert(
              "Oops, it's not you, it's us. Most likely bets are already open, please check the state!"
            );
          }
        });
    } else {
      alert('A valid duration (in seconds) is required to open bets.');
    }
  }

  closeBets() {
    this.http.get<any>('http://localhost/close-lottery').subscribe((ans) => {
      this.closedTxAddress = ans.result;
      if (this.closedTxAddress) {
        alert('Bets successfully closed!');
        this.checkState();
      }
    });
  }

  topUpAccount(index: number) {
    const indexAccount = prompt('WHich account index do you want to use?');
    const numberOfTokens = prompt('Buy how many tokens?');
    this.http
      .post<any>('http://localhost:3000/topup-tokens', {
        index: indexAccount,
        numberOfTokens: numberOfTokens,
      })
      .subscribe((ans) => {
        this.tokenBalance = ans.result;
      });
  }

  placeBets() {
    const accountIndex = prompt('Which account (index) do you want to use?');
    const numberOfBets = prompt('Bet how many times?');
    this.http
        .post<any>('http://localhost:3000/place-bets', {
        index: accountIndex,
        numberOfBets: numberOfBets,
      })
      .subscribe((ans) => {
        if (ans.result) {
          this.tokenBalance = ans.result.tokenBalance;
          this.betTxAddress = ans.result.betTxAddress;
        } else {
          alert('Oops, there was an error! Check your token balance.');
        }
      });
  }

  checkPrize() {
    const accountIndex = prompt('Which account (index) do you want to use?');
    this.http
      .post<any>('http://localhost/check-prize', { index: accountIndex })
      .subscribe((ans) => {
        this.betPrize = ans.result.prize;
        this.betPrizeAccount = ans.result.betPrizeAccount;
      });
  }

  withdraw() {
    const numberOfTokens = prompt('How many tokens to withdraw?');
    this.http.post<any>('http://localhost:3000/withdraw', { tokens: numberOfTokens})
    .subscribe((ans) => {
      if (ans) {
        this.withdrawalTxHash = ans.transactionHash;
        this.checkTokenBalance();
      }
    })
  }

  checkTokenBalance() {
    this.http.get<any>('http://localhost:3000/get-balance')
    .subscribe((ans) => {
      this.tokenBalance = ans.balance;
    })
  }

  burnTokens() {
    const accountIndex = prompt('Which account (index) do you want to use?');
    const numberOfTokens = prompt('Burn how many tokens?');
    this.http
      .post<any>('http://localhost:3000/burn-tokens', {index: accountIndex, tokens: numberOfTokens})
      .subscribe((ans) => {
        this.burnTokensTxHash = ans.transactionHash;
      });
  }
}

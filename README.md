# Web3 Raffle Game

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Zheng-Zuo/web3_raffle)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Zheng-Zuo/web3_raffle/pulls)

The Web3 Raffle Game is a blockchain-based implementation using Chainlink's VRF to generate verifiable true random numbers. It employs Chainlink automation for automatically sending ETH to winners at the end of each draw. The project involved extensive work with Hardhat plugins, deploying mocks, and conducting thorough unit testing to ensure the smart contract's robustness and reliability.

Check out the **[Live Demo here](http://raffle.momocoder.com)** *(Note: Please refrain from buying a large amount of tickets in a single round on the live demo because the owner only has a limited amount of test LINK deposited in Chainlink's subscription account. This account is used for sending out ETH to the winner automatically at the end of each game. If the amount is too large, the gas fee will increase and potentially fail to trigger the send function on Chainlink automation)*. The project is deployed on the Sepolia testnet, hence you need to connect with Sepolia to interact with the contract.

## Features
- Fully responsive design compatible across all devices.
- Incorporates two sub-repositories:
    1. `hardhat` - Contains all the smart contract related code, .sol files, deployment scripts, and unit tests.
    2. `src` - Houses the Nextjs 14 front-end files.

Each sub-repository contains its own `package.json` file, which necessitates separate installations.

## Quick Start

To get this project up and running:

1. Clone the repository:

    ```bash
    git clone https://github.com/Zheng-Zuo/web3_raffle.git
    cd web3_raffle
    ```

2. Navigate into each sub-repository (`hardhat` and `src`) and install their respective dependencies:

    ```bash
    cd hardhat
    npm install

    cd ../src
    npm install
    ```

3. Create a `.env` file at each sub-repo level and add your own credentials.

4. For development mode, start the project with:

    ```bash
    npm run dev
    ```
    
   For a production-like environment, build and start the project with:

    ```bash
    npm run build
    npm start
    ```

## Contribute

We welcome all contributors who are interested in improving the Web3 Raffle Game. Feel free to submit a pull request.

## License

This project is licensed under the terms of the MIT license.
'use client';

import * as React from 'react';
import {
    RainbowKitProvider,
    getDefaultWallets,
    connectorsForWallets,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    hardhat,
    sepolia,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const alchemy_key = process.env.NEXT_PUBLIC_ALCHEMY_ID
if (!alchemy_key) {
    throw new Error(
        'Alchemy key is not defined'
    );
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        zora,
        hardhat,
    ],
    [
        alchemyProvider({ apiKey: alchemy_key }),
        publicProvider()
    ]
);

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
    throw new Error(
        'Project ID is not defined'
    );
}

const { wallets } = getDefaultWallets({
    appName: 'web3 Raffle',
    projectId,
    chains,
});

const demoAppInfo = {
    appName: 'web3 Raffle',
};

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: 'Other',
        wallets: [
            argentWallet({ projectId, chains }),
            trustWallet({ projectId, chains }),
            ledgerWallet({ projectId, chains }),
        ],
    },
]);

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export function RainbowProviders({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider
                theme={darkTheme({
                    accentColor: '#0A1F1C',
                    accentColorForeground: 'white',
                    // borderRadius: 'small',
                    fontStack: 'system',
                    // overlayBlur: 'small',
                })}
                chains={chains}
                appInfo={demoAppInfo}>
                {mounted && children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
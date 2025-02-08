'use client';

import { Card, CardHeader, CardBody } from '@nextui-org/card';
import Image from 'next/image';
import { MarketInfoBlockCompact } from '@/components/common/MarketInfoBlock';
import { Spinner } from '@/components/common/Spinner';
import Header from '@/components/layout/header/Header';
import { useMarkets } from '@/contexts/MarketsContext';
import { useVault } from '@/hooks/useVault';
import { formatBalance } from '@/utils/balance';
import { findToken } from '@/utils/tokens';
import { useUserBalances } from '@/hooks/useUserBalances';
import Input from '@/components/Input/Input';
import { Button } from '@/components/common/Button';
import { useState } from 'react';
import { useDepositVault } from '@/hooks/useDepositVault';
import { useLogStream, LogEntry } from '@/hooks/useLogStream';
import { format } from 'date-fns';

const USDC = {
  symbol: 'USDC',
  img: require('../../src/imgs/tokens/usdc.webp') as string,
  decimals: 6,
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
};

const vaultAddress = '0x346aac1e83239db6a6cb760e95e13258ad3d1a6d';

function VaultInfoCard({ vault, vaultToken }: { vault: any; vaultToken: any }) {
  const { markets } = useMarkets();

  return (
    <Card className="bg-surface h-[600px] p-4">
      <CardHeader className="text-lg">Vault Overview</CardHeader>
      <CardBody className="space-y-6">
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Asset:</span>
            <div className="flex items-center">
              {vaultToken?.img && (
                <Image
                  src={vaultToken.img}
                  alt={vaultToken.symbol}
                  width={20}
                  height={20}
                  className="mr-2"
                />
              )}
              <span>{vaultToken?.symbol}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Total Deposits:</span>
            <span>
              {formatBalance(BigInt(vault.state.totalAssets), vault.asset.decimals)} {vaultToken?.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Current APY:</span>
            <span>{(vault.state.apy * 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">All-time APY:</span>
            <span>{(vault.state.allTimeApy * 100).toFixed(2)}%</span>
          </div>
        </div>

        {markets && vault.state.allocation.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Current Allocations</h3>
            {vault.state.allocation.map((allocation: any) => {
              const market = markets.find((m) => m.uniqueKey === allocation.market.uniqueKey);
              if (!market || allocation.supplyAssets === 0) return null;

              return (
                <MarketInfoBlockCompact
                  key={allocation.market.uniqueKey}
                  market={market}
                  amount={BigInt(allocation.supplyAssets)}
                />
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function LogMessage({ log }: { log: LogEntry }) {
  const categoryColors = {
    event: 'text-blue-500',
    think: 'text-purple-500',
    speak: 'text-green-500',
    memory: 'text-yellow-500',
    action: 'text-orange-500',
    error: 'text-red-500',
  };

  return (
    <div className="border-b border-gray-100 pb-2 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${categoryColors[log.category]}`}>
          {log.category.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">
          {format(new Date(log.timestamp), 'HH:mm:ss')}
        </span>
      </div>
      <div className="mt-1">
        <span className="text-sm font-medium">{log.topic}</span>
        <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
      </div>
    </div>
  );
}

function ActivityFeed() {
  const { logs, isConnected, error } = useLogStream();

  return (
    <Card className="bg-surface h-[600px] p-4">
      <CardHeader className="flex items-center justify-between text-lg">
        <span>Activity Feed</span>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : (
          <div className="custom-scrollbar h-[500px] space-y-4 overflow-y-auto px-4">
            {logs.length === 0 ? (
              <div className="text-sm text-gray-500">Waiting for activity...</div>
            ) : (
              logs
                .slice()
                .reverse()
                .map((log, index) => <LogMessage key={log.timestamp + index} log={log} />)
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function DepositCard() {
  const { balances } = useUserBalances();
  const usdcBalance = BigInt(
    balances.find((b) => b.address.toLowerCase() === USDC.address.toLowerCase())?.balance || 0n
  );

  const [depositAmount, setDepositAmount] = useState<bigint>(0n);
  const [message, setMessage] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  const { deposit, isDepositing } = useDepositVault(
    USDC.address as `0x${string}`,
    vaultAddress as `0x${string}`,
    depositAmount,
    message
  );

  return (
    <Card className="bg-surface h-[600px] p-4">
      <CardHeader className="text-lg">Deposit</CardHeader>
      <CardBody>
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Balance:</span>
            <span>
              {usdcBalance ? formatBalance(usdcBalance, USDC.decimals) : '0'} {USDC.symbol}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500">Amount</label>
            <Input
              decimals={USDC.decimals}
              max={usdcBalance || 0n}
              setValue={setDepositAmount}
              setError={setInputError}
              exceedMaxErrMessage="Insufficient Balance"
            />
            {inputError && <p className="text-xs text-red-500">{inputError}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500">Message (optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message"
              className="bg-hovered h-10 w-full rounded p-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <Button
            variant="cta"
            className="w-full"
            disabled={isDepositing || depositAmount === 0n || !!inputError}
            onClick={deposit}
          >
            {isDepositing ? 'Depositing...' : 'Deposit'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function VaultContent() {
  const { data: vault, isLoading: isVaultLoading, error: vaultError } = useVault(vaultAddress);

  if (isVaultLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (vaultError) {
    return <div className="text-center text-red-500">Error: {(vaultError as Error).message}</div>;
  }

  if (!vault) {
    return <div className="text-center">Vault data not available</div>;
  }

  const vaultToken = findToken(vault.asset.id, 8453);

  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-8 font-zen">
        <h1 className="mb-12 text-center text-2xl">WoWo Vault</h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Vault Info */}
          <div className="col-span-3">
            <VaultInfoCard vault={vault} vaultToken={vaultToken} />
          </div>

          {/* Middle Column - Activity Feed */}
          <div className="col-span-6">
            <ActivityFeed />
          </div>

          {/* Right Column - Deposit Box */}
          <div className="col-span-3">
            <DepositCard />
          </div>
        </div>
      </div>
    </>
  );
}

export default VaultContent;

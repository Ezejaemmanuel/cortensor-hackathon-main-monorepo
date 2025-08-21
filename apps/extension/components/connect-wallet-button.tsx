"use client";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ConnectWalletButtonProps {
  onModalOpen?: () => void;
  className?: string;
  isMobile?: boolean;
}

export const ConnectWalletButton = ({ onModalOpen, className = "", isMobile = false }: ConnectWalletButtonProps) => {
  return (
    <div className={`connect-button-wrapper${isMobile ? '-mobile' : ''} ${className}`}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button 
                      onClick={() => {
                        openConnectModal();
                        onModalOpen?.();
                      }} 
                      className={`${isMobile ? 'w-full ' : ''}bg-gradient-primary hover:opacity-90 glow-primary transition-all duration-200 font-medium`}
                    >
                      Connect Wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button 
                      onClick={() => {
                        openChainModal();
                        onModalOpen?.();
                      }} 
                      variant="destructive"
                      className={`${isMobile ? 'w-full ' : ''}animate-pulse`}
                    >
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-2'}`}>
                    <Button
                      onClick={() => {
                        openChainModal();
                        onModalOpen?.();
                      }}
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      className={`${isMobile ? 'w-full ' : ''}border-primary/20 hover:border-primary/40 transition-colors`}
                    >
                      <div className={`flex items-center ${isMobile ? 'justify-center' : ''}`}>
                        {chain.hasIcon && (
                          <div className="w-4 h-4 mr-2">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </div>
                    </Button>

                    <Button
                      onClick={() => {
                        openAccountModal();
                        onModalOpen?.();
                      }}
                      className={`${isMobile ? 'w-full ' : ''}bg-gradient-primary hover:opacity-90 glow-primary transition-all duration-200`}
                    >
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
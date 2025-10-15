import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import { TARGET_CHAIN_ID } from "../utils/constants.js";

export default function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask não encontrada. Instale a extensão para continuar.");
    }

    setIsConnecting(true);
    try {
      const browserProvider = new BrowserProvider(window.ethereum, "any");
      await browserProvider.send("eth_requestAccounts", []);

      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);
      setChainId(Number(network.chainId));
      setError(null);

      return { address, network };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const ensureCorrectNetwork = useCallback(async () => {
    if (!provider) {
      await connectWallet();
    }

    const activeProvider = provider || new BrowserProvider(window.ethereum, "any");
    const network = await activeProvider.getNetwork();
    const currentChainId = Number(network.chainId);

    if (currentChainId === TARGET_CHAIN_ID) {
      setChainId(currentChainId);
      return true;
    }

    try {
      await activeProvider.send("wallet_switchEthereumChain", [
        { chainId: ethers.toBeHex(TARGET_CHAIN_ID) }
      ]);
      setChainId(TARGET_CHAIN_ID);
      return true;
    } catch (switchError) {
      setError(switchError);
      return false;
    }
  }, [provider, connectWallet]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        return;
      }
      setAccount(accounts[0]);
      if (provider) {
        const signerInstance = await provider.getSigner();
        setSigner(signerInstance);
      }
    };

    const handleChainChanged = (hexChainId) => {
      setChainId(Number(hexChainId));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [provider]);

  return {
    account,
    chainId,
    provider,
    signer,
    isConnecting,
    error,
    connectWallet,
    ensureCorrectNetwork
  };
}

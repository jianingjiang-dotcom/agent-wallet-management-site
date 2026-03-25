export interface Chain {
  id: string;
  name: string;
  shortName: string;
  chainId?: number;
  explorerUrl: string;
  explorerTxPath: string;
  color: string;
  parentChain: string; // maps to WalletAddress.chain ('EVM' | 'SOL')
  logo: string; // inline SVG string
}

export const CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    shortName: 'ETH',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    explorerTxPath: '/tx/',
    color: '#627EEA',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#627EEA"/><path d="M12 3v6.652l5.625 2.512L12 3z" fill="#fff" fill-opacity=".6"/><path d="M12 3L6.375 12.164 12 9.652V3z" fill="#fff"/><path d="M12 16.476v4.52l5.63-7.784L12 16.476z" fill="#fff" fill-opacity=".6"/><path d="M12 20.997v-4.52l-5.625-3.264L12 20.997z" fill="#fff"/><path d="M12 15.43l5.625-3.266L12 9.652v5.779z" fill="#fff" fill-opacity=".2"/><path d="M6.375 12.164L12 15.43V9.652l-5.625 2.512z" fill="#fff" fill-opacity=".6"/></svg>`,
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    shortName: 'BSC',
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    explorerTxPath: '/tx/',
    color: '#F0B90B',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#F0B90B"/><path d="M12 5.5l2.47 2.47-1.44 1.44L12 8.38l-1.03 1.03-1.44-1.44L12 5.5zm-4.5 4.5l1.44-1.44 1.44 1.44-1.44 1.44L7.5 10zm9 0l1.44-1.44 1.44 1.44-1.44 1.44L16.5 10zM12 10.97l1.03 1.03L12 13.03l-1.03-1.03L12 10.97zm-4.5 1.03l1.44-1.44 1.44 1.44-1.44 1.44L7.5 12zm9 0l1.44-1.44 1.44 1.44-1.44 1.44L16.5 12zM12 14.5l2.47 2.47-1.44 1.44L12 17.38l-1.03 1.03-1.44-1.44L12 14.5z" fill="#fff"/></svg>`,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    shortName: 'Polygon',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    explorerTxPath: '/tx/',
    color: '#8247E5',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#8247E5"/><path d="M15.5 9.88c-.25-.15-.58-.15-.83 0l-1.95 1.15-1.32.75-1.95 1.15c-.25.15-.58.15-.83 0l-1.55-.9c-.25-.15-.42-.42-.42-.72V9.46c0-.3.15-.57.42-.72l1.52-.88c.25-.15.58-.15.83 0l1.52.88c.25.15.42.42.42.72v1.15l1.32-.78v-1.15c0-.3-.15-.57-.42-.72l-2.82-1.65c-.25-.15-.58-.15-.83 0l-2.88 1.65c-.27.15-.42.42-.42.72v3.3c0 .3.15.57.42.72l2.85 1.65c.25.15.58.15.83 0l1.95-1.13 1.32-.78 1.95-1.13c.25-.15.58-.15.83 0l1.52.88c.25.15.42.42.42.72v1.85c0 .3-.15.57-.42.72l-1.5.88c-.25.15-.58.15-.83 0l-1.52-.88c-.25-.15-.42-.42-.42-.72v-1.12l-1.32.78v1.15c0 .3.15.57.42.72l2.85 1.65c.25.15.58.15.83 0l2.85-1.65c.25-.15.42-.42.42-.72v-3.3c0-.3-.15-.57-.42-.72L15.5 9.88z" fill="#fff"/></svg>`,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    shortName: 'Arbitrum',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    explorerTxPath: '/tx/',
    color: '#28A0F0',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#28A0F0"/><path d="M13.5 7.5l3.5 6.1-1.8 1-2.7-4.7-3.3 5.7-1.7-1L11.7 7h1.8v.5z" fill="#fff"/><path d="M15.2 14.6l1.8-1 1.5 2.6-1.8 1-1.5-2.6z" fill="#fff"/></svg>`,
  },
  {
    id: 'solana',
    name: 'Solana',
    shortName: 'SOL',
    explorerUrl: 'https://solscan.io',
    explorerTxPath: '/tx/',
    color: '#9945FF',
    parentChain: 'SOL',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#000"/><linearGradient id="sol-g" x1="5" y1="18" x2="19" y2="6" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/></linearGradient><path d="M7.2 15.5c.1-.1.2-.15.35-.15h9.85c.22 0 .33.27.17.42l-1.97 1.97c-.1.1-.24.15-.38.15H5.4c-.22 0-.33-.27-.17-.42l1.97-1.97zm0-4.8c.1-.1.24-.16.38-.16h9.82c.22 0 .33.27.17.43l-1.97 1.96c-.1.1-.24.16-.38.16H5.4c-.22 0-.33-.27-.17-.43L7.2 10.7zm9.6-3.2c-.1.1-.24.16-.38.16H6.6c-.22 0-.33-.27-.17-.43l1.97-1.96c.1-.1.24-.16.38-.16h9.82c.22 0 .33.27.17.43L16.8 7.5z" fill="url(#sol-g)"/></svg>`,
  },
];

const chainMap = new Map(CHAINS.map(c => [c.id, c]));

export function getChainById(chainId: string): Chain | undefined {
  return chainMap.get(chainId);
}

export function getChainsByParent(parentChain: string): Chain[] {
  return CHAINS.filter(c => c.parentChain === parentChain);
}

export function getExplorerTxUrl(chainId: string, txHash: string): string {
  const chain = getChainById(chainId);
  if (!chain) return '#';
  return `${chain.explorerUrl}${chain.explorerTxPath}${txHash}`;
}

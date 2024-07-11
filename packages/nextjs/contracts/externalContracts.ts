import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
// const externalContracts = {} as const;

// export default externalContracts satisfies GenericContractsDeclaration;

interface ContractInfo {
  address: string;
  abi: any[];
}

interface ExternalContracts {
  [chainId: string]: {
    [contractName: string]: ContractInfo;
  };
}

const loadContractsFromStorage = (): ExternalContracts => {
  if (typeof window === "undefined") return {}; // For server-side rendering

  const savedInfo = localStorage.getItem("contractInfo");
  if (!savedInfo) return {};

  try {
    const { chainId, contractName, address, abi } = JSON.parse(savedInfo);
    return {
      [chainId]: {
        [contractName]: {
          address,
          abi: JSON.parse(abi),
        },
      },
    };
  } catch (error) {
    console.error("Error parsing saved contract info:", error);
    return {};
  }
};

const externalContracts: ExternalContracts = loadContractsFromStorage();

export default externalContracts as GenericContractsDeclaration;

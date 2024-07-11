"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { BarsArrowUpIcon } from "@heroicons/react/20/solid";
import { ContractUI } from "~~/app/debug/_components/contract";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

const selectedContractStorageKey = "scaffoldEth2.selectedContract";

interface ContractInfo {
  chainId: string;
  contractName: string;
  address: string;
  abi: string;
}

export function DebugContracts() {
  const [isClient, setIsClient] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contractsData, setContractsData] = useState(() => getAllContracts());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contractNames, setContractNames] = useState<ContractName[]>(
    () => Object.keys(contractsData) as ContractName[],
  );

  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
    { initializeWithValue: false },
  );

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [selectedContract, setSelectedContract, contractNames]);

  const [contractInfo, setContractInfo] = useState<ContractInfo>({
    chainId: "",
    contractName: "",
    address: "",
    abi: "",
  });

  useEffect(() => {
    const savedInfo = localStorage.getItem("contractInfo");
    if (savedInfo) {
      setContractInfo(JSON.parse(savedInfo));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContractInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAbiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setContractInfo(prev => ({ ...prev, abi: JSON.stringify(json) }));
        } catch (error) {
          console.error("Invalid JSON file", error);
          alert("Invalid JSON file. Please upload a valid ABI JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("contractInfo", JSON.stringify(contractInfo));
    alert("Contract information saved!");
    window.location.reload();
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading indicator
  }

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      {contractNames.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <p className="text-3xl font-bold text-center mb-8 ">No contracts found!</p>

          <div className="bg-base-100 shadow-lg rounded-lg overflow-hidden">
            <h2 className="text-2xl font-bold text-center py-4 bg-base-300">Debug Contract</h2>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="chainId" className="block text-sm font-medium mb-1">
                    Chain ID
                  </label>
                  <input
                    id="chainId"
                    name="chainId"
                    value={contractInfo.chainId}
                    onChange={handleInputChange}
                    placeholder="Enter Chain ID"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-base-300 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="contractName" className="block text-sm font-medium mb-1">
                    Contract Name
                  </label>
                  <input
                    id="contractName"
                    name="contractName"
                    value={contractInfo.contractName}
                    onChange={handleInputChange}
                    placeholder="Enter Contract Name"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-base-300 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Contract Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={contractInfo.address}
                    onChange={handleInputChange}
                    placeholder="Enter Contract Address"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-base-300 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="abi-upload" className="block text-sm font-medium mb-1">
                    Upload ABI JSON file:
                  </label>
                  <input
                    id="abi-upload"
                    type="file"
                    accept=".json"
                    onChange={handleAbiFileUpload}
                    required
                    className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  />
                </div>
                {contractInfo.abi && (
                  <p className="text-sm text-green-600 font-medium">ABI file uploaded successfully.</p>
                )}
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Contract Information
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          {contractNames.length > 1 && (
            <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
              {contractNames.map(contractName => (
                <button
                  className={`btn btn-secondary btn-sm font-light hover:border-transparent ${
                    contractName === selectedContract
                      ? "bg-base-300 hover:bg-base-300 no-animation"
                      : "bg-base-100 hover:bg-secondary"
                  }`}
                  key={contractName}
                  onClick={() => setSelectedContract(contractName)}
                >
                  {contractName}
                  {contractsData[contractName].external && (
                    <span className="tooltip tooltip-top tooltip-accent" data-tip="External contract">
                      <BarsArrowUpIcon className="h-4 w-4 cursor-pointer" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {contractNames.map(contractName => (
            <ContractUI
              key={contractName}
              contractName={contractName}
              className={contractName === selectedContract ? "" : "hidden"}
            />
          ))}
        </>
      )}
    </div>
  );
}

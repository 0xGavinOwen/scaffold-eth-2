"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { Abi, AbiFunction } from "viem";
import { useAccount } from "wagmi";
import { type BaseError, useDeployContract, usePublicClient, useWaitForTransactionReceipt } from "wagmi";
import { BugAntIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  // Helper functions
  function formatBytecode(bytecode: string): `0x${string}` {
    if (!bytecode.startsWith("0x")) {
      return `0x${bytecode}` as `0x${string}`;
    }
    return bytecode as `0x${string}`;
  }

  function isValidBytecode(bytecode: string): boolean {
    const hexRegex = /^(0x)?[0-9A-Fa-f]+$/;
    return hexRegex.test(bytecode);
  }

  const { data: hash, error, isPending, deployContract } = useDeployContract();
  const publicClient = usePublicClient();
  const [contractAddress, setContractAddress] = useState("");
  const [userBytecode, setUserBytecode] = useState("");
  const [abiFile, setAbiFile] = useState<File | null>(null);
  const [parsedAbi, setParsedAbi] = useState<Abi | null>(null);
  const [constructorArgs, setConstructorArgs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    async function getContractAddress() {
      if (isConfirmed && hash && publicClient) {
        // Add check for publicClient
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash });
          if (receipt.contractAddress) {
            setContractAddress(receipt.contractAddress);
          } else if (receipt.status === "success") {
            const tx = await publicClient.getTransaction({ hash });
            const creates = (tx as any).creates;
            if (creates) {
              setContractAddress(creates);
            }
          }
        } catch (error) {
          console.error("Error getting contract address:", error);
        }
      }
    }

    getContractAddress();
  }, [isConfirmed, hash, publicClient]);

  const handleAbiFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAbiFile(file);
      try {
        const abiContent = await file.text();
        const parsedAbi = JSON.parse(abiContent) as Abi;
        setParsedAbi(parsedAbi);

        // Reset constructor args when new ABI is loaded
        setConstructorArgs([]);
      } catch (error) {
        console.error("Error parsing ABI file", error);
      }
    }
  };

  const getConstructorInputs = () => {
    if (!parsedAbi) return null;
    const constructorAbi = parsedAbi.find((item): item is AbiFunction => item.type === "constructor");
    return constructorAbi?.inputs || [];
  };

  const handleConstructorArgChange = (index: number, value: string) => {
    const newArgs = [...constructorArgs];
    newArgs[index] = value;
    setConstructorArgs(newArgs);
  };

  const handleDeploy = async () => {
    if (!parsedAbi) {
      console.error("Please upload an ABI file");
      return;
    }

    if (!isValidBytecode(userBytecode)) {
      console.error("Invalid bytecode format");
      return;
    }

    try {
      const formattedBytecode = formatBytecode(userBytecode);
      console.log("Deploying bytecode:", formattedBytecode);
      console.log("Constructor args:", constructorArgs);

      deployContract({
        abi: parsedAbi,
        bytecode: formattedBytecode,
        args: constructorArgs, // Use the constructor arguments
      });
    } catch (error) {
      console.error("Error deploying contract", error);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          {/* <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p> */}
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            {/* <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div> */}
          </div>

          <br />

          <div className="max-w-2xl mx-auto bg-base-100 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-bold mb-4">Deploy Contract</h2>

              <div className="mb-4">
                <label className="block  text-sm font-bold mb-2" htmlFor="abi-file">
                  Upload ABI JSON file
                </label>
                <input
                  id="abi-file"
                  type="file"
                  accept=".json"
                  onChange={handleAbiFileChange}
                  ref={fileInputRef}
                  className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
                />
                {abiFile && <p className="mt-2 text-sm ">ABI File: {abiFile.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block  text-sm font-bold mb-2" htmlFor="bytecode">
                  Bytecode
                </label>
                <textarea
                  id="bytecode"
                  placeholder="Enter bytecode"
                  value={userBytecode}
                  onChange={e => setUserBytecode(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-base-300 "
                  rows={4}
                />
              </div>

              {getConstructorInputs()?.map((input, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-bold mb-2" htmlFor={`constructor-${index}`}>
                    {input.name}
                  </label>
                  <input
                    id={`constructor-${index}`}
                    type="text"
                    placeholder={`(${input.type})`}
                    value={constructorArgs[index] || ""}
                    onChange={e => handleConstructorArgChange(index, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-base-300 "
                  />
                </div>
              ))}

              <div className="flex items-center justify-between">
                <button
                  onClick={handleDeploy}
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isPending}
                >
                  {isPending ? "Confirming..." : "Deploy Contract"}
                </button>
              </div>
            </div>

            {(hash || isConfirming || isConfirmed || error) && (
              <div className="px-6 py-4 bg-gray-100">
                {hash && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-bold">Transaction Hash:</span> {hash}
                  </p>
                )}
                {isConfirming && <p className="text-sm text-blue-600 mb-2">Waiting for confirmation...</p>}
                {isConfirmed && (
                  <div>
                    <p className="text-sm text-green-600 mb-2">Transaction confirmed.</p>
                    {contractAddress && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-bold">Contract deployed at:</span> {contractAddress}
                      </p>
                    )}
                  </div>
                )}
                {error && (
                  <p className="text-sm text-red-600 mb-2">
                    <span className="font-bold">Error:</span> {(error as BaseError).shortMessage || error.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

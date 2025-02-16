"use client";

import Chat from "@/components/Chat";
import { Sidebar } from "@/components/Sidebar";
import useRefreshIndex from '@/hooks/useRefreshIndex';
import useInitializeIndex from "@/hooks/useInitializeIndex";
import type { PineconeRecord } from "@pinecone-database/pinecone";
import React, { useEffect, useState } from "react";
import { FaGithub } from 'react-icons/fa';
import AppContext from "./appContext";
import { is } from "cheerio/lib/api/traversing";

const Page: React.FC = () => {
  const { isInitialized, initializeIndex, error } = useInitializeIndex();
  const [context, setContext] = useState<{ context: PineconeRecord[] }[] | null>(null);
  const { totalRecords, refreshIndex } = useRefreshIndex();

  useEffect(() => {
    if (!isInitialized) {
      initializeIndex();
    }
  }, [initializeIndex, isInitialized]);

  useEffect(() => {
    if (isInitialized && totalRecords === 0) {
      refreshIndex()
    }
  }, [isInitialized, refreshIndex, totalRecords])

  return (
    <AppContext.Provider value={{ totalRecords, refreshIndex }}>
      <div className="flex flex-col justify-between h-screen bg-whitemx-auto max-w-full">
        <div className="flex w-full flex-grow overflow-hidden relative">
          <div
            style={{
              backgroundColor: '#FBFBFC'
            }}
            className="absolute transform translate-x-full transition-transform duration-500 ease-in-out right-0 w-2/3 h-full bg-white overflow-y-auto lg:static lg:translate-x-0 lg:w-2/5"
          >
            <Sidebar />
          </div>
          <Chat setContext={setContext} context={context} />
        </div>
        <div className="fixed top-0 right-0 p-4">
          <a href="https://github.com/pinecone-io/pinecone-rag-demo" target="_blank" rel="noopener noreferrer">
            <FaGithub size={32} />
          </a>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default Page;


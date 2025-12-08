import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { GraphData, NodeData, LinkData } from '../../types';
import { INITIAL_DATA } from '../../constants';

interface DebugContextType {
  data: GraphData;
  setData: React.Dispatch<React.SetStateAction<GraphData>>;
  resetData: () => void;
  isDirty: boolean;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebugContext must be used within DebugProvider');
  }
  return context;
};

interface DebugProviderProps {
  children: ReactNode;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
  // Deep copy of INITIAL_DATA for in-memory editing
  const [data, setData] = useState<GraphData>(() => ({
    nodes: INITIAL_DATA.nodes.map(n => ({ ...n })),
    links: INITIAL_DATA.links.map(l => ({ ...l })),
    events: INITIAL_DATA.events ? INITIAL_DATA.events.map(e => ({ ...e })) : []
  }));

  // Track if data has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(INITIAL_DATA);
  }, [data]);

  const resetData = () => {
    setData({
      nodes: INITIAL_DATA.nodes.map(n => ({ ...n })),
      links: INITIAL_DATA.links.map(l => ({ ...l })),
      events: INITIAL_DATA.events ? INITIAL_DATA.events.map(e => ({ ...e })) : []
    });
  };

  return (
    <DebugContext.Provider value={{ data, setData, resetData, isDirty }}>
      {children}
    </DebugContext.Provider>
  );
};

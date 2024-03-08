import React, {useReducer, useMemo} from 'react';


export interface IGlobalContextProps {
  state: any,
  dispatch: React.Dispatch<Action>
}

interface Action {
  type?: string,
  payload?: any,
  isLoading?: boolean
}

export const GlobalContext = React.createContext<IGlobalContextProps>({} as any);

const initialize = {
  walletAddress: null
}

const reducer = (state: any , action: Action ) => {
  switch (action.type) {
    case "SET_WALLET_ADDRESS":
      return { ...state, walletAddress: action.payload }
    case "SET_IS_LOADING":
      return {...state, isLoading: action.payload }
    default:
      return state;
  }
};

const GlobalContextProvider: React.FC<React.PropsWithChildren<any>>= ({children}) => {
  const [state, dispatch] = useReducer(reducer,  initialize);

  const contextValue = useMemo(() => {
    return {state, dispatch}
  }, [state, dispatch])

  return (
    <>
      <GlobalContext.Provider value={contextValue}>
        {children}
      </GlobalContext.Provider>
    </>
  )
}

export default GlobalContextProvider;
import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { switchNetwork as switchNetworkAction } from "./actions";
import { ChainId } from "../../core/constants";

export function useNetwork() {
  const state = useSelector((state) => state.network);

  return state.network;
}

export function useSwitchProtocol() {
  const dispatch = useDispatch;
  const curretNetwork = useNetwork();

  const switchNetwork = useCallback(
    (network) => {
      dispatch(switchNetworkAction({ network }));
    },
    [dispatch]
  );
  return [curretNetwork, switchNetwork];
}

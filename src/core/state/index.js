import store from "../../state";

export function getNetwork() {
  const state = store.getState();

  return 336 || state.network.network;
}

import store from '../../state'

export function getNetwork() {
    const state = store.getState();

    return state.network.network
}
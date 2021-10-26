import { switchNetwork } from './actions';

import { createReducer } from '@reduxjs/toolkit';
import { ChainId } from 'app/core/constants';

export const initialState = {
  network: ChainId.SHIDEN
};

export default createReducer(initialState, (builder) =>
  builder.addCase(switchNetwork, (state, action) => {
    state.network = action.payload.network;
  }),
);

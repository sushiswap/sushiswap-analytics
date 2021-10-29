import { combineReducers } from '@reduxjs/toolkit';
import network from './network/reducer'

const reducer = combineReducers({
  network
});

export default reducer;

import { createAction } from '@reduxjs/toolkit';
import { ChainId } from 'app/core/constants';

export const switchNetwork = createAction(
  'protocol/switchNetwork',
);

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
  stakingContractAddress: "0xa7f840B8AFa5830Df6B19a1fCa93FF2dF466b646",
  usdtAddress: "0x55d398326f99059fF775485246999027B3197955",
  stakingContractAddressV2: "0x9842e17e5BF4a413feFe0731122E303E2f054f68",
  usdtAddressV2: "0x39A7bc6884bAde50C6b591Dfa57128C4d2a6b1C3",
  version: 2
};

const slice = createSlice({
  name: "init",
  initialState,
  reducers: {
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    setVersion: (state, action) => {
      state.version = action.payload;
    }
  }
});

export const { setAddress, setVersion } = slice.actions;

export default slice.reducer;

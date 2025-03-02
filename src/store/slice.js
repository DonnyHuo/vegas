import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
  stakingContractAddress: "0xa7f840B8AFa5830Df6B19a1fCa93FF2dF466b646",
  usdtAddress: "0x55d398326f99059fF775485246999027B3197955"
};

const slice = createSlice({
  name: "init",
  initialState,
  reducers: {
    setAddress: (state, action) => {
      state.address = action.payload;
    }
  }
});

export const { setAddress } = slice.actions;

export default slice.reducer;

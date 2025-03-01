import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
  stakingContractAddress: "0x0a70FFC49b8fa3AB2fc3055BD283a2d5975E028a",
  usdtAddress: "0x39A7bc6884bAde50C6b591Dfa57128C4d2a6b1C3"
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

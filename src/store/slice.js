import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
  stakingContractAddress: "0x6e3c8695e50e76230b4cc0dd1147a72f950a539c",
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

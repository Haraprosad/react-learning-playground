import { createSlice } from "@reduxjs/toolkit"; 

interface CounterState {
  count: number;
}

const initialState: CounterState = {
  count: 0,
};

const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        increment: (state) => {
            state.count = state.count + 1;
        },
        decrement: (state) => {
            state.count = state.count - 1;
        },
        reset: (state) => {
            state.count = 0;
        },
        increasedByAmount: (state, action) => {
            state.count = state.count + action.payload;
        }
    }
})

export const { increment, decrement, reset, increasedByAmount } = counterSlice.actions;
export default counterSlice.reducer;
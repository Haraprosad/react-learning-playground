import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// JSONPlaceholder Post interface
interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

interface PostsState {
    posts: Post[];
    loading: boolean;
    error: string | null;
}

const initialState: PostsState = {
    posts: [],
    loading: false,
    error: null
};

export const fetchPosts = createAsyncThunk(
    "posts/fetchPosts", async () => {
        const res = await axios.get("https://jsonplaceholder.typicode.com/posts");
        return res.data as Post[];
    }
)

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchPosts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
            state.loading = false;
            state.posts = action.payload;
            state.error = null;
        });
        builder.addCase(fetchPosts.rejected, (state, action) => {
            state.loading = false;
            state.posts = [];
            state.error = action.error.message || "Failed to fetch posts";
        });
    }
});


export default postSlice.reducer;


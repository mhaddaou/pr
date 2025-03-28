export interface FilterParams {
    category_list?: { string_list: string[] }[];
    follower_filter?: { left_bound: number; right_bound: number };
}
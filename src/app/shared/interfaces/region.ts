import { СuisineResponse } from "./countries";

export interface RegionRequest {
    country: СuisineResponse;
    regionName: string;
    slug: string;
    regionDescription: string;
    metaTtile: string;
    metaDescription: string;
    regionFlag: string;
}
export interface RegionResponse extends RegionRequest {
    id: number | string;
}
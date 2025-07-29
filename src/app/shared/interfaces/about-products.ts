export interface AboutProductsResponse {
    slug: string | number;
    articleName: string;
    articleParagraphs: any[];

}

export interface AboutProductsRequest extends AboutProductsResponse {
    id: number | string;
}
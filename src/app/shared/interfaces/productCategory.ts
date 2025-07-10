export interface ProductCategoryRequest {
    productCategoryName: string,

}

export interface ProductCategoryResponse extends ProductCategoryRequest {
    id: number | string;
}
export interface ArticleTypeRequest {
    articleTypeindex: number;
    articleTypeName: string;
    articleTypeDescription: string;
    slug: string;
    seoName: string;
    seoDescription: string;
    keywords: string;
    image: string;
    additionalImage: string;
    createdAt: string;
    numberСategories: number;
}
export interface ArticleTypeResponse extends ArticleTypeRequest {
    value: any;
    id: number | string;
}
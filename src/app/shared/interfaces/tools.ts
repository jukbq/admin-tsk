export interface ToolsRequest {
    toolsName: string;

    image: string;
}
export interface ToolsResponse extends ToolsRequest {
    id: number | string;
}
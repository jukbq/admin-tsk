export interface MethodCookinRequest {
    methodCookinName: string;


}
export interface MethodCookinResponse extends MethodCookinRequest {
    id: number | string;
}
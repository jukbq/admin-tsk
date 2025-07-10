export interface UnitRequest {
    unitName: string;

}
export interface UnitResponse extends UnitRequest {
    id: number | string;
}
export interface HolidayRequest {
  holidayName: string;
  slug: string;
  holidayDescription: string;
  metaTtile: string;
  metaDescription: string;
  image: string;
}
export interface HolidayResponse extends HolidayRequest {
  id: number | string;
}

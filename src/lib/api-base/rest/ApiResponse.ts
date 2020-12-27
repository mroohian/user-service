import { MakeRequired } from '../utils/TsUtils';
import { ApiResponseStatus } from './HttpStatusCodes';

interface ApiResponseBase<T = undefined> {
  success: boolean;
  value?: T;
  status: ApiResponseStatus;
  messages?: string[];
}

export type ApiResponse<T = undefined> = T extends undefined
  ? Omit<ApiResponseBase<T>, 'value'>
  : MakeRequired<ApiResponseBase<T>, 'value'>;

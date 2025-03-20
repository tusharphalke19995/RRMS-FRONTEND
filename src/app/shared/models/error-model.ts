export interface ErrorResponseModel {
  statusCode: number;
  message: string;
  extensions: ErrorExtension;
}

export interface ErrorExtension {
  correlationId: string;
  email: string;
  endpoint: string;
  machineAddress: string;
  requestTime: string;
  userId: string;
}

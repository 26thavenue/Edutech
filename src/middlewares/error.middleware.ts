 export class ErrorMiddleware extends Error {
  status: string;
  message: string;
  statusCode: number
  

  constructor(status: string, message: string, statusCode:number) {
    super(message);
    this.status = status;
    this.message = message;
    this.statusCode = statusCode
  }
   toJSON() {
    return {
      status: this.status,
      message: this.message,
      statusCode: this.statusCode
    };
  }
}

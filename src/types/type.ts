export type UserReq = { 
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phone: string | null;

}

export type LoginReq = {
    email: string;
    password: string;
}
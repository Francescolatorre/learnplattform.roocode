// User-bezogene Typen
export interface IUserDetails {
    id: number;
    username: string;
    email: string;
    display_name: string;
    role: string;
}

export interface IUser {
    readonly id: number;
    username: string;
    email: string;
    display_name?: string;
    role: string;
}

export interface User {
    username: string,
    password: string,
    friends?: number[],
    notifications?: [],
    since: Date,
}
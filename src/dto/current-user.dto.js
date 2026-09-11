export class CurrentUserDTO {
    constructor(user) {
        this.id = user.id;
        this.email = user.email;
        this.role = user.role;
    }
}
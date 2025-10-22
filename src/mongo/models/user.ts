import { Schema, model } from 'mongoose';
import { getDbUUID } from '../uuid';

export interface User {
    /** User's ID */
    id: string,
    /** User's username */
    username: string,
    /** User's password hash */
    passwordHash: string,
}

const userSchema = new Schema<User>({
    id: {
        type: String,
        default: () => getDbUUID("user"),
        unique: true,
    },

    username: String,
    passwordHash: String,
});

export const userModel = model('User', userSchema);
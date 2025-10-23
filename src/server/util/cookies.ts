import { CookieOptions, Response } from "express";
import CONFIG from "../../config";

const defaultCookieOptions: CookieOptions = {
    secure: CONFIG.env.production, // HTTPS Only (OFF FOR DEV)
    httpOnly: true, // JS Prevention
    sameSite: "strict", // CSRF Protection
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
};

export function getSecureCookieOptions(additionalOptions: CookieOptions = {}): CookieOptions {
    return { ...defaultCookieOptions, ...additionalOptions };
}

export function setSecureCookie(cookie: Response["cookie"], cookieName: string, cookieValue: string, additionalOptions: CookieOptions = {}) {
    cookie(cookieName, cookieValue, getSecureCookieOptions(additionalOptions));
};
import {Session, SessionCallback, ErrorCallback, User} from "../model/common";
import {CustomError} from "../model/CustomError";

export function inscriptionUser(user: User, onResult: SessionCallback, onError: ErrorCallback) {
    fetch("/api/auth/inscription",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })
        .then(async (response) => {
            if (response.ok) {
                const session = await response.json() as Session;
                sessionStorage.setItem('token', session.token);
                sessionStorage.setItem('externalId', session.externalId);
                sessionStorage.setItem('username', session.username || "");
                sessionStorage.setItem('id', session.id.toString());
                onResult(session)
            } else {
                const error = await response.json() as CustomError;
                onError(error);
            }
        }, onError);
}
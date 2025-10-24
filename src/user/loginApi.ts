import {Session, SessionCallback, ErrorCallback, User} from "../model/common";
import {CustomError} from "../model/CustomError";

export function loginUser(user: User, onResult: SessionCallback, onError: ErrorCallback) {
    fetch("/api/auth/login",
        {
            method: "POST", // ou 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })
        .then(async (response) => {
            if (response.ok) {
                console.log("response ok:",response)
                const session = await response.json() as Session;
                sessionStorage.setItem('token', session.token);
                sessionStorage.setItem('externalId', session.externalId);
                sessionStorage.setItem('username', session.username || "");
                sessionStorage.setItem('id', String(session.id));
                onResult(session)
            } else {
                  console.log("response  err:",response)
                const error = await response.json() as CustomError;
                onError(error);
            }
        }, onError);
}
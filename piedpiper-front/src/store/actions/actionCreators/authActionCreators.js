import * as actionTypes from '../actions';
import axios from '../../../Axios';

const logInSuccess = (token, userId, userName) => {
    return {
        type: actionTypes.LOG_IN,
        token, 
        userId,
        userName
    }
}
const checkTokenValidity = expiresIn => {
    return dispatch => {
        setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("expiresIn");
        localStorage.removeItem("userName");
            dispatch(logout());
        }, expiresIn * 1000);
    }
}

const onAuthInit = () => {
    return {
        type: actionTypes.ON_AUTH_INIT
    }
}
export const onLogIn = (data) => {
    return dispatch => {
        dispatch(onAuthInit())
        axios.post("/login", data)
         .then(res => {
           const { userId, token, expiresIn, userName } = res.data;
           const expirationDate = new Date (new Date().getTime() + expiresIn * 1000);
           localStorage.setItem("token", token);
           localStorage.setItem("userId", userId);
           localStorage.setItem("userName", userName);
           localStorage.setItem("expiresIn", expirationDate);
           dispatch(logInSuccess(token, userId, userName));
           dispatch(checkTokenValidity(expiresIn));
         })
         .catch(err => {
             dispatch(logInFailed(err))
         })
    }
}
const logInFailed = err => {
    return {
        type: actionTypes.LOG_IN_FAILED,
        error: err 
    }
}
const logout = () => {
    return {
        type: actionTypes.LOG_OUT
    }
}

export const onLogout = () => {
    return dispatch => {
        //delete token saved in local storage
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("expiresIn");
        localStorage.removeItem("userName");
        dispatch(logout());
    }
}

const authSuccess = (token, userId) => {
    return {
        type: actionTypes.ON_AUTH,
        token: token,
        userId: userId,
    }
}
export const checkAuthState = () => {
    return dispatch => {
        let token = localStorage.getItem('token');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date (localStorage.getItem('expiresIn'));
            if (expirationDate <= new Date()){
                dispatch(logout)
            } else {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(token, userId));
                dispatch(checkTokenValidity((expirationDate.getTime() - new Date().getTime()) / 1000 ));
            
            }
        }
    }
}
const registered = () => {
    return {
        type: actionTypes.ON_REGISTER,
    }
}
const registrationFailed = err => {
    return {
        type: actionTypes.ON_REGISTRATION_FAILED,
        error: err
    }
}
export const onRegister = data => {
    return dispatch => {
        dispatch(onAuthInit())
        axios.post("/register", data)
            .then(res => {
                const { userId, token, expiresIn } = res.data;
                dispatch(registered(res))
                dispatch(authSuccess(token, userId))
                dispatch(checkTokenValidity(expiresIn));
            })
            .catch(err => {
                dispatch(registrationFailed(err))
            });
    }
}
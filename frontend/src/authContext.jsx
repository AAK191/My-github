import React, {createContext, useState, useEffect, useContext} from 'react';
import { Children } from 'react';

const AuthContext = createContext();

export const useAuth = () =>{
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        if(userId){
            setCurrentUser(userId);
        }
         setIsLoading(false);
    },[]);

    const value = {
        currentUser, setCurrentUser, isLoading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
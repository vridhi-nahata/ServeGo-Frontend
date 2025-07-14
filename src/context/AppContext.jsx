import { createContext,useState,useEffect,useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider=(props)=>{
    const backendUrl=import.meta.env.VITE_BACKEND_URL;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    const getAuthState=async()=>{
        try{
            const {data}=await axios.get(backendUrl + '/api/auth/is-auth',{
                withCredentials: true,
            });
            if(data.success){
                setIsLoggedIn(true);
                getUserData();
            }
               
        }
        catch(error){
            toast.error(error.message)
        }
    }

    const getUserData=async()=>{
        try{
            const {data}=await axios.get(backendUrl + '/api/user/data',{
                withCredentials: true,
            });
            data.success?setUserData(data.userData):toast.error(data.message);
            }
        catch(error){
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getAuthState();
    },[]) //dependency array

    const value={
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
  return useContext(AppContext);
};
import { useState, useEffect } from "react";

export function useLocalStorage(initialState, key){

    /**WE WANT THIS CUSTOM HOOK to WORK like useSTATE hook */

    const [value, setValue] = useState(function(){
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : initialState;
        //yeh STRING return karega lekin hume STRING nhi chahiye

        //pehle check karenge ki localStorage me DATA hai bhi ya nhi, kyu ki agar nhi rahega toh "storedValue" = null hoga
        //and null ko parse karte time error ayega

        //agar storedValue == null rahega toh initialState bhejdenge matlab empty array
        //else JSON object bhej denge with watchedMovies 
      });  
    
    useEffect(function(){
        localStorage.setItem(key, JSON.stringify(value));
      }, [value, key]);
    return [value, setValue];
}
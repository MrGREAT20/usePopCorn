import {useState, useEffect } from "react";
export function useMovies(query){
    /** We are following stratergy, EXPORT DEFAULT for COMPONENTS and EXPORT for CUSTOM HOOKS 
     * You can also use DEFAULT as well
     * 
    */


    const [movies, setMovies] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [errormessage, setError] = useState('');
    useEffect(function(){
        const controller = new AbortController();
        async function fetchMovies(){
          try {
            setisLoading(true);
            setError("");
            const res = await fetch(`http://www.omdbapi.com/?apikey=9f79ab45&s=${query}`, {signal: controller.signal});
    
    
          if(!res.ok) throw new Error("Something went wrong with fetching movies");
          const data = await res.json();
          if(data.Response === 'False') throw new Error("Movie not Found");
          setMovies(movies => data.Search);
          setisLoading(false); 
          setError("");
          } catch (err) {
              setError(err.message); //this the error we threw from try block
    
              if(err.name!=="AbortError"){
                setError(err.message);
              }
              
          }
          finally{
            setisLoading(false);
          }
        }
        if(query.length < 3){ //means agar suppose query.length < 3 rahega toh fetch karne ki jarurat hi nhi
          setMovies([]);
          setError("");
          return;
        }
        fetchMovies();
    
    
    
        return function(){
          controller.abort();
        }
      }, [query]
      );
      return {movies, isLoading, errormessage};


    
}
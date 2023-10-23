import { useEffect, useRef, useState } from "react";
import Starrating from './Starrating'
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const[query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);


  const {movies, isLoading, errormessage} = useMovies(query);




  // /**We can also use a CALLBACK function to initiate a STATE in useState */
  // const [watched, setWatched] = useState(function(){
  //   const storedValue = localStorage.getItem("watched");
  //   return JSON.parse(storedValue);//yeh STRING return karega lekin hume STRING nhi chahiye
  //   /**whatever value is returned by this function will the initial STATE
  //    * 
  //    * and this function should be a PURE function means NO arguments
  //    */
  // });  

  /**Lets do the above using useLocalStorage custom hook */

  const [watched, setWatched] = useLocalStorage([], "watched"); 
  //we also passed a KEY because Localstorage KEY-VALUE pair
  //store karta hai



  
  function handleSelectMovie(id){
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleWatched(movie){
    setWatched(watched => [...watched, movie]);

    /** In locaStorage, we have a key-value pair where key and value both are Strings */

    /** We now want to store the watched array in the local storage, but we can't directly store like this
     * 
     * localStorage.setItem("watched", JSON.stringify(watched));
     * 
     * because watched abhi tak STALE STATE me hai, means voh abhi tak update nhi hua
     * 
     * toh yeh karne ke liye, hum aisa karenge
     * 
    */
   /**                     KEY             VALUE */
    //localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function onCloseMovie(){
    setSelectedId(null);
  }

  function handleDeleteWatched(id){
    setWatched(watched => watched.filter((movie) => movie.imdbID!==id)); 
    //hum unn movies ko hi rakh rhe hai jiski id given id se match nhi hoti

    //yeh hum remove from watched list feature implement kar rhe hai
  }

  /**We can also directly store into localStorage using useEffect with 
   * 
   * dependency list as watched, means whenever watched gets update, as a side-effect store that new watched 
   * in the localStorage
   */
  // useEffect(function(){
  //   localStorage.setItem("watched", JSON.stringify(watched));
  // }, [watched]);

  /**We will also move this above useEffect to the useLocalStorage CUSTOM HOOK */


  
  
  /* WE MOVED THE USE-EFFECT OF FETCHING API OF MOVIE WITH ID TO THE CUSTOM HOOK LOGIC */

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies} />
      </NavBar>

      <Main>
      
        {/**The main body is divided into 2 parts, the left part is MOVIELIST and right part is MOVIEDETAILS*/}
        <Box>
          {isLoading && <Loader/>}
          {!isLoading && !errormessage && <MovieList movies={movies} handleSelectMovie = {handleSelectMovie}/>}
          {errormessage && <ErrorScreen errormessage={errormessage}/>}
        </Box>

        <Box>
        {/**Agar koi movie select ki hai, toh MOVIEDETAILS COMPONENT MOUNT hoga with that MOVIE's details */}
        {selectedId ? (<MovieDetails selectedId={selectedId}
          onAddWatched = {handleWatched} onCloseMovie = {onCloseMovie}
          watched = {watched}
        />) : (<> <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} handleDeleteWatched = {handleDeleteWatched}/></>)}
        </Box>
      </Main>
    </>
  );
}
function ErrorScreen({errormessage}){
  return <p className="error">
    <span>❌</span>{errormessage}
  </p>
}
function Loader(){
  return <p className="loader">Loading...</p>
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({query, setQuery}) {

  // /**WE WANT THIS COMPONENT TO BE FOCUSED THE MOMENT IT MOUNTS */

  // useEffect(function(){
  //   const el = document.querySelector('.search') //className of the component
  //   el.focus();
  // }, []);


  const inputElement = useRef(null);


  useEffect(function(){
    //console.log(inputElement.current);
    inputElement.current.focus();
  }, []);


  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}


      ref={inputElement} //React will set the current property of your ref object (inputEtlement) to that DOM node
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

/**Below BOX isiliye use kiya, because it was REUSEABLE FOR BOTH WATCHED as well as NOTWATCHED */
function Box({children}){
    const [isOpen, setIsOpen] = useState(true);
    return (<div className="box">
                <button className="btn-toggle"
                    onClick={() => setIsOpen(open => !open)}>
                    {isOpen ? "-" : "+"}
                </button>
                {isOpen && children}
                    </div>)
}


/** AS you can see BOTH LISTBOX and WATCHEDBOX have similar functionalities
 * 
 * 
 * SO WE MADE THEM 1 COMPONENT WHICH CAN BE REUSED based on the CHILDREN they get 
 */

// function ListBox({children}){
//     const [isOpen1, setOpen1] = useState(true);
//     return (<div className="box"><button className="btn-toggle"
//                 onClick={() => setOpen1(open => !open)}>
//                 {isOpen1 ? "-" : "+"}
//                     </button>
//                     {isOpen1 && children}
//             </div>)
// }

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

function MovieList({ movies , handleSelectMovie}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        //har ek movie object in the array can be seen as MOVIE COMPONENT
        <Movie movie={movie} key={movie.imdbID} handleSelectMovie = {handleSelectMovie}/>
      ))}
    </ul>
  );
}

function Movie({ movie , handleSelectMovie}) {
  return (
    /*Har ek movie humare LEFT (MOVIELIST) me aise dikhegi, har ek  component ek <li> hai
      joh onClick pe selectedId me movie ka ID daaldegi

      or jaise hi selectedId state change Hoga, hume ek RIGHT (MOVIEDETAILS) COMPONENT dikhega

    */
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}


function MovieDetails({selectedId, onAddWatched, onCloseMovie, watched}){



  const [movie, setMovie] = useState({}); //MOVIE ki information, joh humne select ki hai
  const [userrating, setUserRating] = useState(0); //rating kitna diya hai, we have used an EXTERNAL STAR COMPONENT for rating
  const countRef = useRef([]); //we want to know the ratings user gave before finalizing rating, like first 6, than 7 and than finally 10


    //we want to update the countRef.current
    useEffect(function(){
      if(userrating){ //because useEffect will also be called during the initial mount, so we dont want to add a empty data in the array
        countRef.current = [...countRef.current, userrating];
      }
    }, [userrating]); //every time the userrating changes, useEffect will be called  and also during MOUNT (initial render)

  const watchedArr = watched.map(movie => movie.imdbID); 
  //we made an array of watched movies IDs to check if the movie is already added or not

  const isWatched = watchedArr.includes(selectedId);
  //this above is a boolean which tells if we have watched or not

  const watchedUserrating = watched.find(movie => movie.imdbID === selectedId)?.userRating;
  //this above is to find out the userRating from the watched array, this "?" is known as optional chaining means
  // if agar movie mili jiska id humare selected ID hai, toh uska userrating bata de kya hai

  const {Title:title, Year:year, Poster:poster, Runtime:runtime, imdbRating, Plot:plot, Released:released, Actors:actors, Director:director, Genre:genre} = movie;
  




  function handleWatched(){
    const newWatchedMovie = {
      imdbID : selectedId,
      title,
      year,
      poster, 
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split("").at(0)),
      userRating: userrating
    };
    console.log(countRef.current);
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }
  
  
  /* Joh ID select ki thi MOVIE ki detail dekhne ke liye, hum usi ko FETCH kar rhe hai*/
  useEffect(function(){
    async function fetchMovies(){
        const res = await fetch(`http://www.omdbapi.com/?apikey=9f79ab45&i=${selectedId}`);
        const data = await res.json();
        setMovie(movie => data);
    }
    fetchMovies();
  },[selectedId])
  //yeh effect tab call hoga,jabh selectedId ka  STATE change hoga

  // console.log(movie);
  // if(movie.Title){
  //   document.title = `Movie | ${movie.Title}`;
  // }
  // else{
  //   document.title = 'usePopcorn';
  // }
  useEffect(function(){
    if(!title) return;
    document.title = `Movie | ${title}`;

    return function(){
      document.title = 'usePopcorn';
    }
    //this above is a cleanup function 
  }, [title]);

   return <div className="detail"><header><img src={poster} alt={`Poster of ${movie} movie`}/>
   <div className="details-overview"><h2>{title}</h2><p>{released} &bull; {runtime}</p>
   <p>{genre}</p>
   <p><span>⭐</span>{imdbRating} IMDB rating</p>
   </div>
   </header>
   <section>
   <div className="rating">
   {!isWatched ? <><Starrating maxRating={10} size={24} defaultRating= {0} setOutsideRating={setUserRating}/>
      {userrating > 0 && <button className="btn-add" onClick={handleWatched}>+ Add to List</button>}
      {/*Only if the user has done some rating than only he can add it in the list*/}</> : <p>You rated this movie {watchedUserrating} ⭐</p>}
    </div>
    <p><em>{plot}</em></p>
    <p>Starring {actors}</p>
    <p>Directed by {director}</p>
   </section>
   </div>
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched , handleDeleteWatched}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} handleDeleteWatched = {handleDeleteWatched}/>
      ))}
    </ul>
  );
}

function WatchedMovie({ movie , handleDeleteWatched}) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
          {/** Basically humne 7.33333 aisa nhi chahiye, bass 7.33 chahiye
              you can say toFixed as setPrecision in JS
          */}
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => handleDeleteWatched(movie.imdbID)}></button>
      </div>
    </li>
  );
}

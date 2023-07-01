let currentPage = 1;
let lastPage = 100;
let movies = [];
const movieCardContainer = document.getElementById("movies-card-container");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const pageNumberButton = document.getElementById("current-page-button");
const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector(".search-movies");
const sortByDateButton = document.getElementById("sort-by-date");
const sortByRatingButton = document.getElementById("sort-by-rating");
const allTabButton = document.getElementById("all-tab");
const favTabButton = document.getElementById("favorites-tab");

// ------------- LOCAL HOST GET AND SET MOVIE S -------------

function getMovesFromLocalStorage() {
  const allTheFavMovieString = JSON.parse(localStorage.getItem("favMovie"));

  if (allTheFavMovieString === null || allTheFavMovieString === undefined) {
    return [];
  } else {
    return allTheFavMovieString;
  }
}

function setMoviesToLocalStorage(movie) {
  const allFavMovie = getMovesFromLocalStorage();

  const arrayOfMovies = [...allFavMovie, movie];

  localStorage.setItem("favMovie", JSON.stringify(arrayOfMovies));
}

function removeFavMovieFromLocalStorage(id) {
  const favMoviesid = getMovesFromLocalStorage();
  const filteredMovies = favMoviesid.filter((movieId) => movieId != id);
  localStorage.setItem("favMovie", JSON.stringify(filteredMovies));
}

//----  Fetch the movies from certain page..

async function fetchMovieWithId(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=24fee11d4a255015c6182c1567e49990`;
  const response = await fetch(url);
  const dataList = await response.json();

  return {
    title: dataList.title,
    voteAverage: dataList.vote_average,
    posterPath: dataList.poster_path,
    popularity: dataList.popularity,
    id: dataList.id,
  };
}

async function fetchAllMovie(pageNumber) {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGZlZTExZDRhMjU1MDE1YzYxODJjMTU2N2U0OTk5MCIsInN1YiI6IjY0OTFkNmZkYzNjODkxMDEwY2E2YjdiMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jYTHqhYKNqiZ14O05Fg2xzBeEYQ6FmIQ9PpgBJHZVzU",
      },
    };

    const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${pageNumber}`;
    const response = await fetch(url, options);
    let data = await response.json();

    // Lets set the Last Page Value

    const { total_pages } = data;
    lastPage = total_pages;

    const changedData = remapData(data);

    movies = changedData;

    renderMovies(changedData);
    return changedData;
  } catch (error) {
    console.log("error iss here in fetch all movie function");
  }
}

function remapData(data) {
  const moviesList = data.results;
  const modifiedMovieList = moviesList.map((movie) => {
    return {
      title: movie.title,
      voteAverage: movie.vote_average,
      posterPath: movie.poster_path,
      popularity: movie.popularity,
      id: movie.id,
    };
  });
  return modifiedMovieList;
}

// ----- rendering the movies (All) -----------

function clearMovieContainer() {
  movieCardContainer.innerHTML = "";
}

function renderMovies(moviesList) {
  // Get the Fav Movie
  const favMovieList = getMovesFromLocalStorage(); //4

  // Clearing the Older Movies in the Grid Layout

  clearMovieContainer();
  moviesList.forEach((movie) => {
    const { popularity, posterPath, title, voteAverage, id } = movie;

    const isfavMovie = favMovieList.indexOf(id + "") > -1;

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    const posterUrl = "https://image.tmdb.org/t/p/original" + posterPath;

    cardDiv.innerHTML = `
            <section>
                <img class="poster" src=${posterUrl} alt="placeholder picture">
            </section>

            <p class="title">
                ${title}
            </p>

            <section class="votes-favorites">

                    <section class="votes">
                        <p class="vote-count">Votes: ${voteAverage}</p>
                        <p class="vote-rating">Rating: ${popularity}</p>
                    </section>

                    <section class="favorites">
                        <i id="${id}" class="fa-regular fa-heart ${
      isfavMovie ? "fa-solid" : ""
    }"></i>
                    </section>

                </section>
        `;

    const gridContainer = document.getElementById("movies-card-container");
    // console.dir(gridContainer)
    gridContainer.appendChild(cardDiv);

    // select Fav item and then add eventListner to it.
    const favItemButton = document.getElementById(id);

    favItemButton.addEventListener("click", (event) => {
      const hearSignElement = event.target;
      const { id } = hearSignElement;

      // if it is already fav
      if (favItemButton.classList.contains("fa-solid")) {
        // now you want to mark unfav

        // --- remove the movie from the local storarge

        removeFavMovieFromLocalStorage(id);

        //  ------ have the normal heart sign

        favItemButton.classList.remove("fa-solid");
      } else {
        // you want to mark fav
        setMoviesToLocalStorage(id);

        // set the logo
        favItemButton.classList.add("fa-solid");
      }
    });
  });
}

async function renderFavMovies() {
  clearMovieContainer();

  // add the card for the fav movies...

  // --- get all fav Movies

  const favMovieList = getMovesFromLocalStorage(); // id[240, 290]

  const favMovieListData = [];

  for (let index = 0; index < favMovieList.length; index++) {
    const movieId = favMovieList[index];

    const response = await fetchMovieWithId(movieId);

    favMovieListData.push(response);
  }

  renderMovies(favMovieListData); //TODO: make different render method for fav

  // styep 1 make sure the movie id is deleted from the localstorage
  // step 2 = make the grid blank (clearMovieContainer)
  // step 3 = refetch  the fav movies and then you are renderFavMovies();
}

async function searchMovies(movieName) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=24fee11d4a255015c6182c1567e49990`;

    const response = await fetch(url);
    const data = await response.json();

    const changedData = remapData(data);
    renderMovies(changedData);
  } catch (error) {
    console.log("error iss here in search function");
  }
}

function displayMovies() {
  // who is active tab ??
  if (favTabButton.classList.contains("active-tab")) {
    sortByDateButton.style.display = "none";
    sortByRatingButton.style.display = "none";

    renderFavMovies();
  } else if (allTabButton.classList.contains("active-tab")) {
    // show my sort button both
    sortByDateButton.style.display = "inline-block";
    sortByRatingButton.style.display = "inline-block";
    renderMovies(movies);
  }
}

// Favourites Tab

function showFav(favMovie) {
  const { popularity, posterPath, title, voteAverage } = favMovie;

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  cardDiv.innerHTML = `
            <section>
                <img class="poster" src=${posterUrl} alt="placeholder picture">
            </section>

            <p class="title">
                ${title}
            </p>

            <section class="votes-favorites">

                    <section class="votes">
                        <p class="vote-count">Votes: ${voteAverage}</p>
                        <p class="vote-rating">Rating: ${popularity}</p>
                    </section>

                    <section class="favorites">
                        <i class="fa-regular fa-heart"></i>
                    </section>

                </section>
        `;

  // Removal of the Card....
}

function switchTab(event) {
  allTabButton.classList.remove("active-tab");
  favTabButton.classList.remove("active-tab");

  const whoClickedMe = event.target;
  whoClickedMe.classList.add("active-tab");

  displayMovies();
}

// Listners

prevButton.disabled = true;

nextButton.addEventListener("click", () => {
  currentPage++;

  // Work 1: call API for new Page.

  fetchAllMovie(currentPage);

  // Work 2: update the page number in the HTML

  pageNumberButton.innerHTML = ` Current Page: ${currentPage}`;

  if (currentPage === 1) {
    prevButton.disabled = true;
  } else if (currentPage === 2) {
    prevButton.disabled = false;
  } else if (currentPage === lastPage) {
    nextButton.disabled = true;
  }
});

prevButton.addEventListener("click", () => {
  currentPage--;

  fetchAllMovie(currentPage);

  pageNumberButton.innerHTML = ` Current Page: ${currentPage}`;

  if (currentPage === 1) {
    prevButton.disabled = true;
  } else if (currentPage === 2 && currentPage !== lastPage - 1) {
    prevButton.disabled = false;
  } else if (currentPage === lastPage - 1) {
    nextButton.disabled = false;
  }
});

const searchButtonCallbackFunction = () => {
  const query = searchInput.value;
  searchInput.value = "";

  searchMovies(query);
};

sortByRatingButton.addEventListener("click", async () => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGZlZTExZDRhMjU1MDE1YzYxODJjMTU2N2U0OTk5MCIsInN1YiI6IjY0OTFkNmZkYzNjODkxMDEwY2E2YjdiMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jYTHqhYKNqiZ14O05Fg2xzBeEYQ6FmIQ9PpgBJHZVzU",
    },
  };

  const response = await fetch(
    "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc",
    options
  );
  const data = await response.json();
  const changedData = remapData(data);
  console.log(changedData);
  renderMovies(changedData);
});

sortByDateButton.addEventListener("click", async () => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGZlZTExZDRhMjU1MDE1YzYxODJjMTU2N2U0OTk5MCIsInN1YiI6IjY0OTFkNmZkYzNjODkxMDEwY2E2YjdiMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jYTHqhYKNqiZ14O05Fg2xzBeEYQ6FmIQ9PpgBJHZVzU",
    },
  };

  const response = await fetch(
    "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=primary_release_date.desc",
    options
  );

  const data = await response.json();
  const changedData = remapData(data);
  console.log(changedData);
  renderMovies(changedData);
});

fetchAllMovie(currentPage);
searchButton.addEventListener("click", searchButtonCallbackFunction);

allTabButton.addEventListener("click", switchTab);
favTabButton.addEventListener("click", switchTab);

movieCardContainer.addEventListener("click", (event) => {
  console.dir(movieCardContainer);
});

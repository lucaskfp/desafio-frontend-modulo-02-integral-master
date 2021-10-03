const btnTheme = document.querySelector(".btn-theme");
const filmesContainer = document.querySelector(".container .movies");
const btns = document.querySelectorAll(".btn");
const btnNext = document.querySelector(".btn-next");
const btnPrev = document.querySelector(".btn-prev");
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalTitle = document.querySelector(".modal__title");
const modalIMG = document.querySelector(".modal__img");
const modalDescription = document.querySelector(".modal__description");
const modalGenres = document.querySelector(".modal__genres");
const modalAverage = document.querySelector(".modal__average");
const input = document.querySelector(".input");
const input__spiner = document.querySelector(".input__spiner");
let filmesCards;

const filmeDoDiaID = "436969";
let paginaAtual = 1;
const filmes = {
  1: [],
  2: [],
  3: [],
  4: [],
};
let filmesInput;

let darkMode = false;

function renderFilmes() {
  filmesContainer.innerHTML = "";

  filmes[paginaAtual].forEach((filme) => {
    filmesContainer.insertAdjacentHTML(
      "beforeend",
      `
        <div class="movie flip-in-ver-left data-id="${filme.id}"">
            <div style="background-image: url(${filme.poster_path})" class="movie__bg"  data-id="${filme.id}">
            </div>
            <div class="movie__info">
                <span class="movie__title">${filme.title}</span>
                <span class="movie__rating">
                <img src="./assets/estrela.svg" alt="Estrela" />
                ${filme.vote_average}
                </span>
            </div>
        </div>
      `
    );
  });

  addEventoDeClickFilmes();
}

// Busca filmes (on load)
(async function buscaFilmes() {
  const response = await fetch(
    "https://tmdb-proxy.cubos-academy.workers.dev/3/discover/movie?language=pt-BR&include_adult=false"
  ).then((res) => res.json());

  paginacaoFilmes(response.results);

  renderFilmes();
})();

// Divide filmes em 4 páginas
function paginacaoFilmes(data) {
  let pagina = 1;

  data.forEach((filme) => {
    if (filmes[pagina].length === 5) {
      pagina++;
    }

    filmes[pagina].push(filme);
  });
}

// Busca filme específico
async function buscaFilmeEspecifico(id) {
  const response = await fetch(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${id}?language=pt-BR`
  ).then((res) => res.json());

  renderModal(response);
}

// Filme do dia ********************
(async function buscaFilmeDoDia() {
  const response = await fetch(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${filmeDoDiaID}?language=pt-BR`
  ).then((res) => res.json());

  renderFilmeDoDia(response);
})();

async function buscaVideosFilmeDoDia(videos) {
  const response = await fetch(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${filmeDoDiaID}/videos?language=pt-BR`
  ).then((res) => res.json());

  return response.results;
}

async function renderFilmeDoDia(filme) {
  const mes = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const titulo = document.querySelector(".highlight__title");
  const avaliacao = document.querySelector(".highlight__rating");
  const generos = document.querySelector(".highlight__genres");
  const lancamento = document.querySelector(".highlight__launch");
  const descricao = document.querySelector(".highlight__description");
  const video = document.querySelector(".highlight__video");
  const videoLink = document.querySelector(".highlight__video-link");
  const date = new Date(filme.release_date);
  const videos = await buscaVideosFilmeDoDia();

  titulo.textContent = filme.title;

  avaliacao.textContent = filme.vote_average;

  lancamento.textContent =
    date.getUTCDate() +
    " de " +
    mes[date.getMonth()] +
    " de " +
    date.getFullYear();

  filme.genres.forEach((genero, index) => {
    generos.textContent +=
      index === filme.genres.length - 1 ? genero.name : `${genero.name}, `;
  });

  descricao.textContent = filme.overview;

  video.style.backgroundImage = `url(${filme.backdrop_path})`;

  videos.find((el) => {
    if (el.site === "YouTube") {
      videoLink.href = `https://www.youtube.com/watch?v=${el.key}`;
    }
  });
}

function addEventoDeClickFilmes() {
  filmesCards = document.querySelectorAll(".movies .movie");
  filmesCards.forEach((filme) => {
    filme.addEventListener("click", (event) => {
      document.body.style.overflow = "hidden";
      modal.classList.remove("hidden");
      buscaFilmeEspecifico(event.target.dataset.id);
    });
  });
}

function renderModal(filme) {
  modalTitle.textContent = filme.title;
  modalIMG.src = filme.backdrop_path;
  modalDescription.textContent = filme.overview;

  modalGenres.innerHTML = "";
  filme.genres.forEach((genre) => {
    modalGenres.insertAdjacentHTML(
      "beforeend",
      `
        <a href='#'>${genre.name}</a>
    `
    );
  });

  modalAverage.textContent = filme.vote_average;
}

// EVENTOS **************************
btnNext.addEventListener("click", (event) => {
  paginaAtual++;
  if (paginaAtual > 4) {
    paginaAtual = 1;
  }

  renderFilmes();
});

btnPrev.addEventListener("click", (event) => {
  paginaAtual--;
  if (paginaAtual <= 0) {
    paginaAtual = 4;
  }

  renderFilmes();
});

// Mudar tema
btnTheme.addEventListener("click", (event) => {
  darkMode = !darkMode;
  btnTheme.src = darkMode
    ? "./assets/dark-mode.svg"
    : "./assets/light-mode.svg";
});

// Fecha modal
modalClose.addEventListener("click", (event) => {
  document.body.style.overflow = "auto";
  modal.classList.add("hidden");
  modalTitle.textContent = "";
  modalIMG.src = "";
});

// Busca input
input.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  if (input.value === "") {
    paginaAtual = 1;
    renderFilmes();
    btns.forEach((el) => {
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
    });
    return;
  }

  if (input.value !== "") {
    buscaFilmesInput();
    input.value = "";
  }
});

async function buscaFilmesInput() {
  input__spiner.classList.remove("hidden");
  const valorInput = input.value;
  const response = await fetch(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false&query=${valorInput}`
  ).then((res) => res.json());

  filmesInput = response.results.splice(0, 5);

  setTimeout(() => {
    renderFilmesInput(filmesInput);
  }, 500);
}

function renderFilmesInput(filmes) {
  input__spiner.classList.add("hidden");
  filmesContainer.innerHTML = "";

  filmes.forEach((filme) => {
    filmesContainer.insertAdjacentHTML(
      "beforeend",
      `
        <div class="movie flip-in-ver-left data-id="${filme.id}"">
            <div style="background-image: url(${filme.poster_path})" class="movie__bg"  data-id="${filme.id}">
            </div>
            <div class="movie__info">
                <span class="movie__title">${filme.title}</span>
                <span class="movie__rating">
                <img src="./assets/estrela.svg" alt="Estrela" />
                ${filme.vote_average}
                </span>
            </div>
        </div>
      `
    );
  });

  addEventoDeClickFilmes();

  btns.forEach((el) => {
    el.style.pointerEvents = "none";
    el.style.opacity = "0.3";
  });
}

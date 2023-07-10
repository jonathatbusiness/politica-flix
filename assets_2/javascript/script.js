const CACHE_KEY = 'youtubeVideos';
const CACHE_EXPIRATION = 4 * 60 * 60 * 1000; // 4 horas em milissegundos

// Chave da API do YouTube
const apiKey = 'YOUR-API-KEY';

// IDs dos canais desejados
const channelIds = ['UC_M1ek8fhnDkz5C2zfkTxpg', 'UCk5BcU1rOy6hepflk7_q_Pw', 'UCFCiSRbCVwQ_BQaDQBYxN_A', 'UC9mdw2mmn49ZuqGOpSri7Fw', 'UC3sMBA3BdnsKSVI0WB9yVWQ'];

// Número de vídeos a serem exibidos por canal
const videosPorCanal = 5;

// Array para armazenar todos os vídeos
let videos = [];
let videosExibidos = [];

// Função para buscar os vídeos de um canal específico
async function buscarVideosPorCanal(channelId) {
    const cacheKey = `${CACHE_KEY}_${channelId}`;
    const cachedVideos = await localforage.getItem(cacheKey);

    if (cachedVideos) {
        const expiration = cachedVideos.expiration || 0;
        if (Date.now() < expiration) {
            return cachedVideos.data;
        } else {
            await localforage.removeItem(cacheKey);
        }
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${videosPorCanal}&order=date&type=video&key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();
    const videos = data.items;

    const cacheData = {
        data: videos,
        expiration: Date.now() + CACHE_EXPIRATION
    };

    await localforage.setItem(cacheKey, cacheData);

    return videos;
}

// Função para buscar e exibir os vídeos de múltiplos canais
async function buscarVideos() {
    videos = [];

    for (const channelId of channelIds) {
        const videosDoCanal = await buscarVideosPorCanal(channelId);
        videos = [...videos, ...videosDoCanal];
    }

    // Filtrar os vídeos que só abrem no YouTube
    const videosExibidos = videos.filter(video => video.id.kind !== 'youtube#channel');

    exibirVideos(videosExibidos);
}

// Função para exibir os vídeos na página
function exibirVideos(videos) {
    videosExibidos = [...videosExibidos, ...videos];

    const videosSection = document.getElementById('videos');
    videosSection.innerHTML = '';

    videosExibidos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');

        const embedUrl = `https://www.youtube.com/embed/${video.id.videoId}`;

        videoItem.innerHTML = `
      <iframe width="100%" height="200" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
      <h3>${video.snippet.title}</h3>
      <p>Canal: ${video.snippet.channelTitle}</p>
    `;

        videosSection.appendChild(videoItem);
    });

    // Verifica se todos os vídeos foram exibidos
    //if (videosExibidos.length === videos.length) {
    //  const verMaisButton = document.getElementById('ver-mais');
    //verMaisButton.style.display = 'none';
    //}
}

// Função para carregar mais vídeos ao clicar no botão "Ver mais"
function carregarMaisVideos() {
    const videosRestantes = videos.slice(videosExibidos.length, videosExibidos.length + videosPorCanal);
    exibirVideos(videosRestantes);
}

// Chama a função para buscar e exibir os vídeos
buscarVideos();

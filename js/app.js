// 1. Configurações Globais (Chave da API e Ícone)
const apiKey = 'at_pBxCDdvjyIYu2MHjtYStfA0rbl19G';
const myIcon = L.icon({
    iconUrl: './images/icon-location.svg', // Verifique se o caminho da pasta está correto
    iconSize: [46, 56],
    iconAnchor: [23, 56]
});

// 2. Inicialização do Mapa (Declarado APENAS UMA VEZ)
const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

window.addEventListener('resize', () => {
    map.invalidateSize();
});

// Criamos uma variável para o marcador fora das funções para podermos movê-lo/removê-lo
let marker;

// 3. Função para Buscar Dados da API (IPify)
async function getIpData(ipAddress = '') {
    // 1. Feedback visual de carregamento (opcional, mas bom para UX)
    const ipDisplay = document.getElementById('ip-display');
    const originalText = ipDisplay.innerText;
    ipDisplay.innerText = "Loading...";

    try {
        const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}&ipAddress=${ipAddress}&domain=${ipAddress}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            // Se a API retornar erro (ex: IP inválido), cai aqui
            throw new Error("Invalid IP or Domain");
        }
        
        const data = await response.json();
        updateInterface(data);
    } catch (error) {
        console.error("Erro:", error);
        
        // 2. Tratamento de erro amigável
        ipDisplay.innerText = originalText; // Volta o texto anterior
        alert("Ops! Could not find this IP or Domain. Please check and try again.");
    }
}

// 4. Função para Atualizar a Tela e o Mapa
function updateInterface(data) {
    const { ip, location, isp } = data;
    const { lat, lng, city, region, timezone } = location;

    // Atualiza os textos no seu HTML (certifique-se que os IDs batem)
    document.getElementById('ip-display').innerText = ip;
    document.getElementById('location-display').innerText = `${city}, ${region}`;
    document.getElementById('timezone-display').innerText = `UTC ${timezone}`;
    document.getElementById('isp-display').innerText = isp;

    // Move a câmera do mapa para as novas coordenadas
    map.setView([lat, lng], 13);

    // Remove o marcador anterior (se houver) e adiciona o novo no local atual
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([lat, lng], { icon: myIcon }).addTo(map);
}

// 5. Evento de Clique no Botão de Busca
document.getElementById('search-btn').addEventListener('click', () => {
    const inputField = document.getElementById('ip-input');
    const value = inputField.value.trim(); // .trim() remove espaços vazios

    if (value === "") {
        // Mostra um erro visual simples no input
        inputField.classList.add('border-2', 'border-red-500');
        setTimeout(() => inputField.classList.remove('border-red-500'), 2000);
        return; // Interrompe a função aqui
    }

    getIpData(value);
});

document.getElementById('ip-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const value = event.target.value.trim();
        if (value !== "") {
            getIpData(value);
        }
    }
});

// 6. Busca inicial (carrega o IP do próprio usuário ao abrir a página)
getIpData();
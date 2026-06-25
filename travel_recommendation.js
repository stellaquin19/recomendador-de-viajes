document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    let recommendations = [];

    const fallbackRecommendations = [
        {
            id: 1,
            name: 'Playa de Canarias',
            location: 'España',
            description: 'Disfruta de sol, arena y actividades acuáticas en una playa de aguas cristalinas y paisajes relajantes.',
            category: 'beach',
            imageUrl: 'images/destination1.svg'
        },
        {
            id: 2,
            name: 'Playa Bahía Esmeralda',
            location: 'México',
            description: 'Relájate en una playa de arena dorada, perfecto para natación y paseos al atardecer.',
            category: 'beach',
            imageUrl: 'images/destination2.svg'
        },
        {
            id: 3,
            name: 'Templo de Angkor Wat',
            location: 'Camboya',
            description: 'Visita el templo ancestral y descubre una de las maravillas sagradas más famosas del mundo.',
            category: 'temple',
            imageUrl: 'images/destination3.svg'
        },
        {
            id: 4,
            name: 'Templo Dorado',
            location: 'Tailandia',
            description: 'Explora el templo iluminado y su arquitectura dorada en el corazón de la ciudad.',
            category: 'temple',
            imageUrl: 'images/destination4.svg'
        },
        {
            id: 5,
            name: 'Italia',
            location: 'Italia',
            description: 'Explora este país lleno de historia, arte, paisajes y gastronomía inigualable.',
            category: 'country',
            imageUrl: 'images/destination5.svg'
        },
        {
            id: 6,
            name: 'Japón',
            location: 'Japón',
            description: 'Descubre un país de tradición, tecnología y paisajes extraordinarios en cada región.',
            category: 'country',
            imageUrl: 'images/destination6.svg'
        }
    ];

    async function loadRecommendations() {
        try {
            const response = await fetch('travel_recommendation_api.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            recommendations = Array.isArray(data) && data.length > 0 ? data : fallbackRecommendations;
            console.log('Travel recommendations data:', recommendations);
        } catch (error) {
            console.error('Unable to fetch recommendations:', error);
            recommendations = fallbackRecommendations;
        }
        resultsContainer.innerHTML = '<p class="empty-message">Escribe beach, temple o country y haz clic en Search para ver resultados.</p>';
    }

    function renderRecommendations(items) {
        if (!items || items.length === 0) {
            resultsContainer.innerHTML = '<p class="empty-message">No se encontraron recomendaciones.</p>';
            return;
        }

        resultsContainer.innerHTML = items
            .map(item => `
                <article class="result-card">
                    <img src="${item.imageUrl}" alt="${item.name}" />
                    <div class="result-content">
                        <h3>${item.name}</h3>
                        <p class="location">${item.location}</p>
                        <p>${item.description}</p>
                    </div>
                </article>
            `)
            .join('');
    }

    function normalizeText(text) {
        return String(text || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    const keywordMap = {
        beach: 'beach',
        beaches: 'beach',
        playa: 'beach',
        playas: 'beach',
        temple: 'temple',
        temples: 'temple',
        templo: 'temple',
        templos: 'temple',
        country: 'country',
        countries: 'country',
        pais: 'country',
        paises: 'country'
    };

    function getSearchCategory(query) {
        const terms = query
            .split(/\s+/)
            .map(normalizeText)
            .map(term => keywordMap[term])
            .filter(Boolean);
        return terms[0] || null;
    }

    function getFilteredRecommendations(query) {
        const normalizedQuery = normalizeText(query);
        const category = getSearchCategory(normalizedQuery);
        const terms = normalizedQuery.split(/\s+/).filter(Boolean);

        if (category) {
            const categoryResults = recommendations.filter(item => item.category === category);
            if (categoryResults.length > 0) {
                return categoryResults;
            }
        }

        return recommendations.filter(item => {
            const searchText = normalizeText(`${item.name} ${item.location} ${item.description}`);
            return terms.every(term => searchText.includes(term));
        });
    }

    function handleSearch(event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        const filtered = getFilteredRecommendations(query);
        console.log('Search query:', query, 'Filtered count:', filtered.length);
        renderRecommendations(filtered);
    }

    function handleReset() {
        searchInput.value = '';
        renderRecommendations(recommendations);
    }

    searchForm.addEventListener('submit', handleSearch);
    searchForm.addEventListener('reset', handleReset);

    loadRecommendations();
});

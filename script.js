document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario');
    const inputPrincipal = document.getElementById('inputPrincipal');
    const btnBuscar = document.getElementById('btnBuscar');

    btnBuscar.addEventListener('mousedown', function() {
        btnBuscar.style.backgroundColor = '#d3d3d3';
        setTimeout(() => {
            btnBuscar.style.backgroundColor = 'whitesmoke';
        }, 200);
    });

    inputPrincipal.addEventListener('keydown', function(event) {
        if(event.key === "Enter") {
            btnBuscar.style.backgroundColor = '#d3d3d3';
            setTimeout(() => {
                btnBuscar.style.backgroundColor = 'whitesmoke';
            }, 200);
        }
    });

    formulario.addEventListener('submit', function(event) {
        event.preventDefault();

        let texto = inputPrincipal.value.trim();

        if (texto === "") {
            alert("Por favor, digite o nome de uma espécie");
            return;
        }

        buscarEspecie(texto);
    });

    async function buscarEspecie(nomeBusca) {
        try {
            const response = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(nomeBusca)}`);
            const data = await response.json();

            if (data && data.usageKey && data.rank === "SPECIES") {
                exibirDadosTaxonomicos(data);
                
                iniciarBuscasSecundarias(data);
            } else {
                exibirMensagemVazia(nomeBusca);
            }
        } catch (error) {
            console.error("Erro na requisição principal:", error);
            document.getElementById('nomeCientifico').textContent = "Erro ao carregar dados. Tente novamente.";
            document.querySelectorAll('#reino, #filo, #classe, #ordem, #familia, #genero, #especie')
                    .forEach(el => { el.textContent = ""; });
            document.getElementById('mapaDistribuicao').style.display = 'none';
        }
    }

    function exibirDadosTaxonomicos(especie) {
        document.getElementById('resultado').classList.add('mostrar');
        
        document.getElementById('nomeCientifico').textContent = `Nome completo: ${especie.scientificName || "Nome não disponível"}`;
        document.getElementById('reino').textContent = `Reino: ${especie.kingdom || "Não informado"}`;
        document.getElementById('filo').textContent = `Filo: ${especie.phylum || "Não informado"}`;
        document.getElementById('classe').textContent = `Classe: ${especie.class || "Não informado"}`;
        document.getElementById('ordem').textContent = `Ordem: ${especie.order || "Não informado"}`;
        document.getElementById('familia').textContent = `Família: ${especie.family || "Não informado"}`;
        document.getElementById('genero').textContent = `Gênero: ${especie.genus || "Não informado"}`;
        document.getElementById('especie').textContent = `Espécie: ${especie.species || "Não informado"}`;

        document.querySelector('#linkMapaDetalhado a').setAttribute(
            'href',
            `https://www.gbif.org/occurrence/map?taxon_key=${especie.usageKey}`
        );
    }

    async function iniciarBuscasSecundarias(especie) {
        await Promise.all([
            buscarEExibirMapa(especie),
            buscarEExibirImagem(especie),
            buscarEExibirStatusConservacao(especie)
        ]);
    }

    async function buscarEExibirMapa(especie) {
        const mapaDistribuicao = document.getElementById('mapaDistribuicao');
        const loadingMapa = document.getElementById('loadingMapa');
        const erroMapa = document.getElementById('erroMapa');

        if (erroMapa) erroMapa.remove();
        if (window.leafletMap) window.leafletMap.remove();
        mapaDistribuicao.style.display = 'block';
        loadingMapa.style.display = 'flex';

        try {
            const response = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${especie.usageKey}&hasCoordinate=true&limit=300`);
            const data = await response.json();
            
            const coords = data.results
                .filter(r => r.decimalLatitude && r.decimalLongitude)
                .map(r => [r.decimalLatitude, r.decimalLongitude]);

            loadingMapa.style.display = 'none';

            window.leafletMap = L.map('mapaDistribuicao').setView([0, 0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(window.leafletMap);

            if (coords.length > 0) {
                coords.forEach(c => {
                    L.circleMarker(c, { 
                        radius: 4, 
                        color: 'red', 
                        fillOpacity: 0.6 
                    }).addTo(window.leafletMap);
                });

                window.leafletMap.fitBounds(coords);
            } else {
                L.popup()
                    .setLatLng([0, 0])
                    .setContent('Nenhuma ocorrência georreferenciada encontrada')
                    .openOn(window.leafletMap);
            }
        } catch (error) {
            loadingMapa.style.display = 'none';
            mapaDistribuicao.insertAdjacentHTML('beforeend',
                '<div id="erroMapa" style="text-align:center; color:#999; padding:20px;">Erro ao carregar o mapa</div>'
            );
            console.error("Erro ao buscar e exibir mapa:", error);
        }
    }

    async function buscarEExibirImagem(especie) {
        const nomeSimples = especie.species;
        const fotoAnimal = document.getElementById('fotoAnimal');
        const fotoContainer = document.getElementById('foto');
        
        fotoContainer.style.display = 'none';
        fotoAnimal.style.display = 'none';

        try {
            const nomeBusca = encodeURIComponent(nomeSimples);
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${nomeBusca}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.thumbnail && data.thumbnail.source) {
                const imgUrl = data.thumbnail.source.replace(/\/\d+px-/, '/800px-');
                fotoAnimal.setAttribute('src', imgUrl);
                fotoAnimal.style.display = 'block';
                fotoContainer.style.display = 'block';
            } else if (data.originalimage && data.originalimage.source) {
                fotoAnimal.setAttribute('src', data.originalimage.source);
                fotoAnimal.style.display = 'block';
                fotoContainer.style.display = 'block';
            }
        } catch (error) {
            console.error("Erro ao buscar imagem na Wikipedia:", error);
        }
    }

    async function buscarEExibirStatusConservacao(especie) {
        const nomeSimples = especie.species;
        const statusConservacao = document.getElementById('statusConservacao');
        const containerBolinhas = document.querySelector('.containerBolinhas');
        const statusContainer = document.getElementById('status');
        
        statusContainer.style.display = 'none';

        const bolinha = document.querySelectorAll('#status .bolinha');
        bolinha.forEach(b => {
            b.style.visibility = 'hidden';
            b.style.backgroundColor = 'white';
            b.style.color = 'black';
        });
        if (containerBolinhas.contains(containerBolinhas.querySelector('img'))) {
            containerBolinhas.querySelector('img').remove();
        }

        const traducoes = {
            "Vulnerable": "Vulnerável (VU)",
            "Endangered": "Em Perigo (EN)",
            "Critically Endangered": "Criticamente em Perigo (CR)",
            "Least Concern": "Pouco Preocupante (LC)",
            "Near Threatened": "Quase Ameaçado (NT)",
            "Data Deficient": "Dados Insuficientes",
            "Not Evaluated": "Não Avaliado",
            "Extinct": "Extinto (EX)",
            "Extinct in the Wild": "Extinto na Natureza (EW)",
            "Conservation Dependent": "Dependente de Conservação",
            "Lower Risk / Near Threatened": "Menor Risco / Quase Ameaçado",
            "Lower Risk / Least Concern": "Menor Risco / Pouco Preocupante"
        };

        try {
            const nomeBusca = encodeURIComponent(nomeSimples);
            
            const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${nomeBusca}&language=pt&type=item&origin=*&format=json`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (!searchData.search || searchData.search.length === 0) {
                statusConservacao.innerText = 'Status: Não encontrado no Wikidata';
                statusContainer.style.display = 'block';
                return;
            }

            const qid = searchData.search[0].id;

            const dataUrl = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
            const dataRes = await fetch(dataUrl);
            const data = await dataRes.json();
            const entity = data.entities[qid];
            const statements = entity.claims.P141; // P141 é a propriedade para Status de Conservação

            if (!statements) {
                statusConservacao.innerText = 'Status: Não disponível';
                statusContainer.style.display = 'block';
                return;
            }

            // Pegar o QID do status de conservação
            const statusId = statements[0].mainsnak.datavalue.value.id;

            // Pegar o rótulo legível do status
            const labelUrl = `https://www.wikidata.org/wiki/Special:EntityData/${statusId}.json`;
            const labelRes = await fetch(labelUrl);
            const labelData = await labelRes.json();
            let statusLabel = labelData.entities[statusId].labels.en?.value || statusId;

            // Limpar "status" do final
            statusLabel = statusLabel.replace(/ status$/i, '');

            // Traduzir para português, se possível
            const traduzido = traducoes[statusLabel] || statusLabel;

            statusConservacao.innerText = `Status: ${traduzido}`;
            statusContainer.style.display = 'block';
            
            bolinha.forEach(b => {
                const textoBolinha = b.textContent;
        
                if (textoBolinha.includes("EX") && traduzido.includes("EX")) {
                    b.style.backgroundColor = 'black';
                    b.style.color = 'red';
                } else if (textoBolinha.includes("EW") && traduzido.includes("EW")) {
                    b.style.backgroundColor = 'black';
                    b.style.color = 'white';
                } else if (textoBolinha.includes("CR") && traduzido.includes("CR")) {
                    b.style.backgroundColor = '#CD3030';
                    b.style.color = 'white';
                } else if (textoBolinha.includes("EN") && traduzido.includes("EN")) {
                    b.style.backgroundColor = '#CD6630';
                    b.style.color = 'white';
                } else if (textoBolinha.includes("VU") && traduzido.includes("VU")) {
                    b.style.backgroundColor = '#CD9A00';
                    b.style.color = 'white';
                } else if (textoBolinha.includes("NT") && traduzido.includes("NT")) {
                    b.style.backgroundColor = '#006666';
                    b.style.color = 'white';
                } else if (textoBolinha.includes("LC") && traduzido.includes("LC")) {
                    b.style.backgroundColor = '#006666';
                    b.style.color = 'white';
                }
                
                b.style.visibility = 'visible';
            });
            
            const imgIUCN = document.createElement('img');
            imgIUCN.title = 'Classificação IUCN';
            imgIUCN.src = 'https://upload.wikimedia.org/wikipedia/commons/4/41/Status_iucn3.1pt.png';
            imgIUCN.alt = 'Classificação IUCN';
            imgIUCN.style.width = '25%';
            imgIUCN.style.height = 'auto';
            containerBolinhas.appendChild(imgIUCN);

        } catch (error) {
            console.error("Erro ao buscar status de conservação no Wikidata:", error);
            statusContainer.style.display = 'none';
        }
    }

    function exibirMensagemVazia(termoBusca) {
        document.getElementById('nomeCientifico').textContent = 
            `Nenhuma espécie encontrada para: "${termoBusca}"`;

        document.querySelectorAll(
            '#reino, #filo, #classe, #ordem, #familia, #genero, #especie'
        ).forEach(el => {
            el.textContent = "";
        });

        document.getElementById('mapaDistribuicao').style.display = 'none';
        document.getElementById('foto').style.display = 'none';
        document.getElementById('status').style.display = 'none';

        document.getElementById('resultado').classList.add('mostrar');
    }

});

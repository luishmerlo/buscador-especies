# buscador-especies  
### Busca e Exibição de Dados Taxonômicos e de Conservação (GBIF + Wikidata + Wikipedia)

Aplicação interativa desenvolvida em HTML, CSS e JavaScript para pesquisar espécies de qualquer reino biológico disponível no GBIF e exibir seus dados taxonômicos, distribuição geográfica e status de conservação.

O projeto integra múltiplas APIs públicas e apresenta os resultados em uma interface responsiva e amigável.

---

## Demonstração  
Visualize o projeto online:  
<a href="https://luishmerlo.github.io/buscador-especies">Clique aqui para acessar</a>

---

## Funcionalidades  

- Pesquisa de espécies por **nome científico** - Exemplos: Sabiá-laranjeira -> **Turdus rufiventris** | Onça-pintada -> **Panthera onca** | Tubarão-branco -> **Carcharodon carcharias**
- Verificação taxonômica automática via **GBIF Species Match API**  
- Exibição hierárquica completa:
  - Reino, Filo, Classe, Ordem, Família, Gênero, Espécie
- Mapa mundial com registros georreferenciados (GBIF Occurrence)
- Imagem ilustrativa da espécie via **Wikipedia API**
- Status de conservação segundo IUCN registrado no **Wikidata**
- Feedback visual em caso de erro, espécies não encontradas ou resultados parciais

---

## Tecnologias e APIs Utilizadas  

### Core  
- **HTML5**
- **CSS3 com Media Queries** para responsividade
- **JavaScript Vanilla (ES6+)**

### Integrações Externas  
- **GBIF Species API** - validação taxonômica  
- **GBIF Occurrence API** - pontos no mapa  
- **Wikipedia REST API** - obtenção automática de imagem  
- **Wikidata API** - status de conservação (IUCN/Red List)  
- **Leaflet.js + OpenStreetMap** – renderização do mapa mundial  

---

## Estrutura do Projeto  

```
├── index.html # Estrutura principal e containers de resultado  
├── styles.css # Layout, cores e responsividade com media queries  
└── script.js  # Lógica da aplicação e chamadas de API
```

## Decisões Técnicas  

O projeto prioriza:
- **Vanilla JS** sem frameworks
- **Chamadas assíncronas (async/await)**
- **Tratamento de erros** para falhas de rede e dados ausentes  
- **Renderização progressiva paralela**: taxonomia imediata, mapa / imagem / status carregados conforme cada API responde
- Mapa **desmontado e recriado** a cada busca para evitar artefatos
- O script é separado em funções menores, cada uma responsável por uma parte do trabalho   

O CSS utiliza **media queries** para telas pequenas, médias e grandes, garantindo navegação confortável em celulares, tablets e desktops.

---

## Como rodar o projeto localmente  

Clone o repositório:
```bash
git clone https://github.com/luishmerlo/buscador-especies.git
```

Entre no diretório:
```bash
cd buscador-especies
```

Abra o arquivo no navegador:
```bash
index.html
```

## Licença
Projeto desenvolvido para fins de portfólio e aprendizado.

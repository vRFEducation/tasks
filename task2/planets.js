async function getReptileResidentPlanets() {
    const baseUrl = 'https://swapi.dev/api';

    async function getAllData(url) {
        let results = [];
        while (url) {
            const rawData = await fetch(url);
            const jsonData = await rawData.json();
            results = results.concat(jsonData.results);            
            url = jsonData.next;
        }
        return results;
    }

    const allPlanets = await getAllData(`${baseUrl}/planets/`);
    const filteredPlanets = allPlanets.filter(planet => planet.films.length > 0 && planet.residents.length > 0);

    const allSpecies = await getAllData(`${baseUrl}/species/`);
    const reptileSpecies = allSpecies.filter(species => species.classification.toLowerCase() === 'reptile').map(species => species.url);

    const planetPromises = filteredPlanets.map(async planet => {
        const residentPromises = planet.residents.map(async residentURL => {
            const rawData = await fetch(residentURL);
            const resident = await rawData.json();
            return reptileSpecies.includes(resident.species[0]);
        });
        const reptileResidents = await Promise.all(residentPromises);
        return reptileResidents.includes(true) ? planet.name : null;
    });

    const planetsWithReptileResidents = await Promise.all(planetPromises);

    return planetsWithReptileResidents.filter(planet => planet !== null);
}

getReptileResidentPlanets()
    .then(planets => console.log(planets))
    .catch(err => console.error(err));

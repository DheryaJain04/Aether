function generateAPA(paper){
    const authors = paper.authorships
        .map(authorship=>authorship.author.display_name)
        .join(", ");

    const title = paper.display_name;
    const year = paper.publication_year;
    const journal =
        paper.primary_location?.source?.display_name ||
        "Unknown Publication";
    const doi = paper.doi || "";

    return `${authors} (${year}). ${title}. ${journal}. ${doi}`;
}

function generateIEEE(paper){
    const authors = paper.authorships
        .map(authorship=>authorship.author.display_name)
        .join(", ");

    const title = paper.display_name;
    const year = paper.publication_year;
    const journal =
        paper.primary_location?.source?.display_name ||
        "Unknown Publication";
    const doi = paper.doi || "";

    return `${authors}, "${title}," ${journal}, ${year}. ${doi}`;
}

function generateCitations(paper){
    return {
        apa:generateAPA(paper),
        ieee:generateIEEE(paper)
    };
}

module.exports = {
    generateCitations
};
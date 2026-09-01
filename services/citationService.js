function extractAuthors(paper){
    if(Array.isArray(paper.authorships) && paper.authorships.length > 0){
        const names = paper.authorships
            .map(a => a.author?.display_name || a.name || "")
            .filter(Boolean);
        if(names.length > 0) return names.join(", ");
    }

    if(Array.isArray(paper.authors) && paper.authors.length > 0){
        const names = paper.authors
            .map(a => (typeof a === "string" ? a : (a.name || a.author?.display_name || "")))
            .filter(Boolean);
        if(names.length > 0) return names.join(", ");
    }

    if(typeof paper.authors === "string" && paper.authors.trim()){
        return paper.authors.replace(/\s*•\s*/g, ", ");
    }

    return "Scholarly Contributor";
}

function generateAPA(paper){
    const authors = extractAuthors(paper);
    const title = paper.display_name || paper.title || "Untitled Research Paper";
    const year = paper.publication_year || paper.year || new Date().getFullYear();
    const journal =
        paper.primary_location?.source?.display_name ||
        paper.journal ||
        "Academic Publication";
    const doi = paper.doi ? `https://doi.org/${paper.doi.replace("https://doi.org/", "")}` : "";

    return `${authors} (${year}). ${title}. ${journal}.${doi ? " " + doi : ""}`;
}

function generateIEEE(paper){
    const authors = extractAuthors(paper);
    const title = paper.display_name || paper.title || "Untitled Research Paper";
    const year = paper.publication_year || paper.year || new Date().getFullYear();
    const journal =
        paper.primary_location?.source?.display_name ||
        paper.journal ||
        "Academic Publication";
    const doi = paper.doi ? ` doi: ${paper.doi.replace("https://doi.org/", "")}` : "";

    return `${authors}, "${title}," ${journal}, ${year}.${doi}`;
}

function generateMLA(paper){
    const authors = extractAuthors(paper);
    const title = paper.display_name || paper.title || "Untitled Research Paper";
    const year = paper.publication_year || paper.year || new Date().getFullYear();
    const journal =
        paper.primary_location?.source?.display_name ||
        paper.journal ||
        "Academic Publication";

    return `${authors}. "${title}." ${journal} (${year}).`;
}

function generateCitations(paper){
    return {
        apa: generateAPA(paper),
        ieee: generateIEEE(paper),
        mla: generateMLA(paper)
    };
}

module.exports = {
    generateCitations
};
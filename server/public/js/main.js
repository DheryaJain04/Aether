const input = document.getElementById("searchInput");

const topics = [
    "Large Language Models",
    "Quantum Computing",
    "Cancer Detection",
    "Climate Change",
    "Cybersecurity",
    "Machine Learning",
    "Blockchain"
];

let index = 0;

//to autorotate the placeholder in searchbar
setInterval(() => {
    index = (index + 1) % topics.length;
    input.placeholder = `Search "${topics[index]}"...`;
}, 2500);
const array_genes = []

for(let i=0;i<5;i++){
    const gene = {
        nome: prompt("Qual o nome?"),
        estrelas: Number(prompt("Estrelas?"))
    };
    array_genes.push(gene);
}


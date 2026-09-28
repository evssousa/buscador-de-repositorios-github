console.log("número 1")
console.log("número 2")

// só depois de 1 segundo que o console.log("número 3") será adicionado
// o setTimeout será executado em segundo plano
setTimeout(() => {
    console.log("número 3")
}, 1000)

console.log("número 4")

// Saída
/**
 * número 1
 * número 2
 * número 4
 * número 3
 */
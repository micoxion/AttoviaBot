let mineRate = 1
let ore = 0
let oreHealth = 1
let damage = 1

export async function calculateOre(): Promise<number> {
    let timeInSecondsPassed = 10
    return Math.floor((mineRate * damage * timeInSecondsPassed) / oreHealth);
}
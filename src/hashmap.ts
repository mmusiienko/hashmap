interface RenderableHashMap<K, V> {
    insert(key: K, value: V, rerender: () => Promise<void>): Promise<void>
    get(key: K, rerender: () => Promise<void>): Promise<V | undefined>
    delete(key: K, rerender: () => Promise<void>): Promise<void>
    setHash(hash: OrderHashFunction<K>): void
}

interface HashMap<K, V> {
    insert(key: K, value: V): void
    get(key: K): V | undefined
    delete(key: K): void
    setHash(hash: OrderHashFunction<K>): void
}

export type HashFunction<K> = (key: K) => number

export type OrderHashFunction<K> = (key: K, i: number) => number

type data<K, V> = ([K, V] | undefined | "DELETED")[]

export class RenderableOpenAddressingHashMap<V> implements RenderableHashMap<number, V> {

    private data: data<number, V> = []

    private size = 0

    private lastHash: [number, number] = [0, 0]

    private timesCollided: number = 0

    private hash: OrderHashFunction<number> = (key: number) => 0

    constructor (dataSize: number, hashFunc: OrderHashFunction<number>) {
        this.hash = hashFunc
        this.size = dataSize
        this.data = new Array(this.size).fill(undefined)
    }

    async insert(key: number, value: V, rerender: () => Promise<void>) {
        let i = 0

        while (i < this.size) {
            this.lastHash = [key, this.hash(key, i)]
            const item = this.data[this.lastHash[1]]
            
            if (item === undefined || item === "DELETED" || item[0] === key) break
            i++
            await rerender()
        }
        this.timesCollided += i
        if (i === this.size) return

        this.data[this.lastHash[1]] = [key, value]

        await rerender()
    }

    async get(key: number, rerender: () => Promise<void>) {
        let i = 0

        while (i < this.size) {
            this.lastHash = [key, this.hash(key, i)]

            await rerender()
            const item = this.data[this.lastHash[1]]
            if (item === undefined) return undefined
            if (item[0] === key  && item !== "DELETED") return item[1]
            
            i++
        }

        return undefined
    }

    async delete(key: number, rerender: () => Promise<void>) {
        let i = 0

        while (i < this.size) {
            this.lastHash = [key, this.hash(key, i)]

            await rerender()
            const data = this.data[this.lastHash[1]]

            i++

            if (data === undefined) return
            if (data === "DELETED") continue
            if (data[0] === key) {
                this.data[this.lastHash[1]] = "DELETED"
                await rerender()
                return
            }
        }
    }

    setHash(hash: OrderHashFunction<number>): void {
        this.hash = hash
    }

    getData(): data<number, V> {
        return this.data
    }

    getLastHash(): [number, number] {
        return this.lastHash
    }

    getTimesCollided(): number {
        return this.timesCollided
    }
}

export class OpenAddressingHashMap<V> implements HashMap<number, V> {

    private data: data<number, V> = []

    private size = 0

    private lastHash: [number, number] = [0, 0]

    private timesCollided: number = 0

    private hash: OrderHashFunction<number> = (key: number) => 0

    constructor (dataSize: number, hashFunc: OrderHashFunction<number>) {
        this.hash = hashFunc
        this.size = dataSize
        this.data = new Array(this.size).fill(undefined)
    }

    insert(key: number, value: V) {
        let i = 0

        while (i < this.size) {
            this.lastHash = [key, this.hash(key, i)]
            const item = this.data[this.lastHash[1]]
            
            if (item === undefined || item === "DELETED" || item[0] === key) break
            i++
        }
        this.timesCollided += i
        if (i === this.size) return

        this.data[this.lastHash[1]] = [key, value]
    }

    get(key: number) {
        let i = 0

        while (i < this.size) {
            this.lastHash = [key, this.hash(key, i)]

            const item = this.data[this.lastHash[1]]
            if (item === undefined) return undefined
            if (item[0] === key && item !== "DELETED") return item[1]
            
            i++
        }

        return undefined
    }

    delete(key: number) {
        let i = 0

        while (i < this.size) {
            this.lastHash = [key, this.hash(key, i)]
            i++
            const data = this.data[this.lastHash[1]]
            if (data === undefined) return
            if (data === "DELETED") continue
            if (data[0] === key) {
                this.data[this.lastHash[1]] = "DELETED"
                return
            }
        }
    }

    setHash(hash: OrderHashFunction<number>): void {
        this.hash = hash
    }

    getData(): data<number, V> {
        return this.data
    }

    getLastHash(): [number, number] {
        return this.lastHash
    }

    getTimesCollided(): number {
        return this.timesCollided
    }
}

// export class RenderableChainingHashMap<V> implements RenderableHashMap<number, V> {

//     private data: data<number, V> = []

//     private size = 0

//     private lastHash: [number, number] = [0, 0]

//     private timesCollided: number = 0

//     private hash: OrderHashFunction<number> = (key: number) => 0

//     constructor (dataSize: number, hashFunc: OrderHashFunction<number>) {
//         this.hash = hashFunc
//         this.size = dataSize
//         this.data = new Array(this.size).fill(undefined)
//     }

//     async insert(key: number, value: V, rerender: () => Promise<void>) {
//         let i = 0

//         while (i < this.size) {
//             this.lastHash = [key, this.hash(key, i)]
//             const item = this.data[this.lastHash[1]]
            
//             if (item === undefined || item === "DELETED" || item[0] === key) break
//             i++
//             await rerender()
//         }
//         this.timesCollided += i
//         if (i === this.size) return

//         this.data[this.lastHash[1]] = [key, value]

//         await rerender()
//     }

//     async get(key: number, rerender: () => Promise<void>) {
//         let i = 0

//         while (i < this.size) {
//             this.lastHash = [key, this.hash(key, i)]

//             await rerender()
//             const item = this.data[this.lastHash[1]]
//             if (item === undefined || item === "DELETED") return undefined
//             if (item[0] === key) return item[1]
            
//             i++
//         }

//         return undefined
//     }

//     async delete(key: number, rerender: () => Promise<void>) {
//         let i = 0

//         while (i < this.size) {
//             this.lastHash = [key, this.hash(key, i)]

//             await rerender()
//             const data = this.data[this.lastHash[1]]
//             i++
//             if (data === undefined) return
//             if (data === "DELETED") continue
//             if (data[0] === key) {
//                 this.data[this.hash(key, 0)] = "DELETED"
//                 await rerender()
//                 return
//             }
//         }
//     }

//     setHash(hash: OrderHashFunction<number>): void {
//         this.hash = hash
//     }

//     getData(): data<number, V> {
//         return this.data
//     }

//     getLastHash(): [number, number] {
//         return this.lastHash
//     }

//     getTimesCollided(): number {
//         return this.timesCollided
//     }
// }
import { useEffect, useState } from 'react';
import './App.css';
import { OrderHashFunction, OpenAddressingHashMap, RenderableOpenAddressingHashMap, HashFunction } from './hashmap';
import { NumInput } from './components/numInput';
import { HashPrimeSelect, hashPrimeFuncOption } from './components/hashPrimeSelect';

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

type hashFuncOption = "LinearProbing" | "QuadraticProbing" | "DoubleHashing"


const App = () => {
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showVisualization, setShowVisualization] = useState<boolean>(true)
  const [showInsertPopup, setShowInsertPopup] = useState<boolean>(false)
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false)
  const [showGetPopup, setShowGetPopup] = useState<boolean>(false)

  const [dataSize, setDataSize] = useState<number>(37)
  const [animSpeed, setAnimSpeed] = useState<number>(10)
  const [totalCollisions, setTotalCollisions] = useState<number | undefined>(undefined)
  const [insertTimes, setInsertTimes] = useState<number>(Math.floor(dataSize / 2))
  const [benchTimes, setBenchTimes] = useState<number>(10)
  const [mapObj, setMapObj] = useState<{ map: RenderableOpenAddressingHashMap<number> }>({ map: new RenderableOpenAddressingHashMap(dataSize, (k, i) => ((k % dataSize) + i) % dataSize) })
  const [hashFuncType, setHashFuncType] = useState<hashFuncOption>("LinearProbing")

  const [hashPrimeFuncType, setHashPrimeFuncType] = useState<hashPrimeFuncOption>("Division")
  const [hashPrime2FuncType, setHashPrime2FuncType] = useState<hashPrimeFuncOption>("Division")

  const [key, setKey] = useState<number>()
  const [value, setValue] = useState<number>()
  const [gottenValue, setGottenValue] = useState<number>()

  const [c1, setC1] = useState<number>(10)
  const [c2, setC2] = useState<number>(10)

  const [A1, setA1] = useState<number>((Math.sqrt(5) - 1) / 2)
  const [A2, setA2] = useState<number>((Math.sqrt(5) - 1) / 2)

  const [M1, setM1] = useState<number>(dataSize)
  const [M2, setM2] = useState<number>(dataSize)

  const { map } = mapObj

  const primeFunctTypeToPrimeFuncStr: Record<hashPrimeFuncOption, (m: number, a: number) => string> = {
    Division: (m, a) => `k mod ${m}`,
    Multiplication: (m, a) => `floor(${m}(${a}k mod 1))`,
    UniversalHashing: (m, a) => `k mod ${m}`
  }

  const hashFuncTypeToHashFuncStr: Record<hashFuncOption, string> = {
    LinearProbing: `((${primeFunctTypeToPrimeFuncStr[hashPrimeFuncType](M1, A1)}) + i) mod ${dataSize}`,
    QuadraticProbing: `((${primeFunctTypeToPrimeFuncStr[hashPrimeFuncType](M1, A1)}) + ${c1}*i + ${c2}*i**2) mod ${dataSize}`,
    DoubleHashing: `((${primeFunctTypeToPrimeFuncStr[hashPrimeFuncType](M1, A1)}) + i * (${primeFunctTypeToPrimeFuncStr[hashPrime2FuncType](M2, A2)})) mod ${dataSize}`
  }

  const primeFunctTypeToPrimeFunc: Record<hashPrimeFuncOption, (k: number, m: number, a: number) => number> = {
    Division: (k, m, a) => k % m,
    Multiplication: (k, m, a) => Math.floor(m * ((a * k) % 1)),
    UniversalHashing: (k, m, a) => k % m,
  }

  const hashFuncTypeToHashFunc: Record<hashFuncOption, OrderHashFunction<number>> = {
    LinearProbing: (k, i) => (primeFunctTypeToPrimeFunc[hashPrimeFuncType](k, M1, A1) + i) % dataSize,
    QuadraticProbing: (k, i) => (primeFunctTypeToPrimeFunc[hashPrimeFuncType](k, M1, A1) + c1 * i + c2 * (i ** 2)) % dataSize,
    DoubleHashing: (k, i) => (primeFunctTypeToPrimeFunc[hashPrimeFuncType](k, M1, A1) + i * primeFunctTypeToPrimeFunc[hashPrime2FuncType](k, M2, A2)) % dataSize,
  }

  const clear = () => {
    setMapObj({ map: new RenderableOpenAddressingHashMap(dataSize, hashFuncTypeToHashFunc[hashFuncType]) })
    setTotalCollisions(0)
  }

  useEffect(() => {
    clear()
    setInsertTimes(Math.min(insertTimes, dataSize))
    setM1(Math.min(M1, dataSize))
    setM2(Math.min(M2, dataSize))
  }, [dataSize])

  useEffect(() => setMapObj({ map: new RenderableOpenAddressingHashMap(dataSize, hashFuncTypeToHashFunc[hashFuncType]) }), [A1, A2, M1, M2, c1, c2, hashFuncType, hashPrimeFuncType, hashPrime2FuncType, dataSize])

  const simulateInsert = async () => {
    let i = 0
    while (i < insertTimes) {
      const key = Math.floor(Math.random() * 10000)
      const value = Math.floor(Math.random() * 10000)

      await map.insert(key, value, async () => {
        setMapObj({ ...mapObj })
        setTotalCollisions(map.getTimesCollided())
        await sleep(animSpeed)
      })
      i++
    }
  }

  const simulateFast = (map: OpenAddressingHashMap<number>) => {
    let i = 0
    while (i < insertTimes) {
      const key = Math.floor(Math.random() * 10000)
      const value = Math.floor(Math.random() * 10000)

      map.insert(key, value)
      i++
    }
  }

  const bench = () => {
    let i = 0
    let total = 0
    while (i < benchTimes) {
      const map = new OpenAddressingHashMap<number>(dataSize, hashFuncTypeToHashFunc[hashFuncType])
      simulateFast(map)
      i++
      console.log(map.getTimesCollided())
      total += map.getTimesCollided() / benchTimes
    }
    total = Math.floor(total)
    setTotalCollisions(total)
  }

  return (
    <div className="App w-full h-full flex flex-col items-center justify-center p-1 space-y-2">
      <div className='flex space-x-1 items-center border-black rounded-md border p-2'>
        <span>Show settings?</span>
        <input checked={showSettings} onChange={e => setShowSettings(e.target.checked)} type='checkbox' />
      </div>
      {showSettings &&
        <>
          <div className='flex flex-col'>
            <div className='flex space-x-1 items-center rounded-md border p-2'>
              <span>Times to insert:</span>
              <NumInput value={insertTimes} min={1} max={dataSize} onChange={num => setInsertTimes(num)} />
              <input value={insertTimes} onChange={e => setInsertTimes(parseInt(e.target.value))} type='range' min={1} max={dataSize} />
            </div>
            <div className='flex space-x-1 items-center rounded-md border p-2'>
              <span>Bench times:</span>
              <NumInput value={benchTimes} min={1} max={10000} onChange={num => setBenchTimes(num)} />
              <input value={benchTimes} onChange={e => setBenchTimes(parseInt(e.target.value))} type='range' min={1} max={10000} />
            </div>
            <div className='flex space-x-1 items-center rounded-md border p-2'>
              <span>Internal array size:</span>
              <NumInput value={dataSize} min={1} max={3000} onChange={num => setDataSize(num)} />
              <input value={dataSize} onChange={e => setDataSize(parseInt(e.target.value))} type='range' min={5} max={3000} />
            </div>
            <div className='flex space-x-1 items-center rounded-md border p-2'>
              <span>Hash function type:</span>
              <select onChange={e => setHashFuncType(e.target.value as hashFuncOption)} value={hashFuncType}>
                <option value={"LinearProbing"}>Linear Probing</option>
                <option value={"QuadraticProbing"}>Quadratic Probing</option>
                <option value={"DoubleHashing"}>Double Hashing</option>
              </select>
            </div>
            <div className='flex flex-col space-y-1 items-center rounded-md border p-2'>
              {hashFuncType === "LinearProbing" &&
                <span>h(k, i) = (h'(k) + i) mod m</span>
              }
              {hashFuncType === "QuadraticProbing" &&
                <>
                  <span>h(k, i) = (h'(k) + c<sub>1</sub>i + c<sub>2</sub>i<sup>2</sup>) mod m</span>
                  <div className='flex space-x-1'>
                    <span>c<sub>1</sub></span>
                    <NumInput value={c1} min={1} max={3000} onChange={num => setC1(num)} />
                    <input value={c1} onChange={e => setC1(parseInt(e.target.value))} type='range' min={1} max={3000} />
                  </div>
                  <div className='flex space-x-1'>
                    <span>c<sub>2</sub></span>
                    <NumInput value={c2} min={1} max={3000} onChange={num => setC2(num)} />
                    <input value={c2} onChange={e => setC2(parseInt(e.target.value))} type='range' min={1} max={3000} />
                  </div>
                </>
              }

              {hashFuncType === "DoubleHashing" &&
                <span>h(k, i) = (h<sub>1</sub>(k) + ih<sub>2</sub>(k)) mod m</span>
              }

              {hashFuncType !== "DoubleHashing" ?
                <HashPrimeSelect name="h'(k)" value={hashPrimeFuncType} onChange={val => setHashPrimeFuncType(val)} A={A1} onAChange={a => setA1(a)} M={M1} onMChange={m => setM1(m)} />
                :
                <>
                  <HashPrimeSelect name={<>h<sub>1</sub>(k)</>} value={hashPrimeFuncType} onChange={val => setHashPrimeFuncType(val)} A={A1} onAChange={a => setA1(a)} M={M1} onMChange={m => setM1(m)} />
                  <HashPrimeSelect name={<>h<sub>2</sub>(k)</>} value={hashPrime2FuncType} onChange={val => setHashPrime2FuncType(val)} A={A2} onAChange={a => setA2(a)} M={M2} onMChange={m => setM2(m)} />
                </>
              }
            </div>
          </div>
        </>
      }
      <div>Hash function: {hashFuncTypeToHashFuncStr[hashFuncType]}</div>
      <button className='bg-red-500 w-36 h-16 text-white border border-white rounded-md' onClick={bench}>Bench Insert</button>
      {totalCollisions !== undefined && <span>Total collisions: {totalCollisions}</span>}

      <div className='flex space-x-1 items-center border-black rounded-md border p-2'>
        <span>Show visualization?</span>
        <input checked={showVisualization} onChange={e => setShowVisualization(e.target.checked)} type='checkbox' />
      </div>

      {showVisualization &&
        <>

          <div className='flex space-x-1 items-center border-black rounded-md border p-2'>
            <span>Simulation speed:</span>
            <NumInput value={animSpeed} min={0} max={3000} onChange={num => setAnimSpeed(num)} />
            <input value={animSpeed} onChange={e => setAnimSpeed(parseInt(e.target.value))} type='range' min={0} max={3000} />
          </div>
          <div>{`${map.getLastHash()[0]}->${map.getLastHash()[1]}`}</div>
          <div className={`grid grid-cols-12 text-sm`}>
            {map.getData().map((cell, i) =>
              <div key={i} className={`w-16 h-16 border border-white text-white flex flex-col items-center justify-center ${map.getLastHash()[1] === i ? "bg-yellow-600" : "bg-black "}`}>
                <span>{i}</span>
                {cell ?
                  <div className='flex flex-col items-center space-y-1'>
                    <span>K-{cell[0]}</span>
                    <span>V-{cell[1]}</span>
                  </div>
                  : "Empty"}
              </div>
            )}

          </div>
          <div className='flex space-x-2'>
            <button className='bg-red-500 w-36 h-16 text-white border border-white rounded-md' onClick={clear}>Clear data</button>
            <button className='bg-red-500 w-36 h-16 text-white border border-white rounded-md' onClick={simulateInsert}>Random Insert</button>
            <div className='flex flex-col space-y-2'>
              <button className='bg-red-500 w-36 h-16 text-white border border-white rounded-md' onClick={() => setShowInsertPopup(true)}>Insert</button>
              {showInsertPopup &&
                <div className='flex flex-col space-y-2'>
                  <button className='w-full bg-black px-2 py-1 rounded-md text-white' onClick={() => setShowInsertPopup(false)}>CLOSE</button>
                  <div className='flex space-x-1'>
                    <span className='w-12'>Key: </span>
                    <input type="number" className='border border-1 rounded-md w-20' value={key} onChange={e => setKey(parseInt(e.target.value))} />
                  </div>
                  <div className='flex space-x-1'>
                    <span>Value:</span>
                    <input type="number" className='border border-1 rounded-md w-20' value={value} onChange={e => setValue(parseInt(e.target.value))} />
                  </div>
                  <button className='bg-green-500 px-2 py-1 rounded-md text-white' onClick={async () => {
                    if (key === undefined || value === undefined) return
                    await map.insert(key, value, async () => {
                      setMapObj({ ...mapObj })
                      setTotalCollisions(map.getTimesCollided())
                      await sleep(animSpeed)
                    })
                  }}>Insert</button>
                </div>
              }
            </div>
            <div className='flex flex-col space-y-2'>
              <button className='bg-red-500 w-36 h-16 text-white border border-white rounded-md' onClick={() => setShowDeletePopup(true)}>Delete</button>
              {showDeletePopup &&
                <div className='flex flex-col space-y-2'>
                  <button className='w-full bg-black px-2 py-1 rounded-md text-white' onClick={() => setShowDeletePopup(false)}>CLOSE</button>
                  <div className='flex space-x-1'>
                    <span>Key:</span>
                    <input type="number" className='border border-1 rounded-md w-20' value={key} onChange={e => setKey(parseInt(e.target.value))} />
                  </div>
                  <button className='bg-green-500 px-2 py-1 rounded-md text-white' onClick={async () => {
                    if (key === undefined) return
                    await map.delete(key, async () => {
                      setMapObj({ ...mapObj })
                      setTotalCollisions(map.getTimesCollided())
                      await sleep(animSpeed)
                    })
                  }}>Delete</button>
                </div>
              }
            </div>
            <div className='flex flex-col space-y-2'>
              <button className='bg-red-500 w-36 h-16 text-white border border-white rounded-md' onClick={() => setShowGetPopup(true)}>Get</button>
              {showGetPopup &&
                <div className='flex flex-col space-y-2'>
                  <button className='w-full bg-black px-2 py-1 rounded-md text-white' onClick={() => setShowGetPopup(false)}>CLOSE</button>
                  <div className='flex space-x-1'>
                    <span>Key:</span>
                    <input type="number" className='border border-1 rounded-md w-20' value={key} onChange={e => setKey(parseInt(e.target.value))} />
                  </div>
                  <button className='bg-green-500 px-2 py-1 rounded-md text-white' onClick={async () => {
                    if (key === undefined) return
                    setGottenValue(await map.get(key, async () => {
                      setMapObj({ ...mapObj })
                      setTotalCollisions(map.getTimesCollided())
                      await sleep(animSpeed)
                    }))
                  }}>Get</button>

                  <span>{gottenValue}</span>
                </div>
              }
            </div>
          </div>
        </>
      }
    </div>
  );
}

export default App;

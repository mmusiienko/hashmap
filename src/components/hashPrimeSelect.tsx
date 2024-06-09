import { ReactNode } from "react"
import { NumInput } from "./numInput"

export type hashPrimeFuncOption = "Division" | "Multiplication" | "UniversalHashing"

interface IHashPrimeSelect {
    name: ReactNode
    value: hashPrimeFuncOption
    onChange: (val: hashPrimeFuncOption) => void
    A: number
    onAChange: (val: number) => void
    M: number
    onMChange: (val: number) => void
}

export const HashPrimeSelect: React.FC<IHashPrimeSelect> = ({ name, value, onChange, A, onAChange, M, onMChange, }) => {
    return (
        <div className="flex flex-col space-y-2">
            <div className='flex space-x-1'>
                <span>{name} type:</span>
                <select onChange={e => onChange(e.target.value as hashPrimeFuncOption)} value={value}>
                    <option value={"Division"}>Division method</option>
                    <option value={"Multiplication"}>Multiplication method</option>
                    {/* <option value={"UniversalHashing"}>Universal hashing</option> */}
                </select>
            </div>
            {value === "Division" &&
                <>
                    <span>{name}: k mod m</span>
                    <div>
                    <span>M:</span>
                    <input min={1} max={1000} type="number" className="px-2 border border-1 rounded-md" value={M} onChange={e => {
                            const num = parseFloat(e.target.value)
                            if (num < 0) return 
                            onMChange(num)
                    }}/>
                    </div>
                </>
            }
            {value === "Multiplication" &&
                <>
                    <span>{name}: floor(m(kA mod 1))</span>
                    <div className='flex space-x-1'>
                        <span>A:</span>
                        <input min={0} max={1} type="number" className="px-2 border border-1 rounded-md" value={A} onChange={e => {
                            const num = parseFloat(e.target.value)
                            if (num < 0 || num > 1) return 
                            onAChange(num)
                        }}/>
                        <span>M:</span>
                        <input min={1} max={1000} type="number" className="px-2 border border-1 rounded-md" value={M} onChange={e => {
                            const num = parseFloat(e.target.value)
                            if (num < 0) return 
                            onMChange(num)
                        }}/>
                    </div>
                </>
            }
        </div>
    )
}
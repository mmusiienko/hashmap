interface INumInput {
    value: number
    onChange: (num: number) => void
    min: number
    max: number
}

export const NumInput: React.FC<INumInput>= ({ value, onChange, min, max }) => {
    return (
        <input value={value} type='number' className='w-16 border border-1 rounded-md px-1' onChange={e => {
            const num = parseInt(e.target.value)
            if (Number.isNaN(num) || num < min || num > max) return
            onChange(num)
        }} />
    )
}
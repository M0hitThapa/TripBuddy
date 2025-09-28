import Image from 'next/image'
import React from 'react'


export const SelectBudgetOptions = [
  {
    id: 1,
    title: 'Cheap',
    desc: 'Stay conscious of costs',
    image:'/low.png',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 2,
    title: 'Moderate',
    desc: 'Keep cost on the average side',
    image:'/middle.png',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 3,
    title: 'Luxury',
    desc: 'Don\'t worry about cost',
    image:'/high.png',
    color: 'bg-purple-100 text-purple-600'
  },
]

type BudgetUiProps = { onSelectedOption: (value: string) => void }

function BudgetUi({onSelectedOption}: BudgetUiProps) {
  return (
     <div className='mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 max-w-sm'>
            {SelectBudgetOptions.map((item, index) => (
                <div key={index} className='py-2 border shadow-input rounded-lg bg-white hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col justify-center hover:bg-rose-200 items-center' 
                onClick={() => onSelectedOption(item.title+":"+item.desc)}>
                  <div className='bg-gray-50 border-2 border-neutral-200 rounded-md flex items-center justify-center'>
                      <Image src={item.image} alt='image' height={50} width={50} />
                  </div>
                    <h2 className='text-md font-semibold text-neutral-700 text-shadow-sm'>{item.title}</h2>
                </div>
            ))}
        </div>
  )
}

export default BudgetUi
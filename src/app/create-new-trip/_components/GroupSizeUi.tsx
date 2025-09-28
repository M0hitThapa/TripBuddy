import Image from 'next/image'
import React from 'react'


export const SelectTravelsList = [
  {
    id: 1,
    title: 'Solo',
    desc: 'A sole traveler in exploration',
    image:'/single.png',
    people: '1'
  },
  {
    id: 2,
    title: 'Couple',
    desc: 'Two travelers in tandem',
    image: '/couple.png',
    people: '2 People'
  },
  {
    id: 3,
    title: 'Family',
    desc: 'A group of fun loving adventurers',
    image: '/family.png',
    people: '3 to 5 People'
  },
  {
    id: 4,
    title: 'Friends',
    desc: 'A bunch of thrill-seekers',
    image: '/friend.png',
    people: '5 to 10 People'
  },
]


type GroupSizeUiProps = { onSelectedOption: (value: string) => void }

function GroupSizeUi({onSelectedOption}: GroupSizeUiProps) {
  return (
    <div className='mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 max-w-sm'>
        {SelectTravelsList.map((item, index) => (
            <div key={index} className='py-2 border shadow-input rounded-lg bg-white hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col justify-center hover:bg-rose-200 items-center' 
            onClick={() => onSelectedOption(item.title+":"+item.people)}>
              <div className='bg-gray-50 border-2 border-neutral-200 rounded-md flex items-center justify-center'>
                  <Image src={item.image} alt='image' height={50} width={50} />
              </div>
                <h2 className='text-md font-semibold text-neutral-700 text-shadow-sm'>{item.title}</h2>
            </div>
        ))}
    </div>
  )
}

export default GroupSizeUi
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <div className=' min-h-screen bg-[url(/background-image.jpg)] bg-no-repeat bg-center bg-cover'>
   <div className='flex items-center justify-center h-screen bg-white/60'>
     <SignIn />
   </div>
  </div>
}
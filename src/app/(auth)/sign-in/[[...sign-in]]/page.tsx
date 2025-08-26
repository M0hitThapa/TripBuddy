import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <div className=' min-h-screen bg-[url(https://images.pexels.com/photos/158827/field-corn-air-frisch-158827.jpeg)]'>
   <div className='flex items-center justify-center h-screen bg-white/60'>
     <SignIn />
   </div>
  </div>
}
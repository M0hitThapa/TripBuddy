import { SignOutButton } from '@clerk/nextjs'
import React from 'react'

function SignOutButtons() {
  return (
    <div><SignOutButton>
                        <button className='px-4 py-2 bg-teal-700 hover:bg-emerald-600 text-white rounded-sm  shadow-md transition-all duration-300 cursor-pointer font-semibold' >
                            SignOut
                        </button>
                    </SignOutButton>
           </div>
  )
}

export default SignOutButtons
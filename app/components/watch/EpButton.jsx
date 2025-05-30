import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation';

function EpButton({buttonEpPagination,ep}) {
    const router = useRouter();

    const EpClick = (epId)=>{
        console.log(epId);
      
        router.push(`${window.location.pathname}?ep=${epId}`);
    }

  return (
   <>

         <section className="w-full grid gap-1 grid-cols-15
                max-md:grid-cols-6
                max-lg:grid-cols-9
                
                pt-4 ">
                
              {buttonEpPagination?.map((anime, index) => (
                  <button
                  key={index}
                  onClick={()=>EpClick(anime.id)}
            
                  className={`${ep === anime.id ? 'bg-sky-300' : 'bg-white'} text-black rounded-sm  m-1 text-sm h-10 text-center font-bold cursor-pointer`}
>
                    {anime.number}
                  </button>
                ))}
              </section>
   
   </>
  )
}

export default EpButton
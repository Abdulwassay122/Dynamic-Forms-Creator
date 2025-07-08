import imge from './circle.png'
export default function Thanks() {
  return (
    <div className='flex items-center justify-center flex-col gap-5 mx-60 shadow mt-10 rounded-lg bg-gray-100 h-60  '>
        <img className='h-14 w-auto' src={imge} alt="" />
        <h1 className=' text-3xl font-semibold'>Thank you for your response!</h1>
    </div>
  )
}

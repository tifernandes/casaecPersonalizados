import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string
  dark?: boolean
}

const Phone = ({ imgSrc, className, dark = false, ...props }: PhoneProps) => {
  return (
    <div
      className={cn(
        'relative pointer-events-none z-50 overflow-hidden',
        className
      )}
      {...props}>
      <img
        src={
          dark
            ? '/shapeTacaGin.png'
            : '/shapeTacaGin.png'
        }
        className='pointer-events-none select-none'
        alt='phone image'
      />

      <div className='absolute z-50 inset-0'>
        <img
          className='absolute z-40 inset-0 md:w-28 md:h-20 w-24 h-16 mx-auto my-[25%] md:my-[30%]'
          src={imgSrc}
          alt='overlaying phone image'
        />
      </div>
    </div>
  )
}

export default Phone

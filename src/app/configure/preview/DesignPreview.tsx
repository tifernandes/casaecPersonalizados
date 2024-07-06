'use client'

import Phone from '@/components/Phone'
import { Button } from '@/components/ui/button'
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { cn, formatPrice } from '@/lib/utils'
import { COLORS, FINISHES, MODELS } from '@/validators/option-validator'
import { Configuration } from '@prisma/client'
import { useEffect, useState, useCallback } from 'react'
import Confetti from 'react-dom-confetti'
import { useRouter } from 'next/navigation'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import LoginModal from '@/components/LoginModal'
import ModalFrete from "@/components/ModalFrete"
import { ArrowRight, Check } from 'lucide-react'

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
  const router = useRouter()
  const { id } = configuration
  const { user } = useKindeBrowserClient()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false)
  const [isFrenetModal, setIsFrenetModal] = useState<boolean>(false)

  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  useEffect(() => setShowConfetti(true))

  const { color, model, finish, material } = configuration

  const tw = COLORS.find((supportedColor) => supportedColor.value === color)?.tw

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!

  let totalPrice = BASE_PRICE
  if (material === 'polycarbonate')
    totalPrice += PRODUCT_PRICES.material.polycarbonate
  if (finish === 'textured') totalPrice += PRODUCT_PRICES.finish.textured

  const handleEntrega = () => {
    setIsFrenetModal(true);
  }

  const backToCustomize = () => {
    router.push(`/configure/design?id=${id}`)
  }

  return (
    <>
      <div
        aria-hidden='true'
        className='pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center'>
        <Confetti
          active={showConfetti}
          config={{ elementCount: 200, spread: 90 }}
        />
      </div>

      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
      <ModalFrete setIsFrenetModal={setIsFrenetModal} isFrenetModal={isFrenetModal} idConfig={id} />

      <div className='mt-20 flex flex-col items-center text-sm'>
        <div className='md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2 flex flex-col items-center justify-center gap-3'>
          <div className='mt-6 sm:col-span-9 md:row-end-1'>
            <h3 className='text-3xl font-bold tracking-tight text-gray-900'>
              Conheça sua {modelLabel} customizada!
            </h3>
            <div className='mt-3 flex items-center gap-1.5 text-base text-center'>
              <Check className='h-4 w-4 text-green-500' />
              No estoque e pronto para envio
            </div>
          </div>
          <Phone
            className="max-w-[400px] w-full"
            imgSrc={configuration.croppedImageUrl!}
          />
          <Button
            onClick={() => backToCustomize()}
            size={'sm'}
            className='bg-slate-400 hover:bg-slate-500'>
            Refazer customizaçao
          </Button>
        </div>

        <div className='sm:col-span-12 md:col-span-9 text-base'>
          <div className='grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10'>
            <div>
              <p className='font-medium text-zinc-950'>Tenha o melhor</p>
              <ol className='mt-3 text-zinc-700 list-disc list-inside'>
                <li>Adesivo, transfer laser, silk e tampografia à sua escolha.</li>
                <li>Elegância que complementa o sabor refinado do Gin.</li>
                <li>Personalize com tons que combinam com sua personalidade</li>
              </ol>
            </div>
            <div>
              <p className='font-medium text-zinc-950'>Material</p>
              <ol className='mt-3 text-zinc-700 list-disc list-inside'>
                <li>Acrílico de alta qualidade para durabilidade.</li>
                <li>580ml</li>
                <li>115 gramas</li>
              </ol>
            </div>
          </div>

          <div className='mt-8'>
            {/* <div className='bg-gray-50 p-6 sm:rounded-lg sm:p-8'>
              <div className='flow-root text-sm'>
                <div className='flex items-center justify-between py-1 mt-2'>
                  <p className='text-gray-600'>Base price</p>
                  <p className='font-medium text-gray-900'>
                    {formatPrice(BASE_PRICE / 100)}
                  </p>
                </div>

                {finish === 'textured' ? (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Textured finish</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice(PRODUCT_PRICES.finish.textured / 100)}
                    </p>
                  </div>
                ) : null}

                {material === 'polycarbonate' ? (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Soft polycarbonate material</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice(PRODUCT_PRICES.material.polycarbonate / 100)}
                    </p>
                  </div>
                ) : null}

                <div className='my-2 h-px bg-gray-200' />

                <div className='flex items-center justify-between py-2'>
                  <p className='font-semibold text-gray-900'>Order total</p>
                  <p className='font-semibold text-gray-900'>
                    {formatPrice(totalPrice / 100)}
                  </p>
                </div>
              </div>
            </div> */}

            <div className='space-y-6 pt-10 text-sm'>
              <div className='flex justify-between'>
                <p className='font-medium text-zinc-900'>Subtotal</p>
                <p className='text-zinc-700'>{formatPrice(10)}</p>
              </div>
              <div className='flex justify-between'>
                <p className='font-medium text-zinc-900'>Entrega</p>
                <p className='text-zinc-700'>A Calcular</p>
              </div>
              <div className='flex justify-between'>
                <p className='font-medium text-zinc-900'>Total</p>
                <p className='text-zinc-700'>{formatPrice(10)}</p>
              </div>
            </div>

            <div className='mt-8 flex justify-end pb-12'>
              <Button
                onClick={() => handleEntrega()}
                className='px-4 sm:px-6 lg:px-8'>
                Fechar pedido <ArrowRight className='h-4 w-4 ml-1.5 inline' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DesignPreview

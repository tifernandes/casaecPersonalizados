'use server'

import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Order } from '@prisma/client'

export const createCheckoutSession = async ({
  configId,
  logi,
  userEnd
}: {
  configId: string,
  logi: string,
  userEnd: any // Use `any` for flexibility; ideally, create a proper type/interface
}) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  })

  if (!configuration) {
    throw new Error('No such configuration found')
  }

  const { getUser } = getKindeServerSession()
  const user = await getUser()
  
  const { finish, material } = configuration
  let price = BASE_PRICE
  if (finish === 'textured') price += PRODUCT_PRICES.finish.textured
  if (material === 'polycarbonate')
    price += PRODUCT_PRICES.material.polycarbonate

  let order: Order | undefined = undefined

  const existingOrder = await db.order.findFirst({
    where: {
      // userId: user.id,
      configurationId: configuration.id,
    },
  })

  if (existingOrder) {
    order = existingOrder
  } else {
    order = await db.order.create({
      data: {
        amount: price / 100,
        configurationId: configuration.id,
      },
    })
  }

  const product = await stripe.products.create({
    name: 'Produto customizado - CasaEc',
    images: [configuration.imageUrl],
    default_price_data: {
      currency: 'BRL',
      unit_amount: price,
    },
  })

  const logiPreco = parseInt(logi.split('-')[1])
  const frete = await stripe.products.create({
    name: 'Servico de entrega',
    default_price_data: {
      currency: 'BRL',
      unit_amount: logiPreco * 100,
    },
  })

  const shippingAddress = {
    line1: userEnd.logradouro,
    city: userEnd.localidade,
    state: userEnd.uf,
    postal_code: userEnd.cep,
    country: 'BR',
  }

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ['card'],
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['BR'] },
    metadata: {
      orderId: order.id,
      shippingAddress: JSON.stringify(shippingAddress), // Include the address in metadata
    },
    line_items: [
      { price: product.default_price as string, quantity: 1 },
      { price: frete.default_price as string, quantity: 1 }
    ],
  })

  return { url: stripeSession.url }
}

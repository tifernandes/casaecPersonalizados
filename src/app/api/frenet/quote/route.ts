import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const body = await req.json();

    console.log(body)

    const cep = body.CepValue

    const payload = {
        SellerCEP: process.env.CEP_ORIGEM!,
        RecipientCEP: '14270000',
        ShipmentInvoiceValue: 320.685,
        ShippingServiceCode: null,
        ShippingItemArray: [
          {
            Height: 2,
            Length: 33,
            Quantity: 1,
            Weight: 1.18,
            Width: 47,
            SKU: 'IDW_54626',
            Category: 'Running',
          },
          {
            Height: 5,
            Length: 15,
            Quantity: 1,
            Weight: 0.5,
            Width: 29,
          },
        ],
        RecipientCountry: 'BR',
      };

    try {
        const response = await fetch(`https://api.frenet.com.br/shipping/quote`, {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'token': process.env.FRENET_TOKEN!
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        console.log(`data`)
        console.log(data)

        return NextResponse.json({ result: data, ok: true })
    } catch (error: any) {
    return NextResponse.json(
        { message: 'Something went wrong', ok: false },
        { status: 500 }
      )
    }
}

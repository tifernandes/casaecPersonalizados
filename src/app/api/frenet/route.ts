import { NextResponse } from 'next/server'

function formatCep(cep: string) {
    console.log(`cep`)
    console.log(cep)
    // Remove quaisquer caracteres não numéricos do CEP
    const cleanedCep = cep.replace(/\D/g, '');
  
    // Verifica se o CEP tem o comprimento correto
    if (cleanedCep.length !== 8) {
      throw new Error('CEP deve conter exatamente 8 dígitos.');
    }
  
    // Insere o hífen na posição correta
    const formattedCep = `${cleanedCep.slice(0, 5)}-${cleanedCep.slice(5)}`;
  
    return formattedCep;
}

export async function POST(req: Request) {
    const body = await req.json();
    console.log(`body`)
    console.log(body)
    const cep = formatCep(body.cepValueInput)

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
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

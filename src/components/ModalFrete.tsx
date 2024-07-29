"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash';
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { createCheckoutSession } from '../app/configure/preview/actions'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { ReloadIcon } from "@radix-ui/react-icons"

const FormSchema = z.object({
  cep: z.string().min(7, {
    message: "Cep deve ter 8 caracteres.",
  }),
  cidade: z.string().min(2, {
    message: "Cidade deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "Cidade deve ter no máximo 100 caracteres.",
  }),
  Bairro: z.string().min(2, {
    message: "Bairro deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "Bairro deve ter no máximo 100 caracteres.",
  }),
  Rua: z.string().min(2, {
    message: "Rua deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "Rua deve ter no máximo 100 caracteres.",
  }),
  Estado: z.string().length(2, {
    message: "Estado deve ter exatamente 2 caracteres.",
  }),
  Complemento: z.string().optional(),
  logi: z.string({
    required_error: "Selecione um serviço de entrega",
  }).min(1, {
    message: "O campo de serviço de entrega não pode ser vazio.",
  }),
});

interface UserEnd {
  localidade: string;
  bairro: string;
  logradouro: string;
  uf: string;
  complemento: string;
}

interface logistica {
  ServiceCode: string;
  ServiceDescription: string;
  ShippingPrice: string;
  DeliveryTime: string;
}

export default function ModalFrete({
    isFrenetModal,
    setIsFrenetModal,
    idConfig,
  }: {
    isFrenetModal: boolean
    setIsFrenetModal: Dispatch<SetStateAction<boolean>>
    idConfig: string
  }) {
    const router = useRouter()
    const [userEnd, setUserEnd] = useState<UserEnd>({
      localidade: "",
      bairro: "",
      logradouro: "",
      uf: "",
      complemento: "",
    })
    const [cepValue, setCepValue] = useState<string>('')
    const [logistica, setLogistica] = useState<Array<logistica>>([])
    const [errorCep, setErrorCep] = useState<string>('')
    const [loadingSeguirPag, setLoadingSeguirPag] = useState<boolean>(false)

    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
    })
   
    function onSubmit(data: z.infer<typeof FormSchema>) {

      setLoadingSeguirPag(true);
      localStorage.setItem('configurationId', idConfig)
      createPaymentSession({ configId: idConfig, logi: data.logi, userEnd })
    }

    const handleQuotes = async () => {
        console.log('chamando api quote')
        const res = await fetch('/api/frenet/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cepValue }),
        });
    
        const data = await res.json();
        setLogistica(data.result.ShippingSevicesArray.filter((i: logistica) => i.ServiceCode != "04227"));
        console.log(data)
    }

    useEffect(() => {
      console.log("userEnd has been updated");
      console.log(userEnd);
      form.reset({
        cep: cepValue,
        cidade: userEnd.localidade,
        Bairro: userEnd.bairro,
        Rua: userEnd.logradouro,
        Estado: userEnd.uf
      });
    }, [userEnd]); // Executa quando userEnd mudar
    
    const handleCEPCalc = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        await debouncedFetchCep(event.target.value);
    }, []);
    
    const debouncedFetchCep = debounce(async (cepValueInput) => {

      setErrorCep('');

    if(cepValueInput.length >= 7){
        console.log('chamando api')
        console.log(cepValueInput)
        const res = await fetch('/api/frenet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cepValueInput }),
        });
    
        const data = await res.json();
        setUserEnd(data.result);

        setCepValue(cepValueInput);

        if(data.result.Message != null){
          setErrorCep(data.result.Message);
        }
        handleQuotes();
    }
    }, 300);

    const { mutate: createPaymentSession } = useMutation({
      mutationKey: ['get-checkout-session'],
      mutationFn: createCheckoutSession,
      onSuccess: ({ url }) => {
        if (url) router.push(url)
        else throw new Error('Unable to retrieve payment URL.')
      },
      onError: () => {
        console.log('Error na criacao de payment')
      },
    })

  return (
    <Sheet onOpenChange={setIsFrenetModal} open={isFrenetModal}>
    <SheetContent className='overflow-y-scroll max-h-screen sm:max-w-[650px] w-[400px] sm:w-[650px] z-[9999999]'>
      <SheetHeader>
        <SheetTitle className='text-3xl text-center font-bold tracking-tight text-gray-900'>
          Entrega
        </SheetTitle>
        <SheetDescription className='text-base text-center py-2'>
          <span className='font-medium text-zinc-900'>
            Preencha as informaçoes de entrega
          </span>
        </SheetDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem className="flex items-start flex-col">
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="digite seu CEP" onChangeCapture={handleCEPCalc} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {userEnd.localidade != "" && (
            <div>
              <div className='grid md:grid-cols-2 gap-4 pt-4 grid-cols-1'>
                {errorCep ==  '' && (
                  <>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem className="flex items-start flex-col">
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="Bairro"
                      render={({ field }) => (
                        <FormItem className="flex items-start flex-col">
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="Rua"
                      render={({ field }) => (
                        <FormItem className="flex items-start flex-col">
                          <FormLabel>Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1">
                    <FormField
                      control={form.control}
                      name="Estado"
                      render={({ field }) => (
                        <FormItem className="flex items-start flex-col">
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" defaultValue={field.value} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  </>
                )}
                <div className="grid w-full items-center gap-1">
                  <FormField
                    control={form.control}
                    name="Complemento"
                    render={({ field }) => (
                      <FormItem className="flex items-start flex-col">
                        <FormLabel>Complemento (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Complemento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className='w-full p-6 bg-slate-100 rounded-sm my-5'>
                <FormField
                  control={form.control}
                  name="logi"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                      <RadioGroup onValueChange={field.onChange} className="gap-5">
                        {logistica.map((logi) => {
                          return(
                            <div key={logi.ServiceCode} className="flex items-center space-x-2">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={logi.ServiceDescription + - + logi.ShippingPrice} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="grid md:grid-cols-2 grid-cols-2 gap-10">
                                    <p className="flex gap-1.5 flex-col w-[140px]">
                                      {logi.ServiceDescription}
                                      <p className='text-green-600'>{logi.DeliveryTime} dias uteis</p>
                                    </p>
                                    <p className="flex items-center justify-center">R${logi.ShippingPrice} </p>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            </div>
                          )
                        })}
                      </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex items-end justify-end">
                {!loadingSeguirPag ? (
                <Button
                className='px-4 w-full sm:px-6 lg:px-8'>
                  Seguir ao pagamento <ArrowRight className='h-4 w-4 ml-1.5 inline' />
                </Button>
                ) : (
                  <Button disabled className='px-4 w-full sm:px-6 lg:px-8'>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Redirecionando
                  </Button>
                )}
              </div>
            </div>
          )}
          </form>
        </Form>
      </SheetHeader>
    </SheetContent>
  </Sheet>
  )
}
